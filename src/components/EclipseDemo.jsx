import React, { useState } from 'react';
import Eclipse from './ui/eclipse.jsx';
import './EclipseDemo.css';

const PRESETS = [
  {
    label: 'PRISMATIC',
    colorMode: 0,
    coreRadius: 0.28,
    coronaSize: 0.50,
    turbulence: 1.2,
    speed: 1.0,
    intensity: 1.3,
    rimIntensity: 1.8,
    spectralShift: 1.0,
    liquidity: 1.3,
    particleDensity: 0.5,
  },
  {
    label: 'SOLAR FLARE',
    colorMode: 1,
    coreRadius: 0.32,
    coronaSize: 0.55,
    turbulence: 1.6,
    speed: 1.4,
    intensity: 1.5,
    rimIntensity: 2.0,
    spectralShift: 0.3,
    liquidity: 1.6,
    particleDensity: 0.6,
  },
  {
    label: 'ULTRAVIOLET',
    colorMode: 2,
    coreRadius: 0.25,
    coronaSize: 0.45,
    turbulence: 1.1,
    speed: 0.9,
    intensity: 1.4,
    rimIntensity: 1.6,
    spectralShift: 0.8,
    liquidity: 1.2,
    particleDensity: 0.7,
  },
  {
    label: 'BLOOD MOON',
    colorMode: 4,
    coreRadius: 0.30,
    coronaSize: 0.60,
    turbulence: 1.8,
    speed: 1.2,
    intensity: 1.6,
    rimIntensity: 2.2,
    spectralShift: 0.2,
    liquidity: 1.7,
    particleDensity: 0.4,
  },
  {
    label: 'CRYO AURORA',
    colorMode: 3,
    coreRadius: 0.26,
    coronaSize: 0.48,
    turbulence: 1.0,
    speed: 0.8,
    intensity: 1.3,
    rimIntensity: 1.5,
    spectralShift: 0.7,
    liquidity: 1.0,
    particleDensity: 0.6,
  },
  {
    label: 'DIAMOND RING',
    colorMode: 0,
    coreRadius: 0.35,
    coronaSize: 0.35,
    turbulence: 0.8,
    speed: 0.6,
    intensity: 1.8,
    rimIntensity: 3.0,
    spectralShift: 0.5,
    liquidity: 0.7,
    particleDensity: 0.3,
  },
];

const COLOR_MODES = [
  { id: 0, label: 'Spectral (Prismatic)' },
  { id: 1, label: 'Solar Amber' },
  { id: 2, label: 'Ultraviolet' },
  { id: 3, label: 'Cryo Cyan' },
  { id: 4, label: 'Blood Moon' },
];

