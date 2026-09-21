import React, { useState } from "react";
import MorphGallery from "./ui/morph-gallery";

const GALLERY_ITEMS = [
  {
    src: "/assets/morph-gallery/forest.jpg",
    thumb: "/assets/morph-gallery/forest-thumb.jpg",
    alt: "Sun rays through a dense alpine pine forest",
    title: "Golden Hour in Black Forest",
  },
  {
    src: "/assets/morph-gallery/mountain.jpg",
    thumb: "/assets/morph-gallery/mountain-thumb.jpg",
    alt: "Snow-capped mountain peak bathed in moonlight",
    title: "Nocturnal Summit, Mount Rainier",
  },
  {
    src: "/assets/morph-gallery/lake.jpg",
    thumb: "/assets/morph-gallery/lake-thumb.jpg",
    alt: "Granite peaks mirrored in a serene glacial lake",
    title: "Glacial Symmetry, Patagonia",
  },
  {
    src: "/assets/morph-gallery/hills.jpg",
    thumb: "/assets/morph-gallery/hills-thumb.jpg",
    alt: "Rolling emerald tea plantations and highlands",
    title: "Misty Highlands, Nuwara Eliya",
  },
  {
    src: "/assets/morph-gallery/wildflowers.jpg",
    thumb: "/assets/morph-gallery/wildflowers-thumb.jpg",
    alt: "California poppies and orange wildflower carpet",
    title: "Antelope Valley Spring Bloom",
  },
  {
    src: "/assets/morph-gallery/beach.jpg",
    thumb: "/assets/morph-gallery/beach-thumb.jpg",
    alt: "Crystalline turquoise reef and palm canopy",
    title: "Anse Source d'Argent, Seychelles",
  },
];

export default function MorphGalleryDemo() {
  const [autoplay, setAutoplay] = useState(4500);
  const [duration, setDuration] = useState(1500);
  const [noiseScale, setNoiseScale] = useState(3.5);
  const [drift, setDrift] = useState(0.5);

  return (
    <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Component Header */}
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
          Morph Gallery
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
          A hardware-accelerated WebGL gallery whose slides dissolve through dynamic Simplex Noise and
          fractal shreds instead of standard crossfades. Features directional parallax drift, luminance burn-through,
          and touch/keyboard navigation.
        </p>

        {/* Interactive Controls Bar */}
        <div
          style={{
            display: "inline-flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "12px 20px",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Autoplay Toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e4e4e7", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoplay > 0}
              onChange={(e) => setAutoplay(e.target.checked ? 4500 : 0)}
              style={{ accentColor: "#ffffff", cursor: "pointer" }}
            />
            Autoplay (4.5s)
          </label>

          {/* Duration Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
            <span>Speed:</span>
            <input
              type="range"
              min="600"
              max="2500"
              step="100"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{ width: "80px", accentColor: "#ffffff", cursor: "pointer" }}
            />
            <span style={{ color: "#ffffff", minWidth: "42px", textAlign: "left" }}>{(duration / 1000).toFixed(1)}s</span>
          </div>

          {/* Noise Granularity Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
            <span>Noise:</span>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={noiseScale}
              onChange={(e) => setNoiseScale(Number(e.target.value))}
              style={{ width: "80px", accentColor: "#ffffff", cursor: "pointer" }}
            />
            <span style={{ color: "#ffffff", minWidth: "28px", textAlign: "left" }}>{noiseScale}x</span>
          </div>

          {/* Drift Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
            <span>Drift:</span>
            <input
              type="range"
              min="0.0"
              max="1.2"
              step="0.1"
              value={drift}
              onChange={(e) => setDrift(Number(e.target.value))}
              style={{ width: "70px", accentColor: "#ffffff", cursor: "pointer" }}
            />
            <span style={{ color: "#ffffff", minWidth: "28px", textAlign: "left" }}>{drift}</span>
          </div>
        </div>
      </div>

      {/* Main Gallery Display */}
      <MorphGallery
        items={GALLERY_ITEMS}
        height="560px"
        duration={duration}
        noiseScale={noiseScale}
        drift={drift}
        autoplay={autoplay}
        arrows={true}
        thumbnails={true}
      />
    </div>
  );
}
