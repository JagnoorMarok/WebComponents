import React, { useState } from 'react';
import GlitchText from './ui/glitch-text.jsx';
import './GlitchTextDemo.css';

const PRESETS = [
  { label: 'DEFAULT', text: 'GLITCH', fontSize: 120, color: '#ffffff', color1: '#ff003c', color2: '#00f5ff' },
  { label: 'HORROR', text: 'CORRUPTED', fontSize: 86, color: '#ff0000', color1: '#ff6600', color2: '#ff00aa' },
  { label: 'MATRIX', text: 'SYSTEM', fontSize: 100, color: '#00ff41', color1: '#00ffaa', color2: '#66ff00' },
  { label: 'NEON', text: 'CYBER', fontSize: 120, color: '#e879f9', color1: '#818cf8', color2: '#22d3ee' },
  { label: 'VOID', text: 'NULL', fontSize: 140, color: '#a8a8a8', color1: '#ffffff', color2: '#333333' },
];

export default function GlitchTextDemo() {
  const [text, setText] = useState('GLITCH');
  const [fontSize, setFontSize] = useState(120);
  const [color, setColor] = useState('#ffffff');
  const [glitchColor1, setGlitchColor1] = useState('#ff003c');
  const [glitchColor2, setGlitchColor2] = useState('#00f5ff');
  const [cursorRadius, setCursorRadius] = useState(180);
  const [glitchIntensity, setGlitchIntensity] = useState(28);
  const [stickyFrames, setStickyFrames] = useState(22);
  const [scanlineOpacity, setScanlineOpacity] = useState(0.18);
  const [activePreset, setActivePreset] = useState('DEFAULT');

  const applyPreset = (preset) => {
    setText(preset.text);
    setFontSize(preset.fontSize);
    setColor(preset.color);
    setGlitchColor1(preset.color1);
    setGlitchColor2(preset.color2);
    setActivePreset(preset.label);
  };

  return (
    <div className="glitch-demo-root">
      {/* Hero Canvas */}
      <div className="glitch-demo-stage">
        {/* CRT scanline overlay */}
        <div className="glitch-crt-overlay" />
        {/* Noise vignette */}
        <div className="glitch-vignette" />

        <div className="glitch-stage-inner">
          <GlitchText
            key={`${text}-${fontSize}-${color}-${glitchColor1}-${glitchColor2}`}
            text={text}
            fontSize={fontSize}
            fontFamily="'Courier New', Courier, monospace"
            color={color}
            glitchColor1={glitchColor1}
            glitchColor2={glitchColor2}
            cursorRadius={cursorRadius}
            glitchIntensity={glitchIntensity}
            stickyFrames={stickyFrames}
            scanlineOpacity={scanlineOpacity}
          />
          <p className="glitch-hint">← hover over the text →</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glitch-controls-panel">
        <div className="glitch-controls-header">
          <span className="glitch-controls-label">⚡ Studio Controls</span>
        </div>

        {/* Presets */}
        <div className="glitch-section">
          <label className="glitch-section-title">Presets</label>
          <div className="glitch-presets">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`glitch-preset-btn ${activePreset === p.label ? 'active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="glitch-section">
          <label className="glitch-section-title">Text</label>
          <input
            className="glitch-text-input"
            type="text"
            value={text}
            maxLength={12}
            onChange={(e) => { setText(e.target.value.toUpperCase()); setActivePreset(''); }}
            placeholder="Enter text..."
          />
        </div>

        {/* Sliders */}
        <div className="glitch-section">
          <label className="glitch-section-title">Parameters</label>
          <div className="glitch-sliders">
            <div className="glitch-slider-row">
              <span>Font Size</span>
              <input type="range" min="60" max="180" value={fontSize}
                onChange={(e) => setFontSize(+e.target.value)} />
              <span className="glitch-val">{fontSize}px</span>
            </div>
            <div className="glitch-slider-row">
              <span>Cursor Radius</span>
              <input type="range" min="60" max="320" value={cursorRadius}
                onChange={(e) => setCursorRadius(+e.target.value)} />
              <span className="glitch-val">{cursorRadius}px</span>
            </div>
            <div className="glitch-slider-row">
              <span>Glitch Intensity</span>
              <input type="range" min="4" max="60" value={glitchIntensity}
                onChange={(e) => setGlitchIntensity(+e.target.value)} />
              <span className="glitch-val">{glitchIntensity}</span>
            </div>
            <div className="glitch-slider-row">
              <span>Sticky Frames</span>
              <input type="range" min="1" max="60" value={stickyFrames}
                onChange={(e) => setStickyFrames(+e.target.value)} />
              <span className="glitch-val">{stickyFrames}</span>
            </div>
            <div className="glitch-slider-row">
              <span>Scanline Opacity</span>
              <input type="range" min="0" max="0.5" step="0.01" value={scanlineOpacity}
                onChange={(e) => setScanlineOpacity(+e.target.value)} />
              <span className="glitch-val">{scanlineOpacity.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Colour Pickers */}
        <div className="glitch-section">
          <label className="glitch-section-title">Colors</label>
          <div className="glitch-color-row">
            <div className="glitch-color-item">
              <span>Base</span>
              <input type="color" value={color}
                onChange={(e) => { setColor(e.target.value); setActivePreset(''); }} />
            </div>
            <div className="glitch-color-item">
              <span>Channel 1</span>
              <input type="color" value={glitchColor1}
                onChange={(e) => { setGlitchColor1(e.target.value); setActivePreset(''); }} />
            </div>
            <div className="glitch-color-item">
              <span>Channel 2</span>
              <input type="color" value={glitchColor2}
                onChange={(e) => { setGlitchColor2(e.target.value); setActivePreset(''); }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
