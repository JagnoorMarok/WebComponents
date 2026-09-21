"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import "./wispr-flow-text-animation.css";

export const DEFAULT_FLOW_TEXT =
  "Umm, hope your week has started well…I was talking to Cheyene earlier but reception was really bad and I think their going to handle the first part of the project, but I’m not totally sure. Also, I told the team the new timeline should be ready by Friday, although it’s probably going to slip. There’s been a lot of back and forth and honestly the whole thing’s been kind of chaotic, like nobody really knows what’s going on so can you check in with them and see if the notes from yesterday’s meeting were sent out, or if they’re still waiting. I think Cheyene mentioned it but didn’t confirm, and now I’m a little lost.";

const VIEW_W = 1048;
const VIEW_H = 594;

const round = (n) => Math.round(n * 1000) / 1000;
const rp = (p) => ({ x: round(p.x), y: round(p.y) });
const lerp = (a, b, t) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

const ORIGINAL_SEGMENTS = [
  {
    p0: { x: 0.597656, y: 50.924805 },
    p1: { x: 17.4612, y: 143.2965 },
    p2: { x: 97.8522, y: 293.141 },
    p3: { x: 284.508, y: 353.548 },
  },
  {
    p0: { x: 284.508, y: 353.548 },
    p1: { x: 440.828, y: 399.056 },
    p2: { x: 583.839, y: 294.067 },
    p3: { x: 500.618, y: 184.7492 },
  },
  {
    p0: { x: 500.618, y: 184.7492 },
    p1: { x: 417.397, y: 75.4309 },
    p2: { x: 238.217, y: 282.098 },
    p3: { x: 499.258, y: 441.668 },
  },
  {
    p0: { x: 499.258, y: 441.668 },
    p1: { x: 551.913, y: 477.802 },
    p2: { x: 817.468, y: 561.26 },
    p3: { x: 1046.43, y: 565.235 },
  },
];

const SPLITS_PER_SEGMENT = 2;

function splitCubic(b, t) {
  const a1 = lerp(b.p0, b.p1, t);
  const a2 = lerp(b.p1, b.p2, t);
  const a3 = lerp(b.p2, b.p3, t);
  const b1 = lerp(a1, a2, t);
  const b2 = lerp(a2, a3, t);
  const mid = lerp(b1, b2, t);
  return {
    left: { p0: b.p0, p1: a1, p2: b1, p3: mid },
    right: { p0: mid, p1: b2, p2: a3, p3: b.p3 },
  };
}

function subCubic(b, t0, t1) {
  const right = splitCubic(b, t0).right;
  const t = (t1 - t0) / (1 - t0);
  return splitCubic(right, t).left;
}

export function buildDefaultPath() {
  return {
    start: rp(ORIGINAL_SEGMENTS[0].p0),
    segments: ORIGINAL_SEGMENTS.flatMap((cubic) => {
      const segs = [];
      for (let i = 0; i < SPLITS_PER_SEGMENT; i++) {
        const sub = subCubic(
          cubic,
          i / SPLITS_PER_SEGMENT,
          (i + 1) / SPLITS_PER_SEGMENT,
        );
        segs.push({ c1: rp(sub.p1), c2: rp(sub.p2), end: rp(sub.p3) });
      }
      return segs;
    }),
  };
}

const DEFAULT_PATH = buildDefaultPath();

const handleKey = (id) =>
  id.type === "start" ? "start" : `${id.type}-${id.seg}`;

function getPoint(state, id) {
  if (id.type === "start") return state.start;
  return state.segments[id.seg][id.type];
}

function setPoint(state, id, p) {
  if (id.type === "start") return { ...state, start: p };
  return {
    ...state,
    segments: state.segments.map((seg, i) =>
      i === id.seg ? { ...seg, [id.type]: p } : seg,
    ),
  };
}

const shift = (p, dx, dy) => ({
  x: p.x + dx,
  y: p.y + dy,
});

function moveAnchor(state, id, p) {
  const old = getPoint(state, id);
  const dx = p.x - old.x;
  const dy = p.y - old.y;
  let next = setPoint(state, id, p);
  if (id.type === "start") {
    next = setPoint(
      next,
      { type: "c1", seg: 0 },
      shift(state.segments[0].c1, dx, dy),
    );
  } else if (id.type === "end") {
    const i = id.seg;
    next = setPoint(
      next,
      { type: "c2", seg: i },
      shift(state.segments[i].c2, dx, dy),
    );
    if (i < state.segments.length - 1) {
      next = setPoint(
        next,
        { type: "c1", seg: i + 1 },
        shift(state.segments[i + 1].c1, dx, dy),
      );
    }
  }
  return next;
}

function toPathD({ start, segments }) {
  let d = `M${round(start.x)} ${round(start.y)}`;
  for (const s of segments) {
    d += `C${round(s.c1.x)} ${round(s.c1.y)} ${round(s.c2.x)} ${round(s.c2.y)} ${round(s.end.x)} ${round(s.end.y)}`;
  }
  return d;
}

function clientToSvg(svg, clientX, clientY) {
  const ctm = svg.getScreenCTM();
  if (ctm) {
    const local = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }
  const r = svg.getBoundingClientRect();
  return {
    x: ((clientX - r.left) / r.width) * VIEW_W,
    y: ((clientY - r.top) / r.height) * VIEW_H,
  };
}

