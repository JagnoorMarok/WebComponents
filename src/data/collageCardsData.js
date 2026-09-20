export const collageCards = [
  {
    id: "thu",
    title: "THU",
    subtitle: "24 OCT / ISSUE 09",
    type: "thu",
    width: 165,
    height: 220,
    theme: "light-photo",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600"
  },
  {
    id: "nov2026",
    title: "2026",
    subtitle: "NOV 19",
    category: "CALENDAR",
    type: "nov2026",
    width: 180,
    height: 130,
    theme: "olive-dark",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800"
  },
  {
    id: "natural-fresh",
    title: "NATURAL",
    subtitle: "FRESH",
    tag: "BOTANICAL LAB",
    type: "natural-fresh",
    width: 190,
    height: 250,
    theme: "deep-olive"
  },
  {
    id: "stat-12k",
    title: "12K",
    subtitle: "INDEX UNITS",
    code: "SEC.08",
    type: "stat-12k",
    width: 140,
    height: 140,
    theme: "dark-graphite"
  },
  {
    id: "ave-0316",
    title: "0316 AVE",
    subtitle: "NORTH DISTRICT",
    barcode: true,
    type: "ave-0316",
    width: 210,
    height: 125,
    theme: "cream"
  },
  {
    id: "ultimate-taste",
    title: "ULTIMATE",
    subtitle: "TASTE",
    edition: "VOL. IV",
    type: "ultimate-taste",
    width: 175,
    height: 210,
    theme: "warm-cream"
  },
  {
    id: "cities",
    cities: ["MADRID", "BARCELONA", "SEVILLA", "VALENCIA"],
    type: "cities",
    width: 155,
    height: 185,
    theme: "olive-tint"
  },
  {
    id: "geometry",
    title: "FORM // 03",
    type: "geometry",
    width: 145,
    height: 145,
    theme: "charcoal-graphic"
  },
  {
    id: "photo-portrait",
    caption: "SILHOUETTE 01",
    type: "photo-portrait",
    width: 160,
    height: 230,
    theme: "photo",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600"
  },
  {
    id: "photo-arch",
    caption: "CONCRETE FORMS",
    type: "photo-arch",
    width: 170,
    height: 140,
    theme: "photo",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=600"
  },
  {
    id: "mono-dot",
    code: "PT.99",
    type: "mono-dot",
    width: 120,
    height: 120,
    theme: "off-white"
  },
  {
    id: "specs",
    title: "SPECS 004",
    coords: "40.4168° N / 3.7038° W",
    type: "specs",
    width: 175,
    height: 110,
    theme: "dark-spec"
  },
  {
    id: "studio-tag",
    label: "SERIES 04",
    edition: "ED. 50/50",
    type: "studio-tag",
    width: 140,
    height: 80,
    theme: "pure-black"
  },
  {
    id: "typo-m",
    letter: "M",
    title: "MODERN",
    type: "typo-m",
    width: 135,
    height: 175,
    theme: "sage-olive"
  },
  {
    id: "raw-texture",
    caption: "RAW SURFACE",
    type: "raw-texture",
    width: 150,
    height: 160,
    theme: "photo",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=600"
  },
  {
    id: "pill-tag",
    text: "VERIFIED ARCHIVE",
    type: "pill-tag",
    width: 150,
    height: 44,
    theme: "pill-sage"
  },
  {
    id: "index-88",
    num: "88",
    label: "EDITION DUAL",
    type: "index-88",
    width: 130,
    height: 120,
    theme: "dark-charcoal"
  }
];

