"use client";

import React, { useState, useEffect, useRef } from 'react';

export interface CarPart {
  id: string;
  name: string;
  category: string;
  sequences: number[]; // which sequences (0 to 4) this part is prominent in
  relativePos: { rx: number; ry: number; radius: number }; // normalized 0..1 relative to car bounding box
  headline: string;
  description: string;
  specs: { label: string; value: string }[];
}

const CAR_PARTS: CarPart[] = [
  {
    id: "headlights",
    name: "Digital LED Headlights",
    category: "LIGHTING ARCHITECTURE",
    sequences: [0, 1, 4],
    relativePos: { rx: 0.28, ry: 0.44, radius: 0.12 },
    headline: "1.2 Million Micro-Mirrors With 500m Beam",
    description: "High-definition predictive headlights project beam patterns tailored to the road ahead using GPS data to anticipate curves before steering input.",
    specs: [
      { label: "RANGE", value: "500 Metres" },
      { label: "ELEMENTS", value: "1.2M Micro-Mirrors" },
      { label: "FEATURE", value: "Adaptive Anti-Glare" }
    ]
  },
  {
    id: "grille",
    name: "Signature Atlas Grille",
    category: "FRONT FASCIA",
    sequences: [0, 1],
    relativePos: { rx: 0.48, ry: 0.50, radius: 0.14 },
    headline: "Engineered Aerodynamic Active Vanes",
    description: "Precision-etched satin chrome grille incorporates active shutter vanes that dynamically adjust to optimize thermal cooling and aerodynamic drag coefficient.",
    specs: [
      { label: "FINISH", value: "Satin Atlas Chrome" },
      { label: "AERO CD", value: "0.30 Drag Coefficient" },
      { label: "COOLING", value: "Active Shutter Vanes" }
    ]
  },
  {
    id: "hood",
    name: "Sculpted Aluminium Clamshell Hood",
    category: "BODY ARCHITECTURE",
    sequences: [0, 1, 2],
    relativePos: { rx: 0.46, ry: 0.32, radius: 0.16 },
    headline: "Zero-Tolerance Laser Welded Tolerance",
    description: "Crafted from aerospace-grade superformed aluminium, the iconic clamshell bonnet features fewer shut lines for an uninterrupted, monolithic surface.",
    specs: [
      { label: "MATERIAL", value: "Superformed Aluminium" },
      { label: "CONSTRUCTION", value: "Monolithic Stamped" },
      { label: "RIGIDITY", value: "+50% Torsional Stiffness" }
    ]
  },
  {
    id: "wheels",
    name: "23\" Forged Diamond-Turned Wheels",
    category: "CHASSIS & DYNAMICS",
    sequences: [0, 1, 2, 4],
    relativePos: { rx: 0.26, ry: 0.72, radius: 0.14 },
    headline: "Reduced Unsprung Mass with Brembo® Brakes",
    description: "Ultra-lightweight forged construction engineered specifically for active electronic air suspension, paired with bespoke 400mm Brembo carbon-silicon brakes.",
    specs: [
      { label: "DIAMETER", value: "23 Inches" },
      { label: "BRAKES", value: "400mm Brembo Dual-Cast" },
      { label: "TYRES", value: "Noise-Cancelling Foam Core" }
    ]
  },
  {
    id: "door-handles",
    name: "Flush Deployable Handles",
    category: "EXTERIOR REFINEMENT",
    sequences: [1, 2],
    relativePos: { rx: 0.56, ry: 0.52, radius: 0.10 },
    headline: "Integrated Proximity Soft-Close Technology",
    description: "Hidden within the door skin until approached, deployable handles glide out silently and seal flush with micro-tolerances when in motion to eliminate wind turbulence.",
    specs: [
      { label: "OPERATION", value: "Keyless Proximity" },
      { label: "CLOSURE", value: "Power Soft-Close" },
      { label: "LIGHTING", value: "Concealed LED Puddle" }
    ]
  },
  {
    id: "roofline",
    name: "Floating Roof & Privacy Glazing",
    category: "ICONIC SILHOUETTE",
    sequences: [1, 2, 3],
    relativePos: { rx: 0.58, ry: 0.24, radius: 0.15 },
    headline: "Acoustic Double-Glazed Laminated Glass",
    description: "The unmistakable falling roofline rests on glossy black pillars to create the iconic floating effect, featuring 4.5mm solar attenuating acoustic glass.",
    specs: [
      { label: "GLASS", value: "4.5mm Laminated Acoustic" },
      { label: "ROOF", value: "Panoramic Sliding Glass" },
      { label: "SOLAR", value: "Infrared Attenuation" }
    ]
  },
  {
    id: "taillights",
    name: "Hidden-Until-Lit Vertical Taillamps",
    category: "REAR LIGHTING",
    sequences: [2, 3, 4],
    relativePos: { rx: 0.78, ry: 0.46, radius: 0.12 },
    headline: "Vivid Red LED Blade Hidden in Glass",
    description: "Integrated into a solid black gloss tailgate panel, the tail lamps appear completely invisible until illuminated, utilizing high-intensity micro-LED blades.",
    specs: [
      { label: "TECHNOLOGY", value: "Hidden-Until-Lit LED" },
      { label: "INTEGRATION", value: "Gloss Black Horizontal Bar" },
      { label: "ANIMATION", value: "Dynamic Welcome Sequence" }
    ]
  },
  {
    id: "exhaust",
    name: "Quad Outlets & Rear Diffuser",
    category: "PERFORMANCE EXHAUST",
    sequences: [3, 4],
    relativePos: { rx: 0.72, ry: 0.76, radius: 0.11 },
    headline: "Active Valve Acoustic Exhaust System",
    description: "Dual active exhaust valves modulate exhaust backpressure and tone, transitioning seamlessly between whisper-quiet cruising and an authoritative V8 growl.",
    specs: [
      { label: "CONFIGURATION", value: "Quad Concealed Outlets" },
      { label: "ACOUSTICS", value: "Dual Electronic Valves" },
      { label: "AERO", value: "Underbody Ground Diffuser" }
    ]
  }
];

