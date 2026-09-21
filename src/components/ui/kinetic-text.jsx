import React from "react";
import "./kinetic-text.css";

export function KineticText({
  text = "",
  as: Tag = "h1",
  className = "",
  style = {},
  preserveWords = true,
  baseWeight = 300,
  midWeight = 600,
  peakWeight = 900,
  hoverPadding = "calc(1em / 14)",
  liftDistance = "-0.06em",
  ...rest
}) {
  const mergedStyle = {
    "--hover-padding": hoverPadding,
    "--text-stroke-width": "calc(1em * 125 / 6000)",
    "--base-weight": baseWeight,
    "--mid-weight": midWeight,
    "--peak-weight": peakWeight,
    "--lift-distance": liftDistance,
    ...style,
  };

  const renderContent = () => {
    if (!preserveWords) {
      return text.split("").map((letter, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="kinetic-text-letter"
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ));
    }

    // Split words by space while keeping spaces intact
    const words = text.split(" ");
    return words.map((word, wordIndex) => (
      <React.Fragment key={wordIndex}>
        <span className="kinetic-text-word">
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              aria-hidden="true"
              className="kinetic-text-letter"
            >
              {char}
            </span>
          ))}
        </span>
        {wordIndex < words.length - 1 && (
          <span className="kinetic-text-space" aria-hidden="true">
            &nbsp;
          </span>
        )}
      </React.Fragment>
    ));
  };

  return (
    <Tag
      className={`kinetic-text-root ${className}`.trim()}
      style={mergedStyle}
      {...rest}
    >
      {renderContent()}
      <span className="kinetic-text-sr">{text}</span>
    </Tag>
  );
}

export default KineticText;
