import React, { useState } from 'react';
import { WebcamPixelGrid } from '@/components/ui/webcam-pixel-grid';
import './WebcamPixelGridDemo.css';

export function WebcamPixelGridDemo() {
  // Configurable interactive parameters
  const [gridCols, setGridCols] = useState(60);
  const [gridRows, setGridRows] = useState(40);
  const [maxElevation, setMaxElevation] = useState(55);
  const [motionSensitivity, setMotionSensitivity] = useState(0.35);
  const [elevationSmoothing, setElevationSmoothing] = useState(0.20);
  const [denoiseThreshold, setDenoiseThreshold] = useState(0.040);
  const [colorMode, setColorMode] = useState('webcam');
  const [mirror, setMirror] = useState(true);
  const [invertColors, setInvertColors] = useState(false);
  const [darken, setDarken] = useState(0.6);
  const [gapRatio, setGapRatio] = useState(0.05);

  const handleWebcamReady = React.useCallback(() => {
    console.log('Webcam ready!');
  }, []);

  const handleWebcamError = React.useCallback((err) => {
    console.warn('Webcam error:', err);
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden webcam-demo-root">
      {/* Webcam pixel grid background */}
      <div className="absolute inset-0">
        <WebcamPixelGrid
          gridCols={gridCols}
          gridRows={gridRows}
          maxElevation={maxElevation}
          motionSensitivity={motionSensitivity}
          elevationSmoothing={elevationSmoothing}
          denoiseThreshold={denoiseThreshold}
          colorMode={colorMode}
          backgroundColor="#030303"
          mirror={mirror}
          gapRatio={gapRatio}
          invertColors={invertColors}
          darken={darken}
          borderColor="#ffffff"
          borderOpacity={0.06}
          className="w-full h-full"
          onWebcamReady={handleWebcamReady}
          onWebcamError={handleWebcamError}
        />
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Hero content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <div className="max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm hero-badge">
            Introducing AI SaaS Template &rarr;
          </div>

          {/* Title */}
          <h1 className="mb-6 text-xl font-bold tracking-tight text-white sm:text-6xl md:text-8xl hero-title">
            Ship stunning landing pages faster.
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-base text-white/60 sm:text-xl hero-desc">
            Build amazing landing pages with component blocks and templates from aceternity, without having to worry about styling and animations.
          </p>

          {/* Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row hero-actions">
            <button className="group relative inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-medium text-black transition-all hover:bg-white/90 hover:scale-105 hero-btn-primary">
              Get Started
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30 hero-btn-secondary">
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Floating Glassmorphic Tuning HUD */}
      <div className="webcam-hud" onClick={(e) => e.stopPropagation()}>
        {/* Color Mode Selector */}
        <div className="webcam-hud-group">
          <span className="webcam-hud-label">Color:</span>
          {['webcam', 'grayscale', 'monochrome', 'inverted'].map((m) => (
            <button
              key={m}
              className={`webcam-hud-pill ${colorMode === m ? 'active' : ''}`}
              onClick={() => setColorMode(m)}
            >
              {m === 'webcam' ? 'RGB' : m.charAt(0).toUpperCase() + m.slice(1, 5)}
            </button>
          ))}
        </div>

        <div className="webcam-hud-divider" />

        {/* Elevation Slider */}
        <div className="webcam-hud-group">
          <span className="webcam-hud-label">Elevation:</span>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={maxElevation}
            onChange={(e) => setMaxElevation(Number(e.target.value))}
            className="webcam-slider"
            title={`Max Elevation: ${maxElevation}`}
          />
          <span className="webcam-slider-badge">{maxElevation}</span>
        </div>

        <div className="webcam-hud-divider" />

        {/* Motion Sensitivity Slider */}
        <div className="webcam-hud-group">
          <span className="webcam-hud-label">Motion / Shift:</span>
          <input
            type="range"
            min="0.05"
            max="1.0"
            step="0.05"
            value={motionSensitivity}
            onChange={(e) => setMotionSensitivity(Number(e.target.value))}
            className="webcam-slider"
            title={`Motion Sensitivity: ${motionSensitivity}`}
          />
          <span className="webcam-slider-badge">{motionSensitivity}</span>
        </div>

        <div className="webcam-hud-divider" />

        {/* Denoise Filter Slider */}
        <div className="webcam-hud-group">
          <span className="webcam-hud-label">Denoise:</span>
          <input
            type="range"
            min="0.01"
            max="0.10"
            step="0.005"
            value={denoiseThreshold}
            onChange={(e) => setDenoiseThreshold(Number(e.target.value))}
            className="webcam-slider"
            title={`Denoise Cutoff: ${denoiseThreshold.toFixed(3)}`}
          />
          <span className="webcam-slider-badge">{denoiseThreshold.toFixed(2)}</span>
        </div>

        <div className="webcam-hud-divider" />

        {/* Mirror Toggle */}
        <button
          className={`webcam-hud-btn ${mirror ? 'active' : ''}`}
          onClick={() => setMirror((prev) => !prev)}
          title="Toggle Horizontal Mirroring"
        >
          {mirror ? '🪞 Mirrored' : '⬛ Direct'}
        </button>

        {/* Darken Slider */}
        <div className="webcam-hud-group">
          <span className="webcam-hud-label">Darken:</span>
          <input
            type="range"
            min="0.2"
            max="0.9"
            step="0.05"
            value={darken}
            onChange={(e) => setDarken(Number(e.target.value))}
            className="webcam-slider"
            title={`Darken Factor: ${darken}`}
          />
          <span className="webcam-slider-badge">{darken.toFixed(2)}</span>
        </div>

        {/* Invert Toggle */}
        <button
          className={`webcam-hud-btn ${invertColors ? 'active' : ''}`}
          onClick={() => setInvertColors((prev) => !prev)}
          title="Invert Colors"
        >
          {invertColors ? '◑ Inverted' : '◐ Normal'}
        </button>
      </div>
    </div>
  );
}

export default WebcamPixelGridDemo;
