"use client";

import React, { useState, useEffect } from 'react';

interface TelemetryData {
  frame: number;
  progress: number;
  sequenceIndex: number;
  totalFrames: number;
}

const SEQUENCE_DETAILS = [
  {
    num: "01",
    title: "AERODYNAMIC SILHOUETTE",
    subtitle: "Precision flush glazing & seamless surface transition",
    frameStart: 0,
    progress: 0.0,
  },
  {
    num: "02",
    title: "ALL-TERRAIN ARCHITECTURE",
    subtitle: "Adaptive Dynamics & electronic air suspension with dynamic response",
    frameStart: 192,
    progress: 0.2,
  },
  {
    num: "03",
    title: "SCULPTED ELEGANCE",
    subtitle: "Minimalist character line and floating roofline design",
    frameStart: 384,
    progress: 0.4,
  },
  {
    num: "04",
    title: "SIGNATURE LIGHTING",
    subtitle: "Hidden-until-lit vertical rear tail lamps with crystalline optics",
    frameStart: 576,
    progress: 0.6,
  },
  {
    num: "05",
    title: "ROAD PRESENCE",
    subtitle: "Commanding stance with active all-wheel steering agility",
    frameStart: 768,
    progress: 0.8,
  },
];

const EXTERIOR_COLORS = [
  { name: "Batumi Gold", hex: "#bfa36c", finish: "Ultra Metallic" },
  { name: "Santorini Black", hex: "#111111", finish: "Deep Gloss" },
  { name: "Belgravia Green", hex: "#22382e", finish: "Metallic" },
  { name: "Charente Grey", hex: "#4f5358", finish: "Premium Satin" },
  { name: "Ostuni Pearl", hex: "#e5e5e0", finish: "Pearlescent" },
];

