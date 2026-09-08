"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { getTotalFrames } from '../lib/frameSequences';
import { getFrameUrl } from '../lib/frameUtils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ScrollFrameAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const lastRenderedIndexRef = useRef<number>(-1);
  const playheadRef = useRef({ frame: 0 });

  const totalFrames = getTotalFrames();

  useEffect(() => {
    const canvas = canvasRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!canvas || !scrollContainer) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // 1. Initialize Lenis Smooth Scrolling with Controlled Cinematic Pacing
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05, // Controlled, measured scroll response
      touchMultiplier: 1.8,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 2. High-DPI Canvas Resizing
    function resizeCanvas() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      drawFrame(Math.round(playheadRef.current.frame));
    }

    // 3. Core Drawing Logic with Nearest-Frame Fallback (No Flickering / Freezing)
    function drawFrame(index: number) {
      if (!ctx || !canvas) return;
      if (index < 0) index = 0;
      if (index >= totalFrames) index = totalFrames - 1;

      let img = imagesRef.current[index];
      let resolvedIndex = index;

      if (!img || !img.complete || img.naturalWidth === 0) {
        // Search outward for nearest loaded frame to preserve continuous visual flow
        let found = false;
        for (let offset = 1; offset <= 75; offset++) {
          const prev = index - offset;
          if (prev >= 0 && imagesRef.current[prev]?.complete && (imagesRef.current[prev]?.naturalWidth || 0) > 0) {
            img = imagesRef.current[prev];
            resolvedIndex = prev;
            found = true;
            break;
          }
          const next = index + offset;
          if (next < totalFrames && imagesRef.current[next]?.complete && (imagesRef.current[next]?.naturalWidth || 0) > 0) {
            img = imagesRef.current[next];
            resolvedIndex = next;
            found = true;
            break;
          }
        }

        loadFramesAround(index);

        if (!found || !img || !img.complete || img.naturalWidth === 0) {
          return;
        }
      }

      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;
      const canvasRatio = viewWidth / viewHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let drawWidth = viewWidth;
      let drawHeight = viewHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = viewHeight * imgRatio;
        offsetX = (viewWidth - drawWidth) / 2;
      } else {
        drawHeight = viewWidth / imgRatio;
        offsetY = (viewHeight - drawHeight) / 2;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, viewWidth, viewHeight);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      lastRenderedIndexRef.current = resolvedIndex;
    }

    // 4. Directional Predictive Preloader
    const loadingSet = new Set<number>();

    function loadSingleImage(idx: number, onLoaded?: () => void) {
      if (idx < 0 || idx >= totalFrames) return;
      if (imagesRef.current[idx] || loadingSet.has(idx)) return;

      loadingSet.add(idx);
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        imagesRef.current[idx] = img;
        loadingSet.delete(idx);
        if (onLoaded) onLoaded();

        const currentTarget = Math.round(playheadRef.current.frame);
        if (Math.abs(currentTarget - idx) <= 1) {
          drawFrame(currentTarget);
        }
      };
      img.onerror = () => {
        loadingSet.delete(idx);
      };
      img.src = getFrameUrl(idx);
    }

    let lastLoadedCenter = -1;
    function loadFramesAround(center: number, direction: number = 1) {
      if (Math.abs(center - lastLoadedCenter) < 5) return;
      lastLoadedCenter = center;

      const forwardCount = 80;
      const backwardCount = 25;

      const start = direction >= 0 ? center - backwardCount : center - forwardCount;
      const end = direction >= 0 ? center + forwardCount : center + backwardCount;

      for (let i = center; i <= Math.min(totalFrames - 1, end); i++) {
        loadSingleImage(i);
      }
      for (let i = center - 1; i >= Math.max(0, start); i--) {
        loadSingleImage(i);
      }
    }

    // Initial frame loading
    for (let i = 0; i < 60; i++) {
      loadSingleImage(i, () => {
        if (i === 0) drawFrame(0);
      });
    }

    // Sparse background cache of keyframes (every 8th frame) for instant scrubbing preview
    let idleKeyframe = 0;
    let idleTimer: number;
    function loadSparseKeyframes() {
      if (idleKeyframe >= totalFrames) return;
      loadSingleImage(idleKeyframe);
      idleKeyframe += 8;
      idleTimer = window.setTimeout(loadSparseKeyframes, 20);
    }
    idleTimer = window.setTimeout(loadSparseKeyframes, 300);

    // 5. GSAP Smooth Scrub Setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Measured, smooth cinematic scrub pacing (~4.8px per frame)
    // Provides a deliberate, slower pace so you can see every frame unfold clearly
    const scrollTrackHeight = Math.max(window.innerHeight * 3, Math.round(totalFrames * 4.8));
    scrollContainer.style.height = `${scrollTrackHeight}px`;

    let lastProgress = 0;
    const tween = gsap.to(playheadRef.current, {
      frame: totalFrames - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0, // Smooth continuous inertia with controlled speed
        onUpdate: (self) => {
          const direction = self.progress >= lastProgress ? 1 : -1;
          lastProgress = self.progress;
          const targetIndex = Math.round(playheadRef.current.frame);
          
          // Emit telemetry to Luxury HUD
          window.dispatchEvent(
            new CustomEvent('animation-telemetry', {
              detail: {
                frame: targetIndex,
                progress: self.progress,
                sequenceIndex: Math.min(4, Math.floor(targetIndex / 960)),
                totalFrames,
              },
            })
          );

          loadFramesAround(targetIndex, direction);
        },
      },
      onUpdate: () => {
        const frameIdx = Math.round(playheadRef.current.frame);
        drawFrame(frameIdx);
      },
    });

    // Support smooth waypoint seeking from Luxury HUD
    const handleSeekToProgress = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      if (customEvent.detail && typeof customEvent.detail.progress === 'number') {
        const maxScroll = scrollTrackHeight - window.innerHeight;
        const targetScroll = customEvent.detail.progress * maxScroll;
        lenis.scrollTo(targetScroll, { duration: 1.4 });
      }
    };
    window.addEventListener('seek-to-progress', handleSeekToProgress);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('seek-to-progress', handleSeekToProgress);
      window.clearTimeout(idleTimer);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      tween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      imagesRef.current = [];
    };
  }, [totalFrames]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          backgroundColor: '#000',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100vw',
            height: '100vh',
          }}
        />
      </div>
      
      <div
        ref={scrollContainerRef}
        style={{
          width: '100%',
          zIndex: 0,
          position: 'relative',
        }}
      />
    </>
  );
};

export default ScrollFrameAnimation;
