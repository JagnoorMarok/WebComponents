/**
 * cardGlobeData.js
 * Curated photographic and editorial cards for the 3D Card Globe.
 */

export const globeCardsData = [
  {
    id: "globe-1",
    title: "KYOTO SUNSET",
    category: "HORIZON",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
    theme: "dark-editorial",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  },
  {
    id: "globe-2",
    title: "DOLOMITE PEAKS",
    category: "ALPINE",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
    theme: "minimal-white",
    aspect: "landscape",
    width: 1.55,
    height: 1.15
  },
  {
    id: "globe-3",
    title: "ARCHITECTURAL VOID",
    category: "SPACES",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
    theme: "cream-border",
    aspect: "square",
    width: 1.3,
    height: 1.3
  },
  {
    id: "globe-4",
    title: "STUDIO SILHOUETTE",
    category: "PORTRAIT",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    theme: "polaroid",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  },
  {
    id: "globe-5",
    title: "COASTAL SURF",
    category: "OCEAN",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    theme: "dark-editorial",
    aspect: "landscape",
    width: 1.55,
    height: 1.15
  },
  {
    id: "globe-6",
    title: "PRIMEVAL WOODS",
    category: "FLORA",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
    theme: "minimal-white",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  },
  {
    id: "globe-7",
    title: "CHROME MONOCHROME",
    category: "ABSTRACT",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop",
    theme: "cream-border",
    aspect: "square",
    width: 1.3,
    height: 1.3
  },
  {
    id: "globe-8",
    title: "DESERT CREST",
    category: "TERRAIN",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1200&auto=format&fit=crop",
    theme: "dark-editorial",
    aspect: "landscape",
    width: 1.55,
    height: 1.15
  },
  {
    id: "globe-9",
    title: "TOKYO CROSSING",
    category: "URBAN",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop",
    theme: "polaroid",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  },
  {
    id: "globe-10",
    title: "CONCRETE VILLA",
    category: "DESIGN",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
    theme: "minimal-white",
    aspect: "square",
    width: 1.3,
    height: 1.3
  },
  {
    id: "globe-11",
    title: "AUTUMN FOLIAGE",
    category: "SEASON",
    image: "https://images.unsplash.com/photo-1476610397503-fce141d7f027?q=80&w=1200&auto=format&fit=crop",
    theme: "cream-border",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  },
  {
    id: "globe-12",
    title: "NIGHT MIST",
    category: "ATMOSPHERE",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop",
    theme: "dark-editorial",
    aspect: "landscape",
    width: 1.55,
    height: 1.15
  },
  {
    id: "globe-13",
    title: "PRISM OPTICS",
    category: "LIGHT",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200&auto=format&fit=crop",
    theme: "polaroid",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  },
  {
    id: "globe-14",
    title: "PETAL FORM",
    category: "ORGANIC",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop",
    theme: "minimal-white",
    aspect: "square",
    width: 1.3,
    height: 1.3
  },
  {
    id: "globe-15",
    title: "VALLEY RIDGE",
    category: "EXPANSE",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
    theme: "cream-border",
    aspect: "landscape",
    width: 1.55,
    height: 1.15
  },
  {
    id: "globe-16",
    title: "RAW CLAY",
    category: "TEXTURE",
    image: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=1200&auto=format&fit=crop",
    theme: "dark-editorial",
    aspect: "portrait",
    width: 1.15,
    height: 1.55
  }
];

export const GLOBE_CONFIG = {
  defaultRadius: 5.5,
  defaultCardCount: 44,
  minCardCount: 20,
  maxCardCount: 64,
  baseRotationSpeed: 0.18, // rad/s
  cameraDistance: 13.5,
  cameraFOV: 50
};
