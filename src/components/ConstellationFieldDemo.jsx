import React, { useState } from "react";
import ConstellationField from "@/components/ui/constellation-field";
import "@/components/ui/constellation-field.css";
import {
  IconAdjustments,
  IconSun,
  IconMoon,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconSparkles,
} from "@tabler/icons-react";

export default function ConstellationFieldDemo() {
  // Core parameters matching 21st.dev / Meng To component contract
  const [mode, setMode] = useState("dark");
  const [speed, setSpeed] = useState(1);
  const [size, setSize] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [length, setLength] = useState(1);
  const [density, setDensity] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);

  // UI state
  const [showControls, setShowControls] = useState(false);
  const [showText, setShowText] = useState(true);

  const presets = [
    {
      name: "Celestial Gold",
      values: {
        mode: "dark",
        speed: 1,
        size: 1,
        strokeWidth: 1,
        length: 1,
        density: 1,
        opacity: 1,
        hue: 0,
        saturation: 1,
        brightness: 1,
      },
    },
    {
      name: "Cyan Space",
      values: {
        mode: "dark",
        speed: 1.2,
        size: 1.15,
        strokeWidth: 1.2,
        length: 1.15,
        density: 1.1,
        opacity: 0.95,
        hue: 165,
        saturation: 1.4,
        brightness: 1.1,
      },
    },
    {
      name: "Violet Nebula",
      values: {
        mode: "dark",
        speed: 0.8,
        size: 1.2,
        strokeWidth: 1.1,
        length: 1.2,
        density: 1.2,
        opacity: 0.9,
        hue: -95,
        saturation: 1.5,
        brightness: 1.15,
      },
    },
    {
      name: "Hyper Speed",
      values: {
        mode: "dark",
        speed: 2.2,
        size: 1.3,
        strokeWidth: 1.4,
        length: 1.3,
        density: 1.3,
        opacity: 1,
        hue: 45,
        saturation: 1.2,
        brightness: 1.2,
      },
    },
    {
      name: "Daylight Bronze",
      values: {
        mode: "light",
        speed: 0.9,
        size: 0.9,
        strokeWidth: 0.85,
        length: 0.95,
        density: 0.9,
        opacity: 0.85,
        hue: 0,
        saturation: 1,
        brightness: 1,
      },
    },
  ];

  const applyPreset = (p) => {
    setMode(p.values.mode);
    setSpeed(p.values.speed);
    setSize(p.values.size);
    setStrokeWidth(p.values.strokeWidth);
    setLength(p.values.length);
    setDensity(p.values.density);
    setOpacity(p.values.opacity);
    setHue(p.values.hue);
    setSaturation(p.values.saturation);
    setBrightness(p.values.brightness);
  };

  const resetDefaults = () => {
    setMode("dark");
    setSpeed(1);
    setSize(1);
    setStrokeWidth(1);
    setLength(1);
    setDensity(1);
    setOpacity(1);
    setHue(0);
    setSaturation(1);
    setBrightness(1);
  };

  const isDark = mode === "dark";

  return (
    <div className={`cf-demo-wrapper ${isDark ? "cf-dark" : "cf-light"}`}>
      {/* Top Floating Action Pill Bar */}
      <div className="cf-top-actions">
        {/* Toggle Center Text Overlay */}
        <button
          onClick={() => setShowText(!showText)}
          className="cf-action-btn"
          title={showText ? "Hide text overlay" : "Show text overlay"}
        >
          {showText ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          <span>{showText ? "Hide Text" : "Show Text"}</span>
        </button>

        {/* Toggle Dark / Light Mode */}
        <button
          onClick={() => setMode(isDark ? "light" : "dark")}
          className="cf-action-btn"
          title="Toggle Light / Dark Mode"
        >
          {isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>

        {/* Toggle Controls Drawer */}
        <button
          onClick={() => setShowControls(!showControls)}
          className={`cf-action-btn ${showControls ? "active" : ""}`}
        >
          <IconAdjustments size={16} />
          <span>Controls</span>
        </button>
      </div>

      {/* Main Interactive Constellation Field Canvas */}
      <ConstellationField
        mode={mode}
        speed={speed}
        size={size}
        strokeWidth={strokeWidth}
        length={length}
        density={density}
        opacity={opacity}
        hue={hue}
        saturation={saturation}
        brightness={brightness}
      >
        {/* Minimalist Center Hero (Can be toggled off) */}
        {showText && (
          <div className="cf-hero-overlay">
            <div className="cf-hero-badge">
              <span className="cf-hero-badge-dot" />
              <span>Canvas 2D Particle Web</span>
            </div>

            <h1 className="cf-hero-title">
              Constellation <span>Field</span>
            </h1>

            <p className="cf-hero-subtitle">
              Drifting celestial nodes connected by fading constellation lines with real-time pointer gravity.
            </p>

            <div className="cf-hero-hint">
              <span className="cf-hero-hint-icon">✦</span>
              <span>Move mouse to attract stars & draw lines • Click for shockwave</span>
            </div>
          </div>
        )}
      </ConstellationField>

      {/* Bottom Center Subtle Interaction Cue */}
      {!showText && (
        <div className="cf-mouse-prompt">
          <span className="cf-pulse-dot" />
          <span>Interactive: Move cursor to pull particles • Click to trigger shockwave</span>
        </div>
      )}

      {/* Sleek Studio Controls Drawer */}
      {showControls && (
        <div className="cf-studio-panel">
          <div className="cf-studio-header">
            <div className="cf-studio-title">
              <IconSparkles size={16} color="#e6c879" />
              <span>Constellation Settings</span>
            </div>
            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
              <button
                onClick={resetDefaults}
                className="cf-studio-close"
                title="Reset to defaults"
              >
                <IconRefresh size={14} />
              </button>
              <button
                onClick={() => setShowControls(false)}
                className="cf-studio-close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Preset Chips */}
          <div className="cf-presets-label">Presets</div>
          <div className="cf-presets-grid">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className={`cf-preset-btn ${
                  mode === p.values.mode &&
                  speed === p.values.speed &&
                  hue === p.values.hue
                    ? "active"
                    : ""
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Precision Sliders */}
          <div className="cf-slider-group">
            {/* Speed */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Speed</span>
                <span className="cf-slider-value">{speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="cf-range"
              />
            </div>

            {/* Density */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Density</span>
                <span className="cf-slider-value">{density.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={density}
                onChange={(e) => setDensity(parseFloat(e.target.value))}
                className="cf-range"
              />
            </div>

            {/* Connection Length */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Link Distance</span>
                <span className="cf-slider-value">{length.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.05"
                value={length}
                onChange={(e) => setLength(parseFloat(e.target.value))}
                className="cf-range"
              />
            </div>

            {/* Particle Node Size */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Node Size</span>
                <span className="cf-slider-value">{size.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={size}
                onChange={(e) => setSize(parseFloat(e.target.value))}
                className="cf-range"
              />
            </div>

            {/* Stroke Width */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Line Width</span>
                <span className="cf-slider-value">{strokeWidth.toFixed(2)}px</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="3.5"
                step="0.1"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                className="cf-range"
              />
            </div>

            {/* Opacity */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Opacity</span>
                <span className="cf-slider-value">{opacity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="cf-range"
              />
            </div>

            {/* Hue Shift */}
            <div className="cf-slider-row">
              <div className="cf-slider-meta">
                <span>Hue Shift</span>
                <span className="cf-slider-value">{hue}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={hue}
                onChange={(e) => setHue(parseInt(e.target.value))}
                className="cf-range"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