export default function InteractiveCarParts() {
  const [activePart, setActivePart] = useState<CarPart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<CarPart | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentSequence, setCurrentSequence] = useState<number>(0);
  const [carBounds, setCarBounds] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Calculate rendered car image bounding box on canvas
  const updateCarBounds = () => {
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const imgRatio = 16 / 9; // standard ratio of the frame renders
    const canvasRatio = viewWidth / viewHeight;

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

    setCarBounds({ x: offsetX, y: offsetY, width: drawWidth, height: drawHeight });
  };

  useEffect(() => {
    updateCarBounds();
    window.addEventListener('resize', updateCarBounds);

    const handleTelemetry = (e: Event) => {
      const customEvent = e as CustomEvent<{ sequenceIndex: number }>;
      if (customEvent.detail && typeof customEvent.detail.sequenceIndex === 'number') {
        setCurrentSequence(customEvent.detail.sequenceIndex);
      }
    };

    window.addEventListener('animation-telemetry', handleTelemetry);
    return () => {
      window.removeEventListener('resize', updateCarBounds);
      window.removeEventListener('animation-telemetry', handleTelemetry);
    };
  }, []);

  // Filter parts relevant to current angle/sequence
  const visibleParts = CAR_PARTS.filter(p => p.sequences.includes(currentSequence));

  // Detect mouse hover over car part hot-zones
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCursorPos({ x: e.clientX, y: e.clientY });

    if (carBounds.width === 0 || carBounds.height === 0) return;

    // Convert mouse to relative car coordinates (0 to 1)
    const relX = (e.clientX - carBounds.x) / carBounds.width;
    const relY = (e.clientY - carBounds.y) / carBounds.height;

    // Check if within any part hot-zone
    let found: CarPart | null = null;
    for (const part of visibleParts) {
      const dx = relX - part.relativePos.rx;
      const dy = relY - part.relativePos.ry;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= part.relativePos.radius) {
        found = part;
        break;
      }
    }

    setHoveredPart(found);
  };

  const handleContainerClick = () => {
    if (hoveredPart) {
      setActivePart(hoveredPart);
    }
  };

  return (
    <div 
      className="interactive-parts-surface"
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
    >
      {/* 1. Dynamic Hover Tag following Cursor/Hotspot */}
      {hoveredPart && !activePart && (
        <div 
          className="car-part-hover-badge"
          style={{ 
            left: `${cursorPos.x + 18}px`, 
            top: `${cursorPos.y - 32}px` 
          }}
        >
          <span className="hover-badge-dot"></span>
          <div className="hover-badge-text">
            <span className="hover-badge-category">{hoveredPart.category}</span>
            <span className="hover-badge-name">{hoveredPart.name}</span>
          </div>
          <span className="hover-badge-action">CLICK TO INSPECT</span>
        </div>
      )}

      {/* 2. Glassmorphism Description Rectangle Popover */}
      {activePart && (
        <div 
          className="glass-part-popover-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            setActivePart(null);
          }}
        >
          <div 
            className="glass-part-popover-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popover Header */}
            <div className="popover-header">
              <div className="popover-cat-badge">
                <span className="gold-accent">✦</span>
                <span>{activePart.category}</span>
              </div>
              <button 
                type="button" 
                className="popover-close-btn"
                onClick={() => setActivePart(null)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Popover Title & Headline */}
            <h3 className="popover-title">{activePart.name}</h3>
            <div className="popover-headline">{activePart.headline}</div>

            {/* Description Body */}
            <p className="popover-description">{activePart.description}</p>

            {/* Specs Grid */}
            <div className="popover-specs-grid">
              {activePart.specs.map((s, idx) => (
                <div key={idx} className="popover-spec-pill">
                  <span className="spec-pill-label">{s.label}</span>
                  <span className="spec-pill-val">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Footer / Interaction tip */}
            <div className="popover-footer">
              <span className="popover-hint">SV BESPOKE ENGINEERING SPECIFICATION</span>
              <button 
                type="button" 
                className="popover-dismiss-btn"
                onClick={() => setActivePart(null)}
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