export default function EclipseDemo() {
  const [coreRadius, setCoreRadius] = useState(0.28);
  const [coronaSize, setCoronaSize] = useState(0.50);
  const [turbulence, setTurbulence] = useState(1.2);
  const [speed, setSpeed] = useState(1.0);
  const [intensity, setIntensity] = useState(1.3);
  const [rimIntensity, setRimIntensity] = useState(1.8);
  const [spectralShift, setSpectralShift] = useState(1.0);
  const [liquidity, setLiquidity] = useState(1.3);
  const [colorMode, setColorMode] = useState(0);
  const [particleDensity, setParticleDensity] = useState(0.5);
  const [interactive, setInteractive] = useState(true);
  const [showHeroText, setShowHeroText] = useState(true);
  const [activePreset, setActivePreset] = useState('PRISMATIC');

  const applyPreset = (p) => {
    setCoreRadius(p.coreRadius);
    setCoronaSize(p.coronaSize);
    setTurbulence(p.turbulence);
    setSpeed(p.speed);
    setIntensity(p.intensity);
    setRimIntensity(p.rimIntensity);
    setSpectralShift(p.spectralShift);
    setLiquidity(p.liquidity ?? 1.3);
    setColorMode(p.colorMode);
    setParticleDensity(p.particleDensity);
    setActivePreset(p.label);
  };

  return (
    <div className="eclipse-demo-root">
      {/* Visual Canvas Stage */}
      <div className="eclipse-stage">
        {/* CRT Scanline and Vignette effects */}
        <div className="eclipse-crt-overlay" />
        <div className="eclipse-vignette" />

        <Eclipse
          coreRadius={coreRadius}
          coronaSize={coronaSize}
          turbulence={turbulence}
          speed={speed}
          intensity={intensity}
          rimIntensity={rimIntensity}
          spectralShift={spectralShift}
          liquidity={liquidity}
          colorMode={colorMode}
          interactive={interactive}
          particleDensity={particleDensity}
        >
          {showHeroText && (
            <div className="eclipse-hero-overlay">
              <span className="eclipse-badge">WEBGL CORONA SHADER</span>
              <h1 className="eclipse-hero-title">ECLIPSE</h1>
              <p className="eclipse-hero-subtitle">
                A turbulent spectral corona burning around a dark eclipse
              </p>
              <div className="eclipse-stats">
                <div className="eclipse-stat-pill">
                  <span className="eclipse-stat-k">DIAMETER</span>
                  <span className="eclipse-stat-v">{(coreRadius * 2 * 100).toFixed(0)}%</span>
                </div>
                <div className="eclipse-stat-pill">
                  <span className="eclipse-stat-k">LIQUIDITY</span>
                  <span className="eclipse-stat-v">{liquidity.toFixed(1)}x</span>
                </div>
                <div className="eclipse-stat-pill">
                  <span className="eclipse-stat-k">TURBULENCE</span>
                  <span className="eclipse-stat-v">{turbulence.toFixed(1)}x</span>
                </div>
                <div className="eclipse-stat-pill">
                  <span className="eclipse-stat-k">DISPERSION</span>
                  <span className="eclipse-stat-v">{(spectralShift * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </Eclipse>

        <div className="eclipse-hint">
          {interactive ? '✦ Move your cursor across the screen to bend the corona ✦' : '✦ Interactive cursor pull is disabled ✦'}
        </div>
      </div>

      {/* Studio Controls Panel */}
      <div className="eclipse-controls-panel">
        <div className="eclipse-controls-header">
          <span className="eclipse-controls-title">⚡ Eclipse Studio Controls</span>
          <button
            className="eclipse-reset-btn"
            onClick={() => applyPreset(PRESETS[0])}
          >
            Reset
          </button>
        </div>

        {/* Presets */}
        <div className="eclipse-section">
          <label className="eclipse-section-label">Presets</label>
          <div className="eclipse-presets-grid">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`eclipse-preset-btn ${activePreset === p.label ? 'active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Modes */}
        <div className="eclipse-section">
          <label className="eclipse-section-label">Color Spectrum</label>
          <div className="eclipse-color-modes">
            {COLOR_MODES.map((cm) => (
              <button
                key={cm.id}
                className={`eclipse-mode-btn ${colorMode === cm.id ? 'active' : ''}`}
                onClick={() => {
                  setColorMode(cm.id);
                  setActivePreset('');
                }}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Geometry & Dynamics Sliders */}
        <div className="eclipse-section">
          <label className="eclipse-section-label">Geometry & Plasma Dynamics</label>
          <div className="eclipse-sliders-grid">
            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Core Radius</span>
              <input
                type="range"
                min="0.15"
                max="0.45"
                step="0.01"
                value={coreRadius}
                onChange={(e) => {
                  setCoreRadius(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{coreRadius.toFixed(2)}</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Corona Size</span>
              <input
                type="range"
                min="0.20"
                max="0.85"
                step="0.01"
                value={coronaSize}
                onChange={(e) => {
                  setCoronaSize(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{coronaSize.toFixed(2)}</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Fluid Liquidity</span>
              <input
                type="range"
                min="0.0"
                max="2.5"
                step="0.1"
                value={liquidity}
                onChange={(e) => {
                  setLiquidity(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{liquidity.toFixed(1)}x</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Turbulence</span>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={turbulence}
                onChange={(e) => {
                  setTurbulence(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{turbulence.toFixed(1)}</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Flare Speed</span>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.1"
                value={speed}
                onChange={(e) => {
                  setSpeed(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{speed.toFixed(1)}x</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Corona Intensity</span>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={intensity}
                onChange={(e) => {
                  setIntensity(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{intensity.toFixed(1)}</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Rim Brightness</span>
              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.1"
                value={rimIntensity}
                onChange={(e) => {
                  setRimIntensity(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{rimIntensity.toFixed(1)}</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Spectral Shift</span>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.05"
                value={spectralShift}
                onChange={(e) => {
                  setSpectralShift(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{spectralShift.toFixed(2)}</span>
            </div>

            <div className="eclipse-slider-row">
              <span className="eclipse-slider-name">Star Dust</span>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={particleDensity}
                onChange={(e) => {
                  setParticleDensity(+e.target.value);
                  setActivePreset('');
                }}
              />
              <span className="eclipse-slider-val">{particleDensity.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="eclipse-section">
          <label className="eclipse-section-label">Options</label>
          <div className="eclipse-toggles-row">
            <label className="eclipse-toggle-label">
              <input
                type="checkbox"
                checked={interactive}
                onChange={(e) => setInteractive(e.target.checked)}
              />
              <span>Interactive Pointer Parallax</span>
            </label>
            <label className="eclipse-toggle-label">
              <input
                type="checkbox"
                checked={showHeroText}
                onChange={(e) => setShowHeroText(e.target.checked)}
              />
              <span>Hero Text Overlay</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