export const WisprFlowTextAnimation = ({
  text = DEFAULT_FLOW_TEXT,
  speed = 25,
  fontSize = 15,
  textOpacity = 0.55,
  textColor = "#e2e8f0",
  strokeColor = "transparent",
  showEditButton = true,
  isEditing: controlledIsEditing,
  onEditingChange,
  path: controlledPath,
  onPathChange,
  className = "",
}) => {
  const svgRef = useRef(null);
  const draggingRef = useRef(null);

  const [uncontrolledEditing, setUncontrolledEditing] = useState(false);
  const isEditing = controlledIsEditing !== undefined ? controlledIsEditing : uncontrolledEditing;
  const setEditing = useCallback(
    (val) => {
      if (onEditingChange) onEditingChange(val);
      else setUncontrolledEditing(val);
    },
    [onEditingChange]
  );

  const [uncontrolledPath, setUncontrolledPath] = useState(DEFAULT_PATH);
  const path = controlledPath !== undefined ? controlledPath : uncontrolledPath;
  const setPath = useCallback(
    (updater) => {
      const nextPath = typeof updater === "function" ? updater(path) : updater;
      if (onPathChange) onPathChange(nextPath);
      else setUncontrolledPath(nextPath);
    },
    [path, onPathChange]
  );

  const d = useMemo(() => toPathD(path), [path]);

  const anchors = useMemo(
    () => [
      { type: "start" },
      ...path.segments.map((_, i) => ({ type: "end", seg: i })),
    ],
    [path.segments],
  );

  const controlPoints = useMemo(
    () =>
      path.segments.flatMap((_, i) => [
        { type: "c1", seg: i },
        { type: "c2", seg: i },
      ]),
    [path.segments],
  );

  const guides = useMemo(
    () =>
      path.segments.flatMap((s, i) => {
        const prevAnchor = i === 0 ? path.start : path.segments[i - 1].end;
        return [
          { a: prevAnchor, b: s.c1 },
          { a: s.end, b: s.c2 },
        ];
      }),
    [path],
  );

  const handlePointerDown = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = id;
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      const id = draggingRef.current;
      if (!id || !svgRef.current) return;
      const p = clientToSvg(svgRef.current, e.clientX, e.clientY);
      setPath((prev) =>
        id.type === "c1" || id.type === "c2"
          ? setPoint(prev, id, p)
          : moveAnchor(prev, id, p),
      );
    },
    [setPath],
  );

  const handlePointerUp = useCallback((e) => {
    draggingRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  const animDuration = Math.max(5, 65 - speed);

  return (
    <div className={`wispr-flow-container ${className}`}>
      <div className="wispr-flow-ambient-glow" />

      <div className="wispr-svg-wrapper">
        <svg
          ref={svgRef}
          id="wispr-hero-svg"
          className="wispr-svg-element"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", touchAction: isEditing ? "none" : "auto" }}
        >
          <path
            id="wispr-flow-curve"
            fill="transparent"
            stroke={strokeColor}
            d={d}
          />

          <text x="0" style={{ fontSize: `${fontSize}px`, fontFamily: "inherit" }}>
            <textPath
              id="wispr-marquee-text"
              href="#wispr-flow-curve"
              className="font-normal"
              style={{
                fill: textColor,
                opacity: textOpacity,
                letterSpacing: "0.01em",
              }}
            >
              {text}
            </textPath>
            <animate
              id="wispr-marquee-anim"
              attributeName="x"
              dur={`${animDuration}s`}
              values="-2000;0"
              repeatCount="indefinite"
            />
          </text>

          {isEditing && (
            <g>
              <path
                d={d}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={1.5}
                strokeDasharray="4 6"
                strokeOpacity={0.7}
                style={{ pointerEvents: "none" }}
              />

              {guides.map((g, i) => (
                <line
                  key={`guide-${i}`}
                  x1={g.a.x}
                  y1={g.a.y}
                  x2={g.b.x}
                  y2={g.b.y}
                  stroke="#38bdf8"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                  strokeOpacity={0.6}
                  style={{ pointerEvents: "none" }}
                />
              ))}

              {/* Off-line Bézier control handles (c1, c2): cyan hollow rings */}
              {controlPoints.map((id) => {
                const p = getPoint(path, id);
                return (
                  <circle
                    key={handleKey(id)}
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    className="wispr-handle-circle"
                    style={{ cursor: "grab", touchAction: "none" }}
                    onPointerDown={(e) => handlePointerDown(e, id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                );
              })}

              {/* On-line curve anchors (start, end): solid cyan dots */}
              {anchors.map((id) => {
                const p = getPoint(path, id);
                return (
                  <circle
                    key={handleKey(id)}
                    cx={p.x}
                    cy={p.y}
                    r={5}
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    className="wispr-handle-circle"
                    style={{ cursor: "grab", touchAction: "none" }}
                    onPointerDown={(e) => handlePointerDown(e, id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {showEditButton && (
        <AnimatePresence mode="popLayout" initial={false}>
          {isEditing ? (
            <motion.button
              key="done"
              layoutId="wispr-edit-toggle"
              type="button"
              onClick={() => setEditing(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                layout: { type: "spring", bounce: 0, duration: 0.35 },
              }}
              className="wispr-edit-btn active"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Done Editing</span>
            </motion.button>
          ) : (
            <motion.button
              key="edit"
              layoutId="wispr-edit-toggle"
              type="button"
              onClick={() => setEditing(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                layout: { type: "spring", bounce: 0, duration: 0.2 },
              }}
              className="wispr-edit-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              <span>Edit Path</span>
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default WisprFlowTextAnimation;
