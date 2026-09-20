/**
 * videoReferenceData.js
 * Definitions and 3D Z-depth revolving calculations around a common center,
 * preserving the tightly-packed uniform grid.
 */

// Uniform dimensions for 3x3 tightly packed grid
export const UNIFORM_CARD_WIDTH = 190;
export const UNIFORM_CARD_HEIGHT = 225;

export const videoCards = [
  {
    id: "thu-center",
    type: "thu-large",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    title: "THU",
    subtitle: "0316 AVE",
    image: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=1200",
    order: 0
  },
  {
    id: "nov-olive-1",
    type: "nov-olive",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    year: "2026",
    month: "NOV",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80",
    order: 1
  },
  {
    id: "natural-fresh",
    type: "natural-fresh",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    title: "NATURAL",
    subtitle: "FRESH",
    order: 2
  },
  {
    id: "card-12k",
    type: "stat-12k",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    number: "12K",
    label1: "contributor",
    label2: "_worldwide_",
    image: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=1200",
    order: 3
  },
  {
    id: "ultimate-taste",
    type: "ultimate-taste",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    title: "ULTIMATE",
    subtitle: "TASTE",
    order: 4
  },
  {
    id: "maple-street",
    type: "maple-street",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    line1: "Maple Street is a",
    line2: "lovely avenue with",
    line3: "lush trees",
    order: 5
  },
  {
    id: "arch-pattern",
    type: "arch-pattern",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    order: 6
  },
  {
    id: "madrid",
    type: "cities-madrid",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    cities: ["MADRID", "BARCELONA", "SEVILLA"],
    num1: "1280",
    num2: "0095",
    order: 7
  },
  {
    id: "checker-portrait",
    type: "checker-portrait",
    width: UNIFORM_CARD_WIDTH,
    height: UNIFORM_CARD_HEIGHT,
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200",
    order: 8
  }
];

// Exact 3x3 Grid Geometry (3 columns x 3 rows = 9 slots)
export const GRID_COLS = 3;
export const GRID_ROWS = 3;
export const COL_SPACING = 206; // 190px width + 16px gap
export const ROW_SPACING = 241; // 225px height + 16px gap

/**
 * 3x3 Grid Slot layout:
 * Slots 0 to 7: 8 perimeter slots revolving around center (0,0) clockwise:
 *  - 0: Top-Left    (-COL_SPACING, -ROW_SPACING)
 *  - 1: Top-Center   (0, -ROW_SPACING)
 *  - 2: Top-Right   (+COL_SPACING, -ROW_SPACING)
 *  - 3: Mid-Right   (+COL_SPACING, 0)
 *  - 4: Bottom-Right(+COL_SPACING, +ROW_SPACING)
 *  - 5: Bottom-Center(0, +ROW_SPACING)
 *  - 6: Bottom-Left (-COL_SPACING, +ROW_SPACING)
 *  - 7: Mid-Left    (-COL_SPACING, 0)
 * Slot 8: Center Anchor (0, 0)
 */
export const gridSlots = [
  { id: 0, col: 0, row: 0, x: -COL_SPACING, y: -ROW_SPACING, label: 'top-left' },
  { id: 1, col: 1, row: 0, x: 0,            y: -ROW_SPACING, label: 'top-center' },
  { id: 2, col: 2, row: 0, x: COL_SPACING,  y: -ROW_SPACING, label: 'top-right' },
  { id: 3, col: 2, row: 1, x: COL_SPACING,  y: 0,            label: 'mid-right' },
  { id: 4, col: 2, row: 2, x: COL_SPACING,  y: ROW_SPACING,  label: 'bottom-right' },
  { id: 5, col: 1, row: 2, x: 0,            y: ROW_SPACING,  label: 'bottom-center' },
  { id: 6, col: 0, row: 2, x: -COL_SPACING, y: ROW_SPACING,  label: 'bottom-left' },
  { id: 7, col: 0, row: 1, x: -COL_SPACING, y: 0,            label: 'mid-left' },
  { id: 8, col: 1, row: 1, x: 0,            y: 0,            label: 'center' }
];

/**
 * Mode 1: Revolving 3x3 Grid Conveyor
 * Preserves the exact 3x3 grid geometry at all times:
 * The 8 perimeter cards smoothly glide through the 8 perimeter slots of the 3x3 grid.
 * - In the bottom foreground slots (y > 0): cards come forward (+Z, scale 1.12, zIndex 60, bright).
 * - As they revolve towards the top background slots (y < 0): cards plunge backwards (-Z, scale 0.85, zIndex 10),
 *   giving way to oncoming front cards.
 * - Center card (Slot 8) stays as the anchor centerpiece at (0, 0), gently pulsing in 3D.
 */
