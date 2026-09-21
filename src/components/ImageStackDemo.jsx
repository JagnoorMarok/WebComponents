import React, { useState } from "react";
import ImgStack from "./ui/image-stack";

const PORTRAIT_CARDS = [
  "/assets/image-stack/card-1.jpg",
  "/assets/image-stack/card-2.jpg",
  "/assets/image-stack/card-3.jpg",
  "/assets/image-stack/card-4.jpg",
  "/assets/image-stack/card-5.jpg",
];

const MONOCHROME_PRESET = [
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
];

export default function ImageStackDemo() {
  const [collection, setCollection] = useState("editorial");

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Demo Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: "10px",
          }}
        >
          Image Stack
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: "600px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          An interactive fanned-out card stack with natural elastic dragging, displacement threshold
          cycling, and fluid spring reordering.
        </p>

        {/* Collection Selector */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "10px",
            padding: "6px",
          }}
        >
          <button
            type="button"
            onClick={() => setCollection("editorial")}
            style={{
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "7px",
              border: "none",
              background: collection === "editorial" ? "#ffffff" : "transparent",
              color: collection === "editorial" ? "#000000" : "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Editorial Portraits
          </button>
          <button
            type="button"
            onClick={() => setCollection("monochrome")}
            style={{
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "7px",
              border: "none",
              background: collection === "monochrome" ? "#ffffff" : "transparent",
              color: collection === "monochrome" ? "#000000" : "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Studio Vogue
          </button>
        </div>
      </div>

      {/* Main Stack Interactive Stage */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "520px",
          background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.03) 0%, transparent 70%)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <ImgStack
          images={collection === "editorial" ? PORTRAIT_CARDS : MONOCHROME_PRESET}
          dragThreshold={50}
          showControls={true}
        />
      </div>
    </div>
  );
}
