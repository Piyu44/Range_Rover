"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getTotalFrames } from '../lib/frameSequences';

interface PartLabel {
  id: string;
  name: string;
  description: string;
  frameStart: number;
  frameEnd: number;
  position: {
    x: string;
    y: string;
  };
}

// Define car parts with their visibility frames and positions
const partLabels: PartLabel[] = [
  {
    id: 'headlight',
    name: 'LED Headlight',
    description: 'Advanced adaptive LED technology with pixel matrix',
    frameStart: 200,
    frameEnd: 800,
    position: { x: '25%', y: '45%' }
  },
  {
    id: 'grille',
    name: 'Signature Grille',
    description: 'Iconic Range Rover grille with chrome accents',
    frameStart: 300,
    frameEnd: 900,
    position: { x: '50%', y: '50%' }
  },
  {
    id: 'hood',
    name: 'Sculpted Hood',
    description: 'Aerodynamically optimized aluminum hood',
    frameStart: 400,
    frameEnd: 1000,
    position: { x: '50%', y: '35%' }
  },
  {
    id: 'wheel',
    name: 'Alloy Wheel',
    description: '22-inch forged alloy wheels with diamond finish',
    frameStart: 600,
    frameEnd: 1400,
    position: { x: '30%', y: '70%' }
  },
  {
    id: 'door',
    name: 'Coach Door',
    description: 'Soft-close doors with hidden handles',
    frameStart: 800,
    frameEnd: 1600,
    position: { x: '45%', y: '55%' }
  },
  {
    id: 'mirror',
    name: 'Side Mirror',
    description: 'Auto-dimming mirror with integrated turn signal',
    frameStart: 700,
    frameEnd: 1300,
    position: { x: '35%', y: '45%' }
  },
  {
    id: 'engine',
    name: 'V8 Engine',
    description: '523hp twin-supercharged V8 powerhouse',
    frameStart: 1200,
    frameEnd: 2000,
    position: { x: '50%', y: '60%' }
  },
  {
    id: 'suspension',
    name: 'Air Suspension',
    description: 'Dynamic air suspension with terrain response',
    frameStart: 1400,
    frameEnd: 2200,
    position: { x: '40%', y: '75%' }
  },
  {
    id: 'transmission',
    name: '8-Speed Transmission',
    description: 'Quickshift automatic transmission',
    frameStart: 1500,
    frameEnd: 2300,
    position: { x: '55%', y: '65%' }
  },
  {
    id: 'exhaust',
    name: 'Sport Exhaust',
    description: 'Active exhaust with variable valve control',
    frameStart: 1800,
    frameEnd: 2600,
    position: { x: '60%', y: '75%' }
  },
  {
    id: 'rear-light',
    name: 'LED Taillight',
    description: 'Slim LED taillights with signature DRL',
    frameStart: 2000,
    frameEnd: 2800,
    position: { x: '75%', y: '45%' }
  },
  {
    id: 'trunk',
    name: 'Power Tailgate',
    description: 'Hands-free powered tailgate with gesture control',
    frameStart: 2200,
    frameEnd: 3000,
    position: { x: '65%', y: '55%' }
  },
  // Disassembled parts (final phase)
  {
    id: 'seat',
    name: 'Executive Seat',
    description: '24-way adjustable massage seats with climate control',
    frameStart: 3000,
    frameEnd: 4800,
    position: { x: '30%', y: '50%' }
  },
  {
    id: 'dashboard',
    name: 'Digital Dashboard',
    description: '13.1-inch curved floating touchscreen',
    frameStart: 3000,
    frameEnd: 4800,
    position: { x: '50%', y: '40%' }
  },
  {
    id: 'steering',
    name: 'Steering Wheel',
    description: 'Heated leather steering with haptic feedback',
    frameStart: 3000,
    frameEnd: 4800,
    position: { x: '45%', y: '55%' }
  },
  {
    id: 'console',
    name: 'Center Console',
    description: 'Wireless charging with premium storage',
    frameStart: 3000,
    frameEnd: 4800,
    position: { x: '55%', y: '60%' }
  },
  {
    id: 'speaker',
    name: 'Meridian Sound',
    description: '35-speaker surround sound system',
    frameStart: 3000,
    frameEnd: 4800,
    position: { x: '70%', y: '45%' }
  },
];

interface AnimationOverlayProps {
  currentFrame: number;
  isHoverMode: boolean;
}

const AnimationOverlay: React.FC<AnimationOverlayProps> = ({ currentFrame, isHoverMode }) => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const totalFrames = getTotalFrames();
  
  // Determine which phase we're in
  const isInitialPhase = currentFrame < 200;
  const isDismantlingPhase = currentFrame >= 200 && currentFrame < 3000;
  const isFinalPhase = currentFrame >= 3000;

  // Get visible parts for current frame (dismantling phase)
  const visibleParts = partLabels.filter(
    part => part.frameStart <= currentFrame && part.frameEnd >= currentFrame && !isFinalPhase
  );

  // Get final phase parts
  const finalParts = partLabels.filter(part => part.frameStart <= 3000);

  return (
    <div className="animation-overlay">
      {/* Phase 1: Initial RANGE ROVER title */}
      {isInitialPhase && (
        <div 
          className="initial-title glass-panel"
          style={{
            opacity: 1 - (currentFrame / 200),
            transform: `translateY(${currentFrame / 10}px)`
          }}
        >
          <h1 className="range-rover-title">RANGE ROVER</h1>
          <p className="range-rover-subtitle">The Pinnacle of Luxury SUVs</p>
        </div>
      )}

      {/* Phase 2: Part labels during dismantling */}
      {isDismantlingPhase && !isHoverMode && (
        <>
          {visibleParts.map((part) => {
            const progress = (currentFrame - part.frameStart) / (part.frameEnd - part.frameStart);
            const fadeIn = Math.min(1, progress * 5);
            const fadeOut = Math.min(1, (part.frameEnd - currentFrame) / 200);
            const opacity = Math.min(fadeIn, fadeOut);
            
            return (
              <div
                key={part.id}
                className="part-label glass-panel"
                style={{
                  left: part.position.x,
                  top: part.position.y,
                  opacity: opacity,
                  transform: `translate(-50%, -50%) scale(${0.9 + opacity * 0.1})`
                }}
              >
                <div className="part-indicator"></div>
                <div className="part-content">
                  <h3 className="part-name">{part.name}</h3>
                  <p className="part-description">{part.description}</p>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Phase 3: Hover-activated labels (final phase) */}
      {isFinalPhase && (
        <>
          {finalParts.map((part) => (
            <div
              key={part.id}
              className="interactive-part-zone"
              style={{
                left: part.position.x,
                top: part.position.y,
                width: '120px',
                height: '120px'
              }}
              onMouseEnter={() => setHoveredPart(part.id)}
              onMouseLeave={() => setHoveredPart(null)}
            />
          ))}
          
          {hoveredPart && (() => {
            const part = finalParts.find(p => p.id === hoveredPart);
            if (!part) return null;
            
            return (
              <div
                className="hover-part-label glass-panel premium"
                style={{
                  left: part.position.x,
                  top: part.position.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="part-indicator active"></div>
                <div className="part-content">
                  <h3 className="part-name">{part.name}</h3>
                  <p className="part-description">{part.description}</p>
                  <div className="part-specs">
                    <span className="spec-badge">Premium</span>
                    <span className="spec-badge">Handcrafted</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Progress indicator */}
      <div className="scroll-progress">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${(currentFrame / totalFrames) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};

export default AnimationOverlay;