export const collageLayouts = [
  // Layout 1: Initial composition - THU & NATURAL FRESH anchor the left/center
  {
    name: "Editorial Alpha",
    positions: {
      "thu":            { x: -140, y: -90,  rotate: -3.5, scale: 1.02, zIndex: 14, delay: 0 },
      "nov2026":        { x: 40,   y: -130, rotate: 2.5,  scale: 1.0,  zIndex: 10, delay: 40 },
      "natural-fresh":  { x: -60,  y: 60,   rotate: -1.5, scale: 1.05, zIndex: 16, delay: 80 },
      "stat-12k":       { x: -210, y: 40,   rotate: 4.0,  scale: 0.98, zIndex: 8,  delay: 120 },
      "ave-0316":       { x: 100,  y: -20,  rotate: -2.0, scale: 1.0,  zIndex: 12, delay: 60 },
      "ultimate-taste": { x: 130,  y: 90,   rotate: 3.5,  scale: 1.0,  zIndex: 9,  delay: 140 },
      "cities":         { x: -10,  y: -50,  rotate: -4.0, scale: 0.96, zIndex: 6,  delay: 100 },
      "geometry":       { x: 170,  y: -120, rotate: 5.0,  scale: 0.95, zIndex: 5,  delay: 160 },
      "photo-portrait": { x: -80,  y: -160, rotate: 2.0,  scale: 0.95, zIndex: 4,  delay: 180 },
      "photo-arch":     { x: 190,  y: 10,   rotate: -3.0, scale: 0.96, zIndex: 7,  delay: 90 },
      "mono-dot":       { x: -220, y: -60,  rotate: -5.5, scale: 0.92, zIndex: 3,  delay: 200 },
      "specs":          { x: 50,   y: 150,  rotate: 1.5,  scale: 0.96, zIndex: 11, delay: 110 },
      "studio-tag":     { x: -170, y: 150,  rotate: -2.5, scale: 1.0,  zIndex: 15, delay: 70 },
      "typo-m":         { x: 15,   y: 40,   rotate: -1.0, scale: 0.94, zIndex: 2,  delay: 220 },
      "raw-texture":    { x: -160, y: -160, rotate: 3.0,  scale: 0.92, zIndex: 1,  delay: 240 },
      "pill-tag":       { x: 70,   y: -85,  rotate: 1.0,  scale: 1.0,  zIndex: 17, delay: 50 },
      "index-88":       { x: -30,  y: 140,  rotate: -4.5, scale: 0.95, zIndex: 13, delay: 130 }
    }
  },

  // Layout 2: Diagonal reorganization - 2026 NOV & ULTIMATE TASTE glide to foreground
  {
    name: "Focus Shift Beta",
    positions: {
      "thu":            { x: -90,  y: -120, rotate: 1.5,  scale: 0.98, zIndex: 7,  delay: 60 },
      "nov2026":        { x: -30,  y: -70,  rotate: -2.0, scale: 1.06, zIndex: 16, delay: 0 },
      "natural-fresh":  { x: -140, y: 40,   rotate: 3.0,  scale: 0.98, zIndex: 8,  delay: 100 },
      "stat-12k":       { x: -90,  y: 120,  rotate: -3.0, scale: 1.0,  zIndex: 11, delay: 80 },
      "ave-0316":       { x: 60,   y: -110, rotate: 3.5,  scale: 0.96, zIndex: 6,  delay: 140 },
      "ultimate-taste": { x: 70,   y: 40,   rotate: -2.5, scale: 1.05, zIndex: 17, delay: 30 },
      "cities":         { x: 130,  y: -40,  rotate: 2.0,  scale: 1.0,  zIndex: 13, delay: 70 },
      "geometry":       { x: -190, y: -40,  rotate: -4.0, scale: 0.98, zIndex: 10, delay: 120 },
      "photo-portrait": { x: 120,  y: 110,  rotate: -1.5, scale: 0.98, zIndex: 5,  delay: 170 },
      "photo-arch":     { x: -180, y: 90,   rotate: 4.5,  scale: 0.94, zIndex: 4,  delay: 190 },
      "mono-dot":       { x: 20,   y: 130,  rotate: 2.5,  scale: 0.95, zIndex: 9,  delay: 110 },
      "specs":          { x: -160, y: -110, rotate: -2.0, scale: 0.95, zIndex: 3,  delay: 210 },
      "studio-tag":     { x: 90,   y: -150, rotate: 4.0,  scale: 0.96, zIndex: 12, delay: 50 },
      "typo-m":         { x: -60,  y: 30,   rotate: 3.5,  scale: 1.02, zIndex: 15, delay: 40 },
      "raw-texture":    { x: 170,  y: 30,   rotate: -3.5, scale: 0.92, zIndex: 2,  delay: 230 },
      "pill-tag":       { x: -110, y: -45,  rotate: -2.0, scale: 1.0,  zIndex: 18, delay: 20 },
      "index-88":       { x: 160,  y: -100, rotate: 1.0,  scale: 0.94, zIndex: 1,  delay: 250 }
    }
  },

  // Layout 3: Compact Core - 12K & CITIES become central focal points
  {
    name: "Compact Core",
    positions: {
      "thu":            { x: 100,  y: -90,  rotate: 4.0,  scale: 0.96, zIndex: 5,  delay: 90 },
      "nov2026":        { x: -160, y: -60,  rotate: 3.0,  scale: 0.98, zIndex: 8,  delay: 120 },
      "natural-fresh":  { x: 80,   y: 60,   rotate: -3.0, scale: 1.0,  zIndex: 11, delay: 70 },
      "stat-12k":       { x: -30,  y: -30,  rotate: 2.0,  scale: 1.06, zIndex: 17, delay: 10 },
      "ave-0316":       { x: -120, y: 70,   rotate: -1.5, scale: 1.02, zIndex: 14, delay: 50 },
      "ultimate-taste": { x: -80,  y: -130, rotate: 1.0,  scale: 0.96, zIndex: 6,  delay: 140 },
      "cities":         { x: 40,   y: -30,  rotate: -2.5, scale: 1.04, zIndex: 16, delay: 30 },
      "geometry":       { x: 60,   y: 140,  rotate: 3.5,  scale: 0.94, zIndex: 9,  delay: 100 },
      "photo-portrait": { x: -170, y: 10,   rotate: -4.0, scale: 0.97, zIndex: 12, delay: 60 },
      "photo-arch":     { x: 20,   y: -125, rotate: -2.0, scale: 0.95, zIndex: 7,  delay: 150 },
      "mono-dot":       { x: 160,  y: -30,  rotate: 5.0,  scale: 0.96, zIndex: 10, delay: 110 },
      "specs":          { x: -50,  y: 130,  rotate: 2.5,  scale: 1.0,  zIndex: 13, delay: 80 },
      "studio-tag":     { x: -40,  y: -90,  rotate: -3.5, scale: 1.0,  zIndex: 18, delay: 0 },
      "typo-m":         { x: -180, y: -120, rotate: -1.0, scale: 0.92, zIndex: 2,  delay: 220 },
      "raw-texture":    { x: 150,  y: 70,   rotate: 2.0,  scale: 0.92, zIndex: 3,  delay: 200 },
      "pill-tag":       { x: 110,  y: 10,   rotate: -1.5, scale: 1.0,  zIndex: 15, delay: 40 },
      "index-88":       { x: -140, y: -140, rotate: 4.5,  scale: 0.92, zIndex: 1,  delay: 240 }
    }
  },

  // Layout 4: Asymmetric Dispersion - 0316 AVE & PHOTO PORTRAIT take center stage
  {
    name: "Asymmetric Spread",
    positions: {
      "thu":            { x: -70,  y: 70,   rotate: -2.0, scale: 1.02, zIndex: 13, delay: 50 },
      "nov2026":        { x: 120,  y: 60,   rotate: -3.5, scale: 0.96, zIndex: 7,  delay: 110 },
      "natural-fresh":  { x: 130,  y: -90,  rotate: 2.5,  scale: 0.98, zIndex: 9,  delay: 90 },
      "stat-12k":       { x: 150,  y: 20,   rotate: -4.5, scale: 0.96, zIndex: 5,  delay: 160 },
      "ave-0316":       { x: -30,  y: -40,  rotate: 2.0,  scale: 1.06, zIndex: 17, delay: 10 },
      "ultimate-taste": { x: -160, y: -70,  rotate: -3.0, scale: 0.98, zIndex: 10, delay: 80 },
      "cities":         { x: -150, y: 70,   rotate: 4.0,  scale: 0.95, zIndex: 6,  delay: 130 },
      "geometry":       { x: -60,  y: -140, rotate: -2.5, scale: 0.96, zIndex: 8,  delay: 100 },
      "photo-portrait": { x: 50,   y: -70,  rotate: 3.0,  scale: 1.04, zIndex: 16, delay: 20 },
      "photo-arch":     { x: -90,  y: 135,  rotate: -1.5, scale: 0.96, zIndex: 11, delay: 70 },
      "mono-dot":       { x: -180, y: 10,   rotate: -3.5, scale: 0.92, zIndex: 4,  delay: 180 },
      "specs":          { x: 40,   y: 110,  rotate: -2.0, scale: 1.0,  zIndex: 14, delay: 40 },
      "studio-tag":     { x: 170,  y: -140, rotate: 1.5,  scale: 0.96, zIndex: 3,  delay: 200 },
      "typo-m":         { x: 60,   y: -150, rotate: 4.0,  scale: 0.94, zIndex: 2,  delay: 220 },
      "raw-texture":    { x: -120, y: -140, rotate: -4.0, scale: 0.92, zIndex: 1,  delay: 240 },
      "pill-tag":       { x: -40,  y: 15,   rotate: 3.5,  scale: 1.0,  zIndex: 18, delay: 0 },
      "index-88":       { x: 160,  y: 110,  rotate: -2.5, scale: 1.0,  zIndex: 12, delay: 60 }
    }
  },

  // Layout 5: Architectural Rhythm - Rear elements glide over previous foreground
  {
    name: "Architectural Grid",
    positions: {
      "thu":            { x: -120, y: -60,  rotate: 2.0,  scale: 1.04, zIndex: 16, delay: 20 },
      "nov2026":        { x: 90,   y: -100, rotate: -2.5, scale: 1.02, zIndex: 14, delay: 40 },
      "natural-fresh":  { x: -15,  y: -10,  rotate: -1.0, scale: 1.08, zIndex: 18, delay: 0 },
      "stat-12k":       { x: -160, y: 70,   rotate: 3.5,  scale: 0.98, zIndex: 10, delay: 90 },
      "ave-0316":       { x: 110,  y: 20,   rotate: -3.0, scale: 0.98, zIndex: 11, delay: 80 },
      "ultimate-taste": { x: -60,  y: 110,  rotate: 2.5,  scale: 1.0,  zIndex: 15, delay: 30 },
      "cities":         { x: 40,   y: 100,  rotate: -1.5, scale: 0.98, zIndex: 12, delay: 70 },
      "geometry":       { x: 160,  y: -40,  rotate: 4.5,  scale: 0.96, zIndex: 7,  delay: 130 },
      "photo-portrait": { x: -170, y: -110, rotate: -3.5, scale: 0.95, zIndex: 5,  delay: 150 },
      "photo-arch":     { x: 150,  y: 90,   rotate: 1.0,  scale: 0.96, zIndex: 8,  delay: 120 },
      "mono-dot":       { x: -40,  y: -135, rotate: 2.0,  scale: 0.95, zIndex: 9,  delay: 110 },
      "specs":          { x: 40,   y: -140, rotate: -4.0, scale: 0.94, zIndex: 4,  delay: 180 },
      "studio-tag":     { x: -110, y: 150,  rotate: -2.0, scale: 0.98, zIndex: 13, delay: 60 },
      "typo-m":         { x: 120,  y: -150, rotate: 3.0,  scale: 0.92, zIndex: 3,  delay: 200 },
      "raw-texture":    { x: -180, y: -20,  rotate: -5.0, scale: 0.92, zIndex: 2,  delay: 220 },
      "pill-tag":       { x: 0,    y: 75,   rotate: -1.0, scale: 1.0,  zIndex: 17, delay: 10 },
      "index-88":       { x: 170,  y: -110, rotate: 3.5,  scale: 0.92, zIndex: 1,  delay: 240 }
    }
  }
];

export default { collageCards, collageLayouts };