export default function LuxuryHUD() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    frame: 0,
    progress: 0,
    sequenceIndex: 0,
    totalFrames: 960,
  });
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'finishes' | 'craftsmanship'>('specs');
  const [selectedColor, setSelectedColor] = useState<string>("Batumi Gold");

  useEffect(() => {
    const handleTelemetry = (e: Event) => {
      const customEvent = e as CustomEvent<TelemetryData>;
      if (customEvent.detail) {
        setTelemetry(customEvent.detail);
      }
    };

    window.addEventListener('animation-telemetry', handleTelemetry);
    return () => {
      window.removeEventListener('animation-telemetry', handleTelemetry);
    };
  }, []);

  const seekToSequence = (seqIdx: number) => {
    const seq = SEQUENCE_DETAILS[seqIdx];
    if (!seq) return;
    window.dispatchEvent(
      new CustomEvent('seek-to-progress', { detail: { progress: seq.progress } })
    );
  };

  const currentSeq = SEQUENCE_DETAILS[telemetry.sequenceIndex] || SEQUENCE_DETAILS[0];

  return (
    <div className="luxury-hud-layer" pointer-events="none">
      {/* 1. Top Executive Navigation Bar */}
      <header className="hud-top-bar">
        <div className="hud-brand">
          <div className="brand-crest">R</div>
          <div className="brand-text-wrap">
            <span className="brand-title">RANGE ROVER</span>
            <span className="brand-badge">SV BESPOKE</span>
          </div>
        </div>

        <nav className="hud-nav-menu">
          <button 
            type="button" 
            className={`hud-nav-item ${telemetry.sequenceIndex === 0 ? 'active' : ''}`}
            onClick={() => seekToSequence(0)}
          >
            SILHOUETTE
          </button>
          <button 
            type="button" 
            className={`hud-nav-item ${telemetry.sequenceIndex === 1 ? 'active' : ''}`}
            onClick={() => seekToSequence(1)}
          >
            ARCHITECTURE
          </button>
          <button 
            type="button" 
            className={`hud-nav-item ${telemetry.sequenceIndex === 2 ? 'active' : ''}`}
            onClick={() => seekToSequence(2)}
          >
            SCULPT
          </button>
          <button 
            type="button" 
            className="hud-nav-item"
            onClick={() => {
              setActiveTab('specs');
              setDrawerOpen(true);
            }}
          >
            SPECIFICATIONS
          </button>
        </nav>

        <div className="hud-top-actions">
          <button 
            type="button"
            className={`hud-audio-btn ${isAudioActive ? 'active' : ''}`}
            onClick={() => setIsAudioActive(!isAudioActive)}
            title="Toggle Engine Atmosphere Audio"
          >
            <span className="audio-bars">
              <span className={`bar ${isAudioActive ? 'animating' : ''}`}></span>
              <span className={`bar ${isAudioActive ? 'animating' : ''}`}></span>
              <span className={`bar ${isAudioActive ? 'animating' : ''}`}></span>
            </span>
            <span className="audio-label">{isAudioActive ? 'ATMOSPHERE ON' : 'ATMOSPHERE'}</span>
          </button>

          <button 
            type="button" 
            className="hud-reserve-btn"
            onClick={() => {
              setActiveTab('finishes');
              setDrawerOpen(true);
            }}
          >
            <span>CONFIGURE</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </header>

      {/* 2. Left Perimeter Telemetry HUD (Clear of Car Body) */}
      <aside className="hud-left-telemetry">
        <div className="telemetry-badge">
          <span className="pulse-dot"></span>
          <span className="telemetry-mode">LIVE 3D REEL</span>
        </div>

        <div className="telemetry-sequence">
          <span className="seq-large-num">{currentSeq.num}</span>
          <span className="seq-total">/ 05</span>
        </div>

        <div className="telemetry-meta">
          <h2 className="telemetry-title">{currentSeq.title}</h2>
          <p className="telemetry-subtitle">{currentSeq.subtitle}</p>
        </div>

        <div className="telemetry-counters">
          <div className="counter-chip">
            <span className="chip-label">FRAME</span>
            <span className="chip-val">{String(telemetry.frame).padStart(4, '0')}</span>
          </div>
          <div className="counter-chip">
            <span className="chip-label">SCRUB</span>
            <span className="chip-val">{(telemetry.progress * 100).toFixed(0)}%</span>
          </div>
        </div>
      </aside>

      {/* 3. Right Perimeter Interactive Waypoint Rail */}
      <aside className="hud-right-rail">
        <div className="rail-label">SEQUENCE</div>
        <div className="rail-track">
          <div 
            className="rail-glow-bar" 
            style={{ height: `${Math.max(8, telemetry.progress * 100)}%` }}
          />
          {SEQUENCE_DETAILS.map((seq, i) => {
            const isActive = telemetry.sequenceIndex === i;
            return (
              <button
                key={seq.num}
                type="button"
                className={`waypoint-node ${isActive ? 'active' : ''}`}
                onClick={() => seekToSequence(i)}
                title={seq.title}
              >
                <span className="waypoint-marker"></span>
                <span className="waypoint-num">{seq.num}</span>
                <span className="waypoint-tooltip">{seq.title}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* 4. Bottom Luxury Specs Bar (Perimeter, below vehicle) */}
      <footer className="hud-bottom-specs">
        <div className="specs-cluster">
          <div className="spec-item">
            <span className="spec-val">523 <small>HP</small></span>
            <span className="spec-name">TWIN-TURBOCHARGED V8</span>
          </div>
          <div className="spec-divider"></div>
          <div className="spec-item">
            <span className="spec-val">4.4 <small>SEC</small></span>
            <span className="spec-name">0–60 MPH ACCELERATION</span>
          </div>
          <div className="spec-divider"></div>
          <div className="spec-item">
            <span className="spec-val">7.3<small>°</small></span>
            <span className="spec-name">ALL-WHEEL REAR STEERING</span>
          </div>
          <div className="spec-divider"></div>
          <div className="spec-item">
            <span className="spec-val">155 <small>MPH</small></span>
            <span className="spec-name">ELECTRONIC MAXIMUM SPEED</span>
          </div>
        </div>

        <div className="hud-scroll-cue">
          <span className="cue-text">SCROLL TO ROTATE</span>
          <div className="cue-indicator">
            <span className="cue-arrow"></span>
          </div>
        </div>
      </footer>

      {/* 5. Slide-Out Bespoke & Specifications Drawer */}
      <div 
        className={`hud-drawer-backdrop ${drawerOpen ? 'open' : ''}`} 
        onClick={() => setDrawerOpen(false)}
      />
      <div className={`hud-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-wrap">
            <span className="drawer-badge">SV BESPOKE</span>
            <h3 className="drawer-title">RANGE ROVER SPECIFICATIONS</h3>
          </div>
          <button 
            type="button" 
            className="drawer-close-btn"
            onClick={() => setDrawerOpen(false)}
            title="Close Drawer"
          >
            ✕
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="drawer-tabs">
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            POWERTRAIN
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'finishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('finishes')}
          >
            EXTERIOR FINISHES
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'craftsmanship' ? 'active' : ''}`}
            onClick={() => setActiveTab('craftsmanship')}
          >
            CRAFTSMANSHIP
          </button>
        </div>

        {/* Tab 1: Powertrain & Performance */}
        {activeTab === 'specs' && (
          <div className="drawer-content">
            <div className="spec-table">
              <div className="table-row">
                <span className="row-key">Engine Architecture</span>
                <span className="row-val">4.4-Litre Twin-Turbo V8</span>
              </div>
              <div className="table-row">
                <span className="row-key">Maximum Power</span>
                <span className="row-val">523 HP (390 kW) @ 5,500 rpm</span>
              </div>
              <div className="table-row">
                <span className="row-key">Maximum Torque</span>
                <span className="row-val">750 Nm @ 1,800–4,600 rpm</span>
              </div>
              <div className="table-row">
                <span className="row-key">Transmission</span>
                <span className="row-val">8-Speed Automatic with CommandShift</span>
              </div>
              <div className="table-row">
                <span className="row-key">Suspension</span>
                <span className="row-val">Electronic Air Suspension w/ Dynamic Response Pro</span>
              </div>
              <div className="table-row">
                <span className="row-key">Max Wading Depth</span>
                <span className="row-val">900 mm (35.4 in)</span>
              </div>
              <div className="table-row">
                <span className="row-key">Maximum Towing</span>
                <span className="row-val">3,500 kg (7,716 lbs)</span>
              </div>
            </div>

            <div className="drawer-callout">
              <h4>ALL-WHEEL STEERING</h4>
              <p>Delivers unprecedented low-speed manoeuvrability with an 11.0m turning circle and rock-solid high-speed poise.</p>
            </div>
          </div>
        )}

        {/* Tab 2: Exterior Finishes */}
        {activeTab === 'finishes' && (
          <div className="drawer-content">
            <p className="finishes-intro">
              Select an exclusive SV Bespoke palette finish. Each formulation utilizes multi-layer crystalline pigments for breathtaking depth.
            </p>

            <div className="color-swatch-list">
              {EXTERIOR_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`color-card ${selectedColor === c.name ? 'active' : ''}`}
                  onClick={() => setSelectedColor(c.name)}
                >
                  <span className="color-swatch-circle" style={{ backgroundColor: c.hex }} />
                  <div className="color-info">
                    <span className="color-title">{c.name}</span>
                    <span className="color-finish">{c.finish}</span>
                  </div>
                  {selectedColor === c.name && <span className="color-check">✓</span>}
                </button>
              ))}
            </div>

            <div className="color-preview-card">
              <span className="preview-label">ACTIVE SELECTION</span>
              <div className="preview-name">{selectedColor}</div>
              <p className="preview-desc">Formulated with micro-flaked ceramic reflection for dynamic luster under natural lighting.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Craftsmanship */}
        {activeTab === 'craftsmanship' && (
          <div className="drawer-content">
            <div className="craft-card">
              <h4>NEAR-ZERO DECIBEL CABIN</h4>
              <p>Third-generation Active Noise Cancellation with headrest-integrated speakers creates a personal sanctuary on wheels.</p>
            </div>
            <div className="craft-card">
              <h4>SEMI-ANILINE LEATHER</h4>
              <p>Supple, sustainably-sourced upholstery treated with bespoke micro-perforated diamond quilting.</p>
            </div>
            <div className="craft-card">
              <h4>SUSTAINABLE CERAMIC ACCENTS</h4>
              <p>Diamond-turned ceramic gear selector and volume dials finished in cool, tactile satin sheen.</p>
            </div>
          </div>
        )}

        <div className="drawer-footer">
          <button 
            type="button" 
            className="drawer-primary-btn"
            onClick={() => setDrawerOpen(false)}
          >
            RESUME 3D SHOWCASE
          </button>
        </div>
      </div>
    </div>
  );
}