export function calculateSlotConveyor3DTransform(progress, cardIndex) {
  // If this is the 9th card (cardIndex 8), it anchors the center (0, 0) of the 3x3 grid
  if (cardIndex === 8) {
    const alpha = progress * Math.PI * 2;
    const cosA = Math.cos(alpha);
    const sinA = Math.sin(alpha);
    const z = 40 + cosA * 35; // gentle float between +5px and +75px
    return {
      x: 0,
      y: 0,
      z,
      scale: 1.0 + cosA * 0.04,
      zIndex: 35,
      rotateX: -sinA * 3,
      rotateY: sinA * 4,
      rotateZ: 0,
      opacity: 1,
      brightness: 1
    };
  }

  // The 8 perimeter cards revolve through the 8 perimeter slots (0..7)
  const N = 8;
  const floatIndex = (cardIndex + progress * N) % N;
  const slotIdx = Math.floor(floatIndex) % N;
  const nextSlotIdx = (slotIdx + 1) % N;
  const fraction = floatIndex - Math.floor(floatIndex);

  // Smoothstep interpolation between adjacent 3x3 grid slots
  const ease = fraction * fraction * (3 - 2 * fraction);

  const s1 = gridSlots[slotIdx];
  const s2 = gridSlots[nextSlotIdx];

  const x = s1.x * (1 - ease) + s2.x * ease;
  const y = s1.y * (1 - ease) + s2.y * ease;

  // Normalized Y position: bottom row has y = +ROW_SPACING, top row has y = -ROW_SPACING
  const normY = y / ROW_SPACING; // -1 (top) to +1 (bottom)
  const normX = x / COL_SPACING; // -1 (left) to +1 (right)

  // 3D Z-Depth: Cards on bottom (y > 0) are in FRONT (+Z: up to +170px)
  // Cards on top (y < 0) dive BACKWARDS into -Z (down to -170px) to give way
  const z = normY * 165 + normX * 25;

  // Normalized depth: 1 at front peak, 0 at deep back
  const normalizedDepth = Math.max(0, Math.min(1, (z + 180) / 360));

  // Front cards scale up, back cards scale down
  const scale = 0.86 + normalizedDepth * 0.26;
  const zIndex = Math.round(5 + normalizedDepth * 55);

  // Subtle 3D tilt
  const rotateX = -normY * 6;
  const rotateY = normX * 7;
  const rotateZ = (normX * normY) * -2;

  const opacity = 0.72 + normalizedDepth * 0.28;
  const brightness = 0.80 + normalizedDepth * 0.20;

  return {
    x,
    y,
    z,
    scale,
    zIndex,
    rotateX,
    rotateY,
    rotateZ,
    opacity,
    brightness
  };
}

/**
 * Mode 2: Continuous 3D Elliptical Revolution Around Center
 * All perimeter cards continuously revolve in 3D around the center (0, 0)
 * while conforming to the 3x3 grid perimeter dimensions.
 */
export function calculateRevolvingGrid3DTransform(progress, cardIndex) {
  // Center card (index 8) stays as anchor in center while floating in Z
  if (cardIndex === 8) {
    const alpha = progress * Math.PI * 2;
    const cosA = Math.cos(alpha);
    const sinA = Math.sin(alpha);
    const z = 50 + cosA * 40;
    return {
      x: 0,
      y: 0,
      z,
      scale: 1.02,
      zIndex: 36,
      rotateX: -sinA * 3,
      rotateY: sinA * 4,
      rotateZ: 0,
      opacity: 1,
      brightness: 1
    };
  }

  // 8 cards evenly distributed around 360 degrees
  const baseAngle = (cardIndex / 8) * Math.PI * 2 - (Math.PI / 2); // Start at top
  const currentAngle = baseAngle + progress * Math.PI * 2;

  const cosAngle = Math.cos(currentAngle);
  const sinAngle = Math.sin(currentAngle);

  // Rounded squircle / 3x3 grid envelope:
  // Interpolates between pure ellipse and rectangular 3x3 perimeter for tight grid packing
  const p = 3.5; // Superellipse power for tight rounded grid box
  const cosSign = Math.sign(cosAngle);
  const sinSign = Math.sign(sinAngle);
  const cosP = Math.pow(Math.abs(cosAngle), 2 / p);
  const sinP = Math.pow(Math.abs(sinAngle), 2 / p);

  const x = COL_SPACING * 1.08 * cosSign * cosP;
  const y = ROW_SPACING * 1.06 * sinSign * sinP;

  // Z-Depth: Cards on bottom (sinAngle > 0) are in FRONT (+Z: up to +180px)
  // Cards on top (sinAngle < 0) plunge BACKWARDS into -Z (down to -180px)
  const z = sinAngle * 175 + cosAngle * 25;

  const normalizedDepth = Math.max(0, Math.min(1, (z + 185) / 370));
  const scale = 0.85 + normalizedDepth * 0.27;
  const zIndex = Math.round(5 + normalizedDepth * 55);

  const rotateX = -sinAngle * 7;
  const rotateY = cosAngle * 8;
  const rotateZ = (cosAngle * sinAngle) * 3;

  const opacity = 0.72 + normalizedDepth * 0.28;
  const brightness = 0.80 + normalizedDepth * 0.20;

  return {
    x,
    y,
    z,
    scale,
    zIndex,
    rotateX,
    rotateY,
    rotateZ,
    opacity,
    brightness
  };
}

export default {
  UNIFORM_CARD_WIDTH,
  UNIFORM_CARD_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  COL_SPACING,
  ROW_SPACING,
  videoCards,
  gridSlots,
  calculateRevolvingGrid3DTransform,
  calculateSlotConveyor3DTransform
};
