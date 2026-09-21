import React, { useState } from "react";
import StackTower from "@/components/ui/stack-tower";
import "@/components/ui/stack-tower.css";
import {
  IconAdjustments,
  IconSun,
  IconMoon,
  IconRefresh,
  IconTypography,
} from "@tabler/icons-react";

export default function StackTowerDemo() {
  const [mode, setMode] = useState("dark");
  const [wordsText, setWordsText] = useState("STACK, TOWER");
  const [rowCount, setRowCount] = useState(12);
  const [secondsPerCycle, setSecondsPerCycle] = useState(5);
  const [amplitude, setAmplitude] = useState(22);
  const [accentColor, setAccentColor] = useState("#F16D14");
  const [showControls, setShowControls] = useState(false);

  const wordPresets = [
    { label: "Stack / Tower", words: "STACK, TOWER" },
    { label: "Design / Code", words: "DESIGN, CODE" },
    { label: "Next / Kinetic", words: "NEXT, KINETIC" },
    { label: "Future / Mind", words: "FUTURE, MIND" },
  ];

  const colorPresets = [
    { name: "Safety Orange", color: "#F16D14" },
    { name: "Electric Lime", color: "#84cc16" },
    { name: "Hot Coral", color: "#f43f5e" },
    { name: "Pure White", color: "#ffffff" },
  ];

  const parsedWords = wordsText
    .split(",")
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean);

  const finalWords = parsedWords.length > 0 ? parsedWords : ["STACK", "TOWER"];

  const resetDefaults = () => {
    setMode("dark");
    setWordsText("STACK, TOWER");
    setRowCount(12);
    setSecondsPerCycle(5);
    setAmplitude(22);
    setAccentColor("#F16D14");
  };

  const isDark = mode === "dark";

  return (
    <div className={`st-demo-wrapper ${isDark ? "st-dark" : "st-light"}`}>
      {/* Top Floating Action Pill Bar */}
      <div className="st-top-actions">
        {/* Toggle Dark / Light Mode */}
        <button
          onClick={() => setMode(isDark ? "light" : "dark")}
          className="st-action-btn"
          title="Toggle Light / Dark Mode"
        >
          {isDark ? <IconSun size={15} /> : <IconMoon size={15} />}
          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Toggle Controls Drawer */}
        <button
          onClick={() => setShowControls(!showControls)}
          className={`st-action-btn ${showControls ? "active" : ""}`}
        >
          <IconAdjustments size={15} />
          <span>Controls</span>
        </button>
      </div>

      {/* Main 3D Typographic Cylinder Stack Tower */}
      <StackTower
        words={finalWords}
        rowCount={rowCount}
        secondsPerCycle={secondsPerCycle}
        amplitude={amplitude}
        accentColor={accentColor}
        mode={mode}
      />

      {/* Interactive Bottom Hint */}
      <div className="st-hint-pill">
        <span>Hover any row to expand scale • Scroll down for code</span>
      </div>

      {/* Settings Panel */}
      {showControls && (
        <div className="st-controls-panel">
          <div className="st-controls-header">
            <span className="st-controls-title">Tower Parameters</span>
            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
              <button
                onClick={resetDefaults}
                className="st-controls-close"
                title="Reset to defaults"
              >
                <IconRefresh size={14} />
              </button>
              <button
                onClick={() => setShowControls(false)}
                className="st-controls-close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="st-control-group">
            {/* Words Input */}
            <div className="st-control-row">
              <div className="st-control-meta">
                <span>Words (Comma separated)</span>
              </div>
              <input
                type="text"
                value={wordsText}
                onChange={(e) => setWordsText(e.target.value)}
                className="st-input-text"
                placeholder="STACK, TOWER"
              />
            </div>

            {/* Quick Word Presets */}
            <div className="st-control-row">
              <div className="st-control-meta">
                <span>Word Presets</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.35rem" }}>
                {wordPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setWordsText(p.words)}
                    className="st-action-btn"
                    style={{ fontSize: "0.72rem", padding: "0.35rem 0.5rem", justifyContent: "center" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Presets */}
            <div className="st-control-row">
              <div className="st-control-meta">
                <span>Hover Accent Color</span>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {colorPresets.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setAccentColor(c.color)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: c.color,
                      border: accentColor === c.color ? "2px solid #ffffff" : "1px solid #333",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Seconds per Cycle (Speed) */}
            <div className="st-control-row">
              <div className="st-control-meta">
                <span>Cycle Duration</span>
                <span className="st-control-val">{secondsPerCycle}s</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="12"
                step="0.5"
                value={secondsPerCycle}
                onChange={(e) => setSecondsPerCycle(parseFloat(e.target.value))}
                className="st-range"
              />
            </div>

            {/* Amplitude (Horizontal Travel) */}
            <div className="st-control-row">
              <div className="st-control-meta">
                <span>Travel Amplitude</span>
                <span className="st-control-val">{amplitude}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                step="1"
                value={amplitude}
                onChange={(e) => setAmplitude(parseInt(e.target.value))}
                className="st-range"
              />
            </div>

            {/* Row Count */}
            <div className="st-control-row">
              <div className="st-control-meta">
                <span>Stacked Rows</span>
                <span className="st-control-val">{rowCount}</span>
              </div>
              <input
                type="range"
                min="6"
                max="20"
                step="2"
                value={rowCount}
                onChange={(e) => setRowCount(parseInt(e.target.value))}
                className="st-range"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
