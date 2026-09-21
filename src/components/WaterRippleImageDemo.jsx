import React, { useState } from "react";
import WaterRippleImage from "./ui/water-ripple-image";

const PRESETS = [
  { id: "alpine", name: "Alpine Peak", src: "/assets/water-ripple/default.jpg" },
  { id: "sunlight", name: "Forest Canopy", src: "/assets/water-ripple/sunlight.jpg" },
  { id: "ocean", name: "Tropical Shore", src: "/assets/water-ripple/ocean.jpg" },
];

export default function WaterRippleImageDemo() {
  const [activeImage, setActiveImage] = useState(PRESETS[0].src);
  const [blueish, setBlueish] = useState(0.4);
  const [scale, setScale] = useState(7);
  const [illumination, setIllumination] = useState(0.15);
  const [surfaceDistortion, setSurfaceDistortion] = useState(0.03);
  const [waterDistortion, setWaterDistortion] = useState(0.02);

  const resetDefaults = () => {
    setBlueish(0.4);
    setScale(7);
    setIllumination(0.15);
    setSurfaceDistortion(0.03);
    setWaterDistortion(0.02);
  };

  return (
    <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Demo Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: "10px",
          }}
        >
          Water Ripple Image
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: "680px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          Hardware-accelerated WebGL fluid simulation applying procedural water surface noise,
          optical caustics, and harmonic refraction to any photograph.
        </p>

        {/* Preset Selector & Controls Bar */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "14px 22px",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Presets:
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveImage(preset.src)}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: activeImage === preset.src ? "#ffffff" : "rgba(255,255,255,0.12)",
                  background: activeImage === preset.src ? "#ffffff" : "rgba(255,255,255,0.06)",
                  color: activeImage === preset.src ? "#000000" : "#d4d4d8",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Interactive Sliders */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              paddingTop: "6px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              width: "100%",
            }}
          >
            {/* Water Distortion */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Wave:</span>
              <input
                type="range"
                min="0.005"
                max="0.06"
                step="0.005"
                value={waterDistortion}
                onChange={(e) => setWaterDistortion(Number(e.target.value))}
                style={{ width: "70px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "36px", textAlign: "left" }}>
                {(waterDistortion * 100).toFixed(0)}%
              </span>
            </div>

            {/* Surface Distortion */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Surface:</span>
              <input
                type="range"
                min="0.01"
                max="0.10"
                step="0.01"
                value={surfaceDistortion}
                onChange={(e) => setSurfaceDistortion(Number(e.target.value))}
                style={{ width: "70px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "36px", textAlign: "left" }}>
                {(surfaceDistortion * 100).toFixed(0)}%
              </span>
            </div>

            {/* Scale */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Frequency:</span>
              <input
                type="range"
                min="3"
                max="14"
                step="1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                style={{ width: "70px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "24px", textAlign: "left" }}>{scale}</span>
            </div>

            {/* Caustics Illumination */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Caustics:</span>
              <input
                type="range"
                min="0.0"
                max="0.4"
                step="0.05"
                value={illumination}
                onChange={(e) => setIllumination(Number(e.target.value))}
                style={{ width: "70px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "36px", textAlign: "left" }}>
                {(illumination * 100).toFixed(0)}%
              </span>
            </div>

            {/* Blue Tint */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Tint:</span>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.1"
                value={blueish}
                onChange={(e) => setBlueish(Number(e.target.value))}
                style={{ width: "70px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "32px", textAlign: "left" }}>
                {(blueish * 100).toFixed(0)}%
              </span>
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={resetDefaults}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                cursor: "pointer",
                padding: "2px 6px",
                textDecoration: "underline",
              }}
              title="Reset slider values to default"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Water Ripple Image Canvas */}
      <div style={{ width: "100%", height: "580px", position: "relative" }}>
        <WaterRippleImage
          src={activeImage}
          blueish={blueish}
          scale={scale}
          illumination={illumination}
          surfaceDistortion={surfaceDistortion}
          waterDistortion={waterDistortion}
          allowUpload={true}
        >
          <div style={{ pointerEvents: "none" }}>
            <h2 className="water-ripple-headline">Ethereal Currents</h2>
            <p className="water-ripple-subline">
              Real-time GLSL water displacement and harmonic refraction synthesized through procedural noise octaves.
            </p>
          </div>
        </WaterRippleImage>
      </div>
    </div>
  );
}
