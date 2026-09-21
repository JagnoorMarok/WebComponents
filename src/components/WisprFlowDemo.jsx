import React, { useState } from "react";
import {
  WisprFlowTextAnimation,
  buildDefaultPath,
  DEFAULT_FLOW_TEXT,
} from "./ui/wispr-flow-text-animation.jsx";

const PRESET_TEXTS = {
  voice: DEFAULT_FLOW_TEXT,
  neural:
    "Analyzing thought stream in real-time… Converting non-linear spoken consciousness into structured linguistic artifacts. The quick neural tokenizer handles natural pauses, self-corrections, and spontaneous tangents with zero latency. Every phoneme traces a continuous geometric curvature through mathematical vector space.",
  creative:
    "Lines of typography undulating through an invisible dimensional current. Words rise, bend, and loop across the viewport like ribbons in weightless orbit. Drag the cyan anchor points to reshape the wave trajectory in real time.",
};

export default function WisprFlowDemo() {
  const [speed, setSpeed] = useState(25);
  const [fontSize, setFontSize] = useState(15);
  const [textOpacity, setTextOpacity] = useState(0.6);
  const [activePreset, setActivePreset] = useState("voice");
  const [path, setPath] = useState(() => buildDefaultPath());
  const [isEditing, setIsEditing] = useState(false);

  const handleResetPath = () => {
    setPath(buildDefaultPath());
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <WisprFlowTextAnimation
        text={PRESET_TEXTS[activePreset]}
        speed={speed}
        fontSize={fontSize}
        textOpacity={textOpacity}
        textColor="#f1f5f9"
        path={path}
        onPathChange={setPath}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        showEditButton={true}
      />

      {/* Floating Interactive Controls HUD */}
      <div className="wispr-controls-hud">
        <div className="wispr-hud-group">
          <span className="wispr-hud-label">Speed</span>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="wispr-hud-slider"
            title={`Speed: ${speed}`}
          />
        </div>

        <div className="wispr-hud-group">
          <span className="wispr-hud-label">Size</span>
          <input
            type="range"
            min="11"
            max="26"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="wispr-hud-slider"
            title={`Font Size: ${fontSize}px`}
          />
        </div>

        <div className="wispr-hud-group">
          <span className="wispr-hud-label">Opacity</span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={textOpacity}
            onChange={(e) => setTextOpacity(Number(e.target.value))}
            className="wispr-hud-slider"
            title={`Opacity: ${textOpacity}`}
          />
        </div>

        <div className="wispr-hud-group" style={{ gap: "4px" }}>
          <span className="wispr-hud-label">Text</span>
          <button
            className="wispr-hud-btn"
            style={{
              background: activePreset === "voice" ? "rgba(56, 189, 248, 0.25)" : undefined,
              borderColor: activePreset === "voice" ? "#38bdf8" : undefined,
            }}
            onClick={() => setActivePreset("voice")}
          >
            Voice
          </button>
          <button
            className="wispr-hud-btn"
            style={{
              background: activePreset === "neural" ? "rgba(56, 189, 248, 0.25)" : undefined,
              borderColor: activePreset === "neural" ? "#38bdf8" : undefined,
            }}
            onClick={() => setActivePreset("neural")}
          >
            Neural
          </button>
          <button
            className="wispr-hud-btn"
            style={{
              background: activePreset === "creative" ? "rgba(56, 189, 248, 0.25)" : undefined,
              borderColor: activePreset === "creative" ? "#38bdf8" : undefined,
            }}
            onClick={() => setActivePreset("creative")}
          >
            Creative
          </button>
        </div>

        <button
          className="wispr-hud-btn"
          onClick={handleResetPath}
          title="Restore the default Bézier curve"
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <span>Reset Curve</span>
        </button>
      </div>
    </div>
  );
}
