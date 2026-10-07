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

    // 1. Initialize Lenis Smooth Scrolling with Fluid 90FPS Response
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.15, // Responsive, high-framerate scroll feel
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

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    // 4. Directional Predictive Preloader with Controlled Concurrency
    const loadingSet = new Set<number>();

    function loadSingleImage(idx: number, onLoaded?: () => void) {
      if (idx < 0 || idx >= totalFrames) return;
      if (imagesRef.current[idx] || loadingSet.has(idx)) return;

      loadingSet.add(idx);
      const img = new Image();
      img.onload = () => {
        imagesRef.current[idx] = img;
        loadingSet.delete(idx);
        if (onLoaded) onLoaded();

        const currentTarget = Math.min(totalFrames - 1, Math.max(0, Math.round(playheadRef.current.frame)));
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
      if (Math.abs(center - lastLoadedCenter) < 3) return;
      lastLoadedCenter = center;

      // Generous buffer for fast 90fps scroll velocity
      const forwardCount = 45;
      const backwardCount = 18;

      const start = direction >= 0 ? center - backwardCount : center - forwardCount;
      const end = direction >= 0 ? center + forwardCount : center + backwardCount;

      for (let i = center; i <= Math.min(totalFrames - 1, end); i++) {
        loadSingleImage(i);
      }
      for (let i = center - 1; i >= Math.max(0, start); i--) {
        loadSingleImage(i);
      }
    }

    // Priority Load Frame 0 (start) and final frame (end of website) immediately
    loadSingleImage(0, () => {
      drawFrame(0);
      // Preload initial forward buffer
      for (let i = 1; i <= 30; i++) {
        loadSingleImage(i);
      }
    });

    // Ensure the final frame is pre-cached so reaching the end of the site is instantaneous
    loadSingleImage(totalFrames - 1);
    for (let i = totalFrames - 2; i >= Math.max(0, totalFrames - 15); i--) {
      loadSingleImage(i);
    }

    // 5. GSAP Smooth Scrub Setup
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Responsive scroll pacing tuned for fluid ~90fps scrub playback
    const scrollTrackHeight = Math.max(window.innerHeight * 3, Math.round(totalFrames * 4.2));
    scrollContainer.style.height = `${scrollTrackHeight}px`;

    let lastProgress = 0;
    const tween = gsap.to(playheadRef.current, {
      frame: totalFrames - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6, // Low-latency, ultra-smooth continuous tracking for 90fps feel
        onUpdate: (self) => {
          const direction = self.progress >= lastProgress ? 1 : -1;
          lastProgress = self.progress;

          // If at the very end of the website, strictly lock to the final frame
          if (self.progress >= 0.999) {
            drawFrame(totalFrames - 1);
            return;
          }

          const targetIndex = Math.min(totalFrames - 1, Math.max(0, Math.round(playheadRef.current.frame)));
          
          // Emit telemetry to Luxury HUD
          window.dispatchEvent(
            new CustomEvent('animation-telemetry', {
              detail: {
                frame: targetIndex,
                progress: self.progress,
                sequenceIndex: Math.min(4, Math.floor((targetIndex / totalFrames) * 5)),
                totalFrames,
              },
            })
          );

          loadFramesAround(targetIndex, direction);
        },
      },
      onUpdate: () => {
        // At the bottom of the page, ensure the last image is displayed
        if (playheadRef.current.frame >= totalFrames - 1.05) {
          drawFrame(totalFrames - 1);
        } else {
          const frameIdx = Math.min(totalFrames - 1, Math.max(0, Math.round(playheadRef.current.frame)));
          drawFrame(frameIdx);
        }
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
