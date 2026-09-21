// Complete Code, Architecture & "How We Made It" Data for Every Component
// Uses Vite's native ?raw import to guarantee 100% genuine, complete, unshortened source code

import constellationRaw from "@/components/ui/constellation-field.jsx?raw";
import interfaceCraftsRaw from "@/components/ui/interface-crafts-cards.jsx?raw";
import wisprFlowRaw from "@/components/ui/wispr-flow-text-animation.jsx?raw";
import floatingDockRaw from "@/components/ui/floating-dock.jsx?raw";
import imageSpringRaw from "@/components/ImageSpring.jsx?raw";
import webcamPixelGridRaw from "@/components/WebcamPixelGridDemo.jsx?raw";
import imageTrailRaw from "@/components/ImageTrail.jsx?raw";
import cardGlobeRaw from "@/components/CardGlobe.jsx?raw";
import cardTunnelRaw from "@/components/CardTunnel.jsx?raw";
import cardTossRaw from "@/components/CardToss.jsx?raw";
import videoCollageRaw from "@/components/VideoReferenceCollage.jsx?raw";
import cardCollageRaw from "@/components/AnimatedCardCollage.jsx?raw";
import threedCardRingRaw from "@/components/ThreeDCardRing.jsx?raw";
import grainyCarouselRaw from "@/components/GrainyCarousel.jsx?raw";
import focusSliceRaw from "@/components/FocusSliceCarousel.jsx?raw";
import magazineRaw from "@/components/Magazine.jsx?raw";
import buttonsRaw from "@/components/ButtonShowcase.jsx?raw";
import stackTowerRaw from "@/components/ui/stack-tower.jsx?raw";
import morphGalleryRaw from "@/components/ui/morph-gallery.jsx?raw";
import waterRippleRaw from "@/components/ui/water-ripple-image.jsx?raw";
import imageStackRaw from "@/components/ui/image-stack.jsx?raw";
import inkRevealRaw from "@/components/ui/ink-reveal.jsx?raw";
import cursorParticlesTypographyRaw from "@/components/ui/cursor-driven-particles-typography.jsx?raw";
import kineticTextRaw from "@/components/ui/kinetic-text.jsx?raw";

export const COMPONENTS_CODE_DATA = {
  "constellation-field": {
    title: "Constellation Field",
    category: "Canvas 2D & Particle Physics",
    badge: "CANVAS PARTICLES",
    author: "Meng To / ThreeUI / 21st.dev",
    description: "An animated canvas background of drifting, pointer-reactive particle nodes connected by fading constellation lines with real-time gravitational attraction and click shockwaves.",
    howItWorks: [
      {
        title: "1. High-DPI Canvas Architecture",
        desc: "Initializes a 2D HTML5 Canvas element scaled by window.devicePixelRatio (capped at 2x) to ensure pixel-crisp starlight nodes on Retina and 4K displays without blurring or performance degradation.",
      },
      {
        title: "2. Particle State Machine & Velocity Drift",
        desc: "Each particle node maintains continuous position (x, y), velocity (vx, vy), a base radius, and an oscillation phase. Nodes drift smoothly in 2D space and bounce off canvas boundaries with elastic deflection vectors (vx = -vx, vy = -vy).",
      },
      {
        title: "3. Spatial Proximity Constellation Links",
        desc: "Every frame iterates through node pairs. When the Euclidean distance between two nodes is less than LINK = 160 * length, an anti-aliased line is drawn. Line opacity is dynamically faded using (0.2 + (1 - d / LINK) * 0.6) * opacity so lines appear organically as stars drift near.",
      },
      {
        title: "4. Interactive Pointer Gravity & Cursor Links",
        desc: "Window-level pointer tracking calculates cursor coordinates relative to canvas bounds. When the cursor enters proximity (240px), nodes accelerate toward the mouse with a magnetic pull. Furthermore, luminous constellation lines bridge directly from the cursor to all nearby stars.",
      },
      {
        title: "5. Cosmic Shockwave Impulse",
        desc: "Clicking or tapping anywhere triggers an expanding radial shockwave: nodes within 280px receive an instant outward velocity impulse (1 - d / 280) * 5 directed along Math.atan2(y - py, x - px), which gradually dampens back into ambient orbit.",
      },
      {
        title: "6. Dual-Layer Starlight Shaders",
        desc: "Nodes are rendered in two passes: an expansive soft halo (radius * 2.5 with 32% alpha) and a solid bright core (100% alpha), both undulating with sinusoidal time-phase breathing (pulse = 0.75 + sin(t + phase) * 0.25).",
      },
    ],
    techStack: ["React", "HTML5 Canvas 2D", "RequestAnimationFrame", "ResizeObserver", "Trigonometric Physics"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import ConstellationField from "@/components/ui/constellation-field";

export default function HeroSection() {
  return (
    <div className="relative w-full h-[640px] overflow-hidden rounded-2xl bg-[#070914]">
      {/* Interactive Canvas Background */}
      <ConstellationField
        mode="dark"
        speed={1.0}
        size={1.0}
        strokeWidth={1.0}
        length={1.0}
        density={1.0}
        opacity={1.0}
        hue={0}
        saturation={1.0}
        brightness={1.0}
      />

      {/* Your Hero Content On Top */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white pointer-events-none">
        <h1 className="text-5xl font-light">Welcome to the Stars</h1>
      </div>
    </div>
  );
}`,
    componentCode: constellationRaw,
    props: [
      { name: "mode", type: "'dark' | 'light'", default: "'dark'", desc: "Canvas color scheme (#070914 with pale gold #E6C879 or #F8FAFC with bronze)" },
      { name: "speed", type: "number", default: "1.0", desc: "Multiplier controlling node drift velocity and gravitational acceleration" },
      { name: "size", type: "number", default: "1.0", desc: "Scale factor for particle radius (both halo and core)" },
      { name: "strokeWidth", type: "number", default: "1.0", desc: "Width in pixels for constellation interconnect lines" },
      { name: "length", type: "number", default: "1.0", desc: "Connection proximity threshold (base 160px * length)" },
      { name: "density", type: "number", default: "1.0", desc: "Particle density multiplier based on viewport resolution" },
      { name: "opacity", type: "number", default: "1.0", desc: "Global opacity multiplier for stars and linkages" },
      { name: "hue", type: "number", default: "0", desc: "CSS hue-rotate filter offset in degrees (-180 to 180)" },
      { name: "interactive", type: "boolean", default: "true", desc: "Enables pointer gravity, cursor linkages, and click shockwave" },
    ],
  },

  "stack-tower": {
    title: "Stack Tower",
    category: "3D Kinetic Typography & Motion",
    badge: "3D TYPOGRAPHY",
    author: "AI Canvas / 21st.dev",
    description: "An animated column of stacked rotating cylindrical text rings built with 3D CSS and Motion, featuring interactive hover row expansion and simulated cylindrical lighting.",
    howItWorks: [
      {
        title: "1. Cylindrical Coordinate Mapping",
        desc: "Each stacked text row is mapped onto a virtual rotating 3D cylinder. Its angle on the cylinder is determined by: local = phase * 2π + rowIndex * 0.35, staggering the rotation across the entire column.",
      },
      {
        title: "2. Perspective & Tangent Projection",
        desc: "Translates 3D rotational coordinates into CSS transforms: scaleX = 0.55 + 0.45 * cos(local) compresses the text as it wraps toward cylinder edges, shiftX = sin(local) * amplitude drives horizontal travel, and skewX = sin(local) * 6 simulates tangential perspective curvature.",
      },
      {
        title: "3. Simulated Cylindrical Diffuse Lighting",
        desc: "A custom hex color interpolation function mix(dim, fg, tt) calculates text brightness based on tt = (cos(local) + 1) / 2. Text facing directly toward the camera is bright white, while text rotating toward the back seamlessly fades into dark shadows.",
      },
      {
        title: "4. Interactive Row Magnification",
        desc: "Hovering or tapping any individual row applies an exponential magnification ease: hoverTarget = i === hovered ? 1 : 0 with smoothing alpha = 1 - exp(-10 * dtSec), smoothly expanding row scale and shifting text to a vibrant accent color.",
      },
      {
        title: "5. Infinite Horizon Gradient Masks",
        desc: "Top and bottom linear-gradient masks (height: 24%) seamlessly dissolve the cylinder into the background, creating the optical illusion of an infinite typographic column rising from the void.",
      },
    ],
    techStack: ["React", "Motion", "useAnimationFrame", "Trigonometric Transforms", "Color Interpolation"],
    dependencies: ["motion", "react", "react-dom"],
    usageSnippet: `import StackTower from "@/components/ui/stack-tower";

export default function HeroTypography() {
  return (
    <div className="w-full h-screen bg-[#0A0A0A]">
      <StackTower
        words={["STACK", "TOWER"]}
        rowCount={12}
        secondsPerCycle={5}
        amplitude={22}
        accentColor="#F16D14"
        mode="dark"
      />
    </div>
  );
}`,
    componentCode: stackTowerRaw,
    props: [
      { name: "words", type: "string[]", default: "['STACK', 'TOWER']", desc: "Array of words alternating sequentially down the stacked cylinder" },
      { name: "rowCount", type: "number", default: "12", desc: "Number of vertical text rows stacked in the column" },
      { name: "secondsPerCycle", type: "number", default: "5", desc: "Duration in seconds for one complete 360-degree cylinder revolution" },
      { name: "amplitude", type: "number", default: "22", desc: "Maximum horizontal sway distance in pixels" },
      { name: "hoverScaleBoost", type: "number", default: "0.12", desc: "Scale enlargement factor applied when a row is hovered" },
      { name: "accentColor", type: "string", default: "'#F16D14'", desc: "Highlight color applied to the hovered text row" },
      { name: "mode", type: "'dark' | 'light'", default: "'dark'", desc: "Color theme mode (#0A0A0A dark or #EFEEE6 warm paper light)" },
      { name: "fontSize", type: "string", default: "'clamp(1.75rem, 8.5vw, 4.25rem)'", desc: "CSS font-size string with clamp for responsive typography" },
    ],
  },

  "morph-gallery": {
    title: "Morph Gallery",
    category: "WebGL Shaders & Kinetic Transitions",
    badge: "WEBGL GLSL",
    author: "Kedhareswer Naidu / 21st.dev",
    description: "A hardware-accelerated WebGL gallery whose slides dissolve through dynamic Simplex Noise and fractal shreds instead of standard crossfades. Features directional parallax drift, luminance burn-through, and touch/keyboard navigation.",
    howItWorks: [
      {
        title: "1. GLSL Simplex Noise & Fractal Brownian Motion (FBM)",
        desc: "Evaluates a 5-octave FBM loop in the fragment shader powered by 2D Simplex Noise. The noise field is frequency-scaled by u_scale and dynamically offset along the transition trajectory to yield tearing textural shred patterns.",
      },
      {
        title: "2. Dynamic Luminance Burn-Through",
        desc: "Instead of uniform dissolving, the shader computes noise = smoothstep(0.0, 2.0, length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise). High-luminance, lit regions of the incoming photograph punch through first, creating an organic burning shred aesthetic.",
      },
      {
        title: "3. Opposing Dual-Layer Parallax Drift",
        desc: "Both outgoing and incoming frames slide vertically during the dissolve in opposite directions: fromUV drifts forward via noise * progress * drift, while toUV drifts counter-directional via -0.5 * drift * (1 - progress). This creates multi-planar depth rather than flat transitions.",
      },
      {
        title: "4. Aspect-Ratio Cover UV with Mirror Reflection",
        desc: "Non-power-of-two photograph textures prevent standard GL_MIRRORED_REPEAT filtering in WebGL 1.0. A custom GLSL mirror(uv) function (1.0 - abs(1.0 - mod(uv, 2.0))) prevents pixel smearing at canvas boundaries while preserving true object-fit: cover proportions.",
      },
      {
        title: "5. Smooth Quintic Transition Curve",
        desc: "Transition progress is governed by easeInOutQuint(t) (t < 0.5 ? 16 * t^5 : 1 - (-2*t + 2)^5 / 2), producing an ultra-refined acceleration and deceleration profile matching physical spring damping.",
      },
      {
        title: "6. High-Performance Hardware Context Lifecycle",
        desc: "Gracefully manages WebGL context loss (webglcontextlost) and restoration (webglcontextrestored), tracks tab visibility to pause autoplay timers when out of focus, and includes a seamless DOM fallback if WebGL is unsupported.",
      },
    ],
    techStack: ["React", "WebGL 1.0", "GLSL Shaders", "Simplex Noise", "FBM", "ResizeObserver"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import MorphGallery from "@/components/ui/morph-gallery";

const ITEMS = [
  {
    src: "https://example.com/forest.jpg",
    thumb: "https://example.com/forest-thumb.jpg",
    alt: "Sun rays through a forest",
    title: "Golden Hour in Black Forest",
  },
  {
    src: "https://example.com/mountain.jpg",
    thumb: "https://example.com/mountain-thumb.jpg",
    alt: "Snow-capped mountain peak",
    title: "Nocturnal Summit, Mount Rainier",
  },
];

export default function GalleryHero() {
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <MorphGallery items={ITEMS} autoplay={4500} noiseScale={3.5} drift={0.5} />
    </div>
  );
}`,
    componentCode: morphGalleryRaw,
    props: [
      { name: "items", type: "Array<{ src, thumb, alt, title }>", default: "[]", desc: "Array of gallery image items with source, thumbnail, and descriptive caption" },
      { name: "height", type: "string", default: "'620px'", desc: "CSS height string for the gallery container" },
      { name: "duration", type: "number", default: "1500", desc: "Duration of the WebGL noise transition in milliseconds" },
      { name: "noiseScale", type: "number", default: "3.5", desc: "Granularity/frequency scale of the Simplex Noise & FBM generator" },
      { name: "edge", type: "number", default: "0.15", desc: "Softness of the burn threshold transition sweep" },
      { name: "drift", type: "number", default: "0.5", desc: "Parallax drift displacement factor between outgoing and incoming frames" },
      { name: "loop", type: "boolean", default: "true", desc: "Whether navigation loops infinitely between first and last items" },
      { name: "autoplay", type: "number", default: "4500", desc: "Autoplay delay in milliseconds (0 to disable)" },
      { name: "arrows", type: "boolean", default: "true", desc: "Renders previous and next frosted navigation buttons" },
      { name: "thumbnails", type: "boolean", default: "true", desc: "Renders the interactive thumbnail filmstrip bar at the bottom" },
    ],
  },

  "water-ripple-image": {
    title: "Water Ripple Image",
    category: "WebGL Shaders & Fluid Simulation",
    badge: "FLUID SIMULATION",
    author: "Rahil / 21st.dev",
    description: "Immersive hero background that applies real-time animated water ripples, procedural wave harmonics, and caustic light refraction to any image using WebGL GLSL shaders.",
    howItWorks: [
      {
        title: "1. Procedural 10-Octave Surface Wave Harmonics",
        desc: "The fragment shader computes fluid surface waves by iterating 10 harmonic octaves through a rotational matrix rotate2D(0.5). In each octave, scale increases by 1.2x while sinusoidal displacements (sin(q), cos(q)) accumulate into a complex fluid heightfield.",
      },
      {
        title: "2. Dual-Layer Simplex Noise & Directional Swell",
        desc: "Combines 2D Simplex Noise (snoise) for low-frequency undulating water swells (outer_noise) with high-frequency surface noise (surf). These modulate texture coordinates across two distinct parameters: u_water_distortion and u_surface_distortion.",
      },
      {
        title: "3. Optical Caustic Illumination & Chromatic Tint",
        desc: "Surface wave crests concentrate light through simulated refraction: img *= (1.0 + u_illumination * surf) and blend with a chromatic water tint vector u_illumination * vec3(1.0 - u_blueish, 1.0, 1.0) * surf, mimicking sunlight refracting through clear water.",
      },
      {
        title: "4. Dynamic Aspect Ratio & Margin Fitting",
        desc: "The shader continuously factors both canvas aspect ratio (u_ratio) and original image aspect ratio (u_img_ratio), scaling coordinates like object-fit: cover with an engineered 1.4x margin factor to eliminate border clipping during intense wave displacement.",
      },
      {
        title: "5. Dual-Axis Edge Vignetting",
        desc: "Smoothly attenuates image boundaries using dual-axis smoothstep vignetting: smoothstep(0.0, edge_width, img_uv.x) * smoothstep(1.0, 1.0 - edge_width, img_uv.x), preventing hard border artifacts across varying canvas dimensions.",
      },
      {
        title: "6. Hardware Animation & Retina Crispness",
        desc: "Drives uniform u_time via performance.now() inside requestAnimationFrame at 60+ FPS, paired with a ResizeObserver scaling to window.devicePixelRatio (capped at 2x) for razor-sharp visual fidelity on high-density displays.",
      },
    ],
    techStack: ["React", "WebGL 1.0", "GLSL Shaders", "Simplex Noise", "Trigonometric Harmonics", "ResizeObserver"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import { WaterRippleImage } from "@/components/ui/water-ripple-image";

export default function HeroSection() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <WaterRippleImage
        src="/assets/water-ripple/default.jpg"
        blueish={0.4}
        scale={7}
        illumination={0.15}
        surfaceDistortion={0.03}
        waterDistortion={0.02}
        allowUpload={true}
      />
    </div>
  );
}`,
    componentCode: waterRippleRaw,
    props: [
      { name: "src", type: "string", default: "'/assets/water-ripple/default.jpg'", desc: "Path or URL to the base image" },
      { name: "blueish", type: "number", default: "0.4", desc: "Blue chromatic tint factor between 0.0 and 1.0" },
      { name: "scale", type: "number", default: "7", desc: "Frequency / scale of the procedural surface water waves (2 to 16)" },
      { name: "illumination", type: "number", default: "0.15", desc: "Caustic light reflection and highlight brightness factor" },
      { name: "surfaceDistortion", type: "number", default: "0.03", desc: "High-frequency surface ripple refraction displacement" },
      { name: "waterDistortion", type: "number", default: "0.02", desc: "Low-frequency ambient water swell distortion displacement" },
      { name: "allowUpload", type: "boolean", default: "true", desc: "Enables custom image file upload button" },
    ],
  },

  "image-stack": {
    title: "Image Stack",
    category: "Motion & Interactive Cards",
    badge: "DRAGGABLE STACK",
    author: "Tony Zebastian / 21st.dev",
    description: "An interactive fanned-out card stack component that displays imagery with natural elastic dragging, displacement threshold cycling, and fluid spring reordering.",
    howItWorks: [
      {
        title: "1. Fanned Arc Layout Calculation",
        desc: "Cards are staggered along an organic offset trajectory: x: index * -12, y: index * -8, rotate: index === 0 ? 0 : -(2 + index * 3), and scale: 1 - index * 0.03. The active top card stays centered while rear cards fan outwards with progressive depth.",
      },
      {
        title: "2. Z-Index Layer Stacking & Inversion",
        desc: "Layer order is preserved via zIndex: 50 - index * 10. When cycling occurs, the front card shifts to the back while the remaining cards animate upwards by one layer position through smooth Motion layout transitions.",
      },
      {
        title: "3. Gesture Drag Threshold Detection",
        desc: "Tracks pointer coordinates via dragStartPoint.current = { x: info.point.x, y: info.point.y }. Upon gesture release, Euclidean distance Math.sqrt(dx^2 + dy^2) is evaluated against DRAG_THRESHOLD (50px) to trigger the next card cycle.",
      },
      {
        title: "4. Spring Snap-Back Physics",
        desc: "Enabled with dragSnapToOrigin={true}, dragElastic={0.25}, and spring tuning (bounceStiffness: 550, bounceDamping: 14), providing a tactile physical snap if dragged below the cycle threshold.",
      },
      {
        title: "5. Dynamic Elevation & Scale Feedback",
        desc: "Top card features subtle hover magnification (scale: 1.04), and elevates during dragging (scale: 1.08, zIndex: 100) with dynamic drop shadows (boxShadow: 0 30px 60px -10px rgba(0,0,0,0.65)).",
      },
    ],
    techStack: ["React", "Motion", "Spring Physics", "Gesture Recognition", "Z-Index Stacking"],
    dependencies: ["motion", "react", "react-dom"],
    usageSnippet: `import ImgStack from "@/components/ui/image-stack";

const IMAGES = [
  "/assets/image-stack/card-1.jpg",
  "/assets/image-stack/card-2.jpg",
  "/assets/image-stack/card-3.jpg",
  "/assets/image-stack/card-4.jpg",
  "/assets/image-stack/card-5.jpg",
];

export default function CardShowcase() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <ImgStack images={IMAGES} dragThreshold={50} showControls={true} />
    </div>
  );
}`,
    componentCode: imageStackRaw,
    props: [
      { name: "images", type: "Array<string | { src, alt, tag }>", default: "[]", desc: "Array of image URLs or image objects" },
      { name: "dragThreshold", type: "number", default: "50", desc: "Drag distance in pixels required to cycle cards" },
      { name: "showControls", type: "boolean", default: "true", desc: "Renders previous/next buttons and pagination indicator dots" },
    ],
  },

  "ink-reveal": {
    title: "Ink Reveal",
    category: "Interactive Canvas & Compositing",
    badge: "CANVAS COMPOSITING",
    author: "Aayush Duhan / 21st.dev",
    description: "A canvas overlay that lets users brush away a colored mask to reveal underlying imagery and typography using destination-out compositing and harmonic sinusoidal wobble.",
    howItWorks: [
      {
        title: "1. Destination-Out Canvas Compositing",
        desc: "Fills the canvas with an opaque mask (source-over), then switches to ctx.globalCompositeOperation = 'destination-out'. Any shape drawn afterwards carves transparent holes through the mask, letting the HTML content underneath shine through seamlessly.",
      },
      {
        title: "2. Multi-Frequency Harmonic Sinusoidal Wobble",
        desc: "Rather than simple rigid circles, each stamp iterates 36 radial segments with 3 sinusoidal wave harmonics: 0.78 + w[0]*sin(3θ + seed) + w[1]*sin(5θ + 2.1*seed) + w[2]*sin(7θ + 0.7*seed). This produces organic, flowing ink droplet shapes.",
      },
      {
        title: "3. Temporal Interpolation & Stroke Density",
        desc: "When moving the mouse quickly, consecutive coordinates are interpolated via Euclidean distance (Math.hypot(dx, dy) / stampStep), guaranteeing uninterrupted brush strokes without gaps or stuttering.",
      },
      {
        title: "4. Cubic Ease Expansion & Quadratic Fade",
        desc: "As stamps age, their radii expand via cubic ease-out (1 - (1 - t)^3) while opacity decays quadratically (1 - t^2), giving the natural sensation of ink diffusing into paper and gradually evaporating.",
      },
      {
        title: "5. Soft Radial Feathers & High-DPI Rendering",
        desc: "Stamped holes use 3-stop radial gradients to feather the outer boundary. The canvas dimensions are dynamically bound to the parent container scaled by devicePixelRatio (capped at 2x) for razor-sharp rendering.",
      },
    ],
    techStack: ["React", "HTML5 Canvas 2D", "GlobalCompositeOperation", "Trigonometric Harmonics", "RequestAnimationFrame"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import InkReveal from "@/components/ui/ink-reveal";

export default function RevealSection() {
  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      <img
        src="/assets/ink-reveal/landscape.jpg"
        alt="Landscape"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <InkReveal maskColor={[14, 14, 18]} brushSize={130} lifetime={850} />
    </div>
  );
}`,
    componentCode: inkRevealRaw,
    props: [
      { name: "maskColor", type: "number[] | string", default: "[14, 14, 18]", desc: "RGB array [r, g, b] or hex/rgb color string for the canvas mask" },
      { name: "brushSize", type: "number", default: "128", desc: "Diameter in pixels of the ink stamp" },
      { name: "lifetime", type: "number", default: "750", desc: "Duration in milliseconds before the carved ink hole heals back" },
      { name: "rStart", type: "number", default: "12", desc: "Initial stamp radius in pixels upon spawn" },
      { name: "rVary", type: "number", default: "0.45", desc: "Random radius variation factor" },
      { name: "stampStep", type: "number", default: "10", desc: "Interpolation step in pixels between cursor events" },
      { name: "showCustomCursor", type: "boolean", default: "true", desc: "Displays floating brush guide ring" },
    ],
  },

  "cursor-particles-typography": {
    title: "Cursor Particles Typography",
    category: "Canvas 2D & Particle Dynamics",
    badge: "KINETIC TYPOGRAPHY",
    author: "Harsh Jadhav / 21st.dev",
    description: "Interactive particle-based typography rendered on canvas. Text is synthesized from thousands of dynamic micro-particles that disperse on cursor proximity and smoothly return with spring elasticity and click shockwave physics.",
    howItWorks: [
      {
        title: "1. Offscreen Glyph Geometry Rasterization",
        desc: "Renders the specified typography string onto an HTML5 2D canvas scaled by window.devicePixelRatio. Font size automatically scales dynamically to container bounds so text never clips across screen sizes.",
      },
      {
        title: "2. Alpha-Channel Spatial Grid Sampling",
        desc: "Extracts pixel data with ctx.getImageData. Iterates through pixel coordinates using step = Math.max(1, Math.floor(particleDensity * dpr)). Any pixel whose alpha channel exceeds threshold (> 120) spawns an independent Particle node mapped back to viewport space (x / dpr, y / dpr).",
      },
      {
        title: "3. Inverse-Distance Cursor Repulsion Vector",
        desc: "During pointer tracking, particles calculate Euclidean distance to cursor (hypot(dx, dy)). Nodes within proximity (130px) experience outward acceleration: (forceDirection * ((maxDistance - distance) / maxDistance) * dispersionStrength), pushing particles away like magnetic repelling poles.",
      },
      {
        title: "4. Hookean Restorative Spring Physics & Damping",
        desc: "Each particle continuously seeks its home origin position with Hookean elastic return: vx += (originX - x) * returnSpeed, vy += (originY - y) * returnSpeed. Velocity is attenuated per-frame with a 0.86 friction damping factor to prevent perpetual oscillation.",
      },
      {
        title: "5. Brownian Organic Micro-Jitter",
        desc: "When particles settle within 1.2px of their home anchor, a stochastic Brownian perturbation (random velocity between -0.25 and +0.25) injects a subtle organic shimmer, making the typography feel alive even at rest.",
      },
      {
        title: "6. Interactive Shockwave Blast Impulse",
        desc: "Clicking or tapping anywhere injects a radial shockwave burst: particles within 240px receive an instant explosive impulse that blasts outward and gracefully recoils back into crisp legible typography.",
      },
    ],
    techStack: ["React", "HTML5 Canvas 2D", "RequestAnimationFrame", "Hookean Physics", "Image Data Sampling", "ResizeObserver"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography";

export default function HeroSection() {
  return (
    <div style={{ width: "100%", minHeight: "500px", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CursorDrivenParticleTypography
        text="Design"
        fontSize={140}
        particleDensity={4}
        dispersionStrength={18}
        returnSpeed={0.08}
        color="#ffffff"
      />
    </div>
  );
}`,
    componentCode: cursorParticlesTypographyRaw,
    props: [
      { name: "text", type: "string", default: "'Design'", desc: "Text to render as dynamic particles" },
      { name: "fontSize", type: "number", default: "140", desc: "Base font size in pixels (scales responsively)" },
      { name: "particleDensity", type: "number", default: "4", desc: "Sampling grid step size in pixels (smaller = more particles)" },
      { name: "dispersionStrength", type: "number", default: "18", desc: "Repulsion force magnitude when cursor approaches" },
      { name: "returnSpeed", type: "number", default: "0.08", desc: "Elastic spring pull coefficient back to origin" },
      { name: "particleSize", type: "number", default: "1.6", desc: "Radius of individual particle dots in pixels" },
      { name: "color", type: "string", default: "'#ffffff'", desc: "CSS fill color of particle dots" },
      { name: "fontFamily", type: "string", default: "'Inter, sans-serif'", desc: "Font family used for glyph rasterization" },
      { name: "onParticleCountChange", type: "function", default: "null", desc: "Callback fired with total active particle count" },
    ],
  },

  "kinetic-text": {
    title: "Kinetic Text",
    category: "Variable Typography & CSS Hover Wave",
    badge: "KINETIC TYPOGRAPHY",
    author: "Magic UI",
    description: "Pure CSS kinetic character wave typography. Individual letterforms interpolate across variable font weight axes with sibling ripples, dynamic letter padding, and subtle micro-lift physics on cursor hover.",
    howItWorks: [
      {
        title: "1. Variable Font Weight Axis Interpolation",
        desc: "Leverages modern variable font files (wght 100..900) paired with CSS will-change: font-weight, transform, padding. When hovered, characters interpolate smoothly between light (300) and ultra-bold (900) without layout thrashing.",
      },
      {
        title: "2. Bidirectional Sibling Ripple via :has() and Adjacent Selectors",
        desc: "Generates a symmetrical 5-character kinetic wave using modern CSS selectors: :hover targets the center peak (font-weight: 900), .kinetic-text-letter:has(+ :hover) lifts the preceding character (font-weight: 600), and :hover + .kinetic-text-letter lifts the succeeding character (font-weight: 600).",
      },
      {
        title: "3. 2nd-Degree Harmonic Wave Attenuation",
        desc: "Characters two positions away are captured via :has(+ span + span:hover) and :hover + span + span to reach an intermediate harmonic weight (400), creating a natural Gaussian curve wave rather than an abrupt step.",
      },
      {
        title: "4. Dynamic Optical Padding & Stroke Expansion",
        desc: "Hovered and adjacent letters expand padding-inline dynamically via CSS variables (--hover-padding: calc(1em / 14)), allowing letterforms to breathe horizontally as their typographic mass increases.",
      },
      {
        title: "5. Semantic Accessibility & Word-Aware Wrapping",
        desc: "Renders an accessible screen-reader-only text element (.kinetic-text-sr) while marking visual animation spans aria-hidden='true'. Word-aware tokenization groups letters inside non-breaking word blocks to prevent ugly mid-word wrapping.",
      },
      {
        title: "6. Zero JavaScript Animation Overhead",
        desc: "The entire kinetic ripple, font-weight transitions, stroke width, and vertical lift run natively on the browser's compositor thread at zero runtime JS cost, achieving flawless 120 FPS interaction even on mobile devices.",
      },
    ],
    techStack: ["React", "Pure CSS :has()", "Variable Fonts", "Cubic Easing", "Zero-JS Motion"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import { KineticText } from "@/components/ui/kinetic-text";

export default function HeroSection() {
  return (
    <KineticText
      text="NOSTALGIA"
      as="h1"
      baseWeight={300}
      midWeight={600}
      peakWeight={900}
      style={{ fontSize: "5rem", color: "#ffffff" }}
    />
  );
}`,
    componentCode: kineticTextRaw,
    props: [
      { name: "text", type: "string", default: "''", desc: "Text to animate with kinetic character wave" },
      { name: "as", type: "string", default: "'h1'", desc: "HTML heading or text tag ('h1', 'h2', 'p', 'span')" },
      { name: "preserveWords", type: "boolean", default: "true", desc: "Groups characters into words to prevent mid-word line breaks" },
      { name: "baseWeight", type: "number", default: "300", desc: "Resting font weight when not hovered (e.g. 200 to 400)" },
      { name: "midWeight", type: "number", default: "600", desc: "Font weight of adjacent characters in the wave" },
      { name: "peakWeight", type: "number", default: "900", desc: "Peak font weight of the directly hovered character" },
      { name: "hoverPadding", type: "string", default: "'calc(1em / 14)'", desc: "Horizontal expansion padding on hover" },
      { name: "liftDistance", type: "string", default: "'-0.06em'", desc: "Vertical micro-lift displacement on hover" },
    ],
  },

  "interface-crafts": {
    title: "Interface Crafts Cards",
    category: "Framer Motion & Dynamic Stacking",
    badge: "FAN CARDS",
    author: "Interface Crafts / Aceternity UI",
    description: "An interactive overlapping card fan with spring physics, elevation transforms, and layout transitions.",
    howItWorks: [
      {
        title: "1. Arc Geometry Calculation",
        desc: "Cards are spread along an invisible radial arc where each card's X displacement, Y drop, and rotation angle are calculated using (index - centerIndex) * angleStep.",
      },
      {
        title: "2. Layout Spring Physics",
        desc: "Powered by Framer Motion's layout prop with customized stiffness: 260, damping: 20 for fluid expansion when hovered or clicked.",
      },
      {
        title: "3. Dynamic Z-Index Elevation",
        desc: "Hovering any card dynamically calculates relative stacking order so the focused card floats cleanly to the topmost layer without popping.",
      },
      {
        title: "4. Tag & Action Interactivity",
        desc: "Interactive category tags and primary CTA buttons respond to clicks with tactile micro-interactions and depth shadows.",
      },
    ],
    techStack: ["React", "Framer Motion", "Spring Physics", "Vanilla CSS"],
    dependencies: ["motion", "react", "clsx"],
    usageSnippet: `import { InterfaceCraftsCards } from "@/components/ui/interface-crafts-cards";

export default function Showcase() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <InterfaceCraftsCards />
    </div>
  );
}`,
    componentCode: interfaceCraftsRaw,
    props: [
      { name: "items", type: "Array<Card>", default: "Default cards", desc: "Array of cards containing title, subtitle, image, tags, and accent gradient" },
      { name: "className", type: "string", default: "''", desc: "Optional CSS class name override" },
    ],
  },

  "wispr-flow": {
    title: "Wispr Flow Text Animation",
    category: "SVG textPath & Cubic Bézier Curves",
    badge: "TEXT FLOW",
    author: "Aceternity UI Labs",
    description: "Continuous conversational text streaming along dynamic cubic Bézier curves with interactive drag-to-edit path handles.",
    howItWorks: [
      {
        title: "1. SVG Cubic Bézier Path Geometry",
        desc: "Constructs an SVG <path> defined by start/end anchor points and cubic Bézier control handles: M P0 C P1, P2, P3.",
      },
      {
        title: "2. SVG textPath Continuous Undulation",
        desc: "Binds text nodes to <textPath href='#curve'>, continuously cycling startOffset with requestAnimationFrame for infinite smooth flow.",
      },
      {
        title: "3. Interactive PointerCapture Handles",
        desc: "Draggable SVG circle handles allow users to physically bend the curve in real time while text continues to undulate along the new contour.",
      },
      {
        title: "4. Ambient Wave Modulation",
        desc: "When handles are released, subtle sinusoidal oscillations keep the curve alive with natural, organic undulation.",
      },
    ],
    techStack: ["React", "SVG textPath", "Cubic Bézier Curves", "PointerCapture API"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import { WisprFlowTextAnimation } from "@/components/ui/wispr-flow-text-animation";

export default function TextShowcase() {
  return (
    <div className="w-full h-[500px] bg-black">
      <WisprFlowTextAnimation text="WISPR FLOW • CONVERSATIONAL AI • STREAMING TEXT •" />
    </div>
  );
}`,
    componentCode: wisprFlowRaw,
    props: [
      { name: "text", type: "string", default: "'Wispr Flow'", desc: "Repeating text string flowing along the Bézier curve" },
      { name: "speed", type: "number", default: "1.0", desc: "Scroll speed along the curve" },
    ],
  },

  "floating-dock": {
    title: "Floating Dock",
    category: "macOS Spring Magnification",
    badge: "DOCK NAV",
    author: "Aceternity UI",
    description: "macOS-inspired magnetic floating navigation dock with smooth spring magnification physics and mobile collapsible drawer.",
    howItWorks: [
      {
        title: "1. Gaussian Proximity Detection",
        desc: "Tracks mouse X coordinate with useMotionValue. When mouse enters proximity (150px) of any icon, calculates Euclidean distance d.",
      },
      {
        title: "2. Transform Spring Scaling",
        desc: "Maps distance through useTransform to scale icon dimensions from 40px base to 80px apex, passed through useSpring (stiffness: 150, damping: 12) for Apple-grade elasticity.",
      },
      {
        title: "3. Responsive Mobile Drawer",
        desc: "Automatically switches to a floating radial action button on mobile screens that pops open an animated menu with AnimatePresence.",
      },
    ],
    techStack: ["React", "Framer Motion", "Spring Interpolation", "Tabler Icons"],
    dependencies: ["motion", "react", "clsx", "@tabler/icons-react"],
    usageSnippet: `import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconTerminal, IconSettings } from "@tabler/icons-react";

const links = [
  { title: "Home", icon: <IconHome />, href: "#" },
  { title: "Terminal", icon: <IconTerminal />, href: "#" },
  { title: "Settings", icon: <IconSettings />, href: "#" },
];

export default function DockDemo() {
  return <FloatingDock items={links} />;
}`,
    componentCode: floatingDockRaw,
    props: [
      { name: "items", type: "Array<{title, icon, href}>", default: "[]", desc: "Navigation items with icon component, title tooltip, and href" },
      { name: "desktopClassName", type: "string", default: "''", desc: "Optional CSS classes for desktop dock" },
      { name: "mobileClassName", type: "string", default: "''", desc: "Optional CSS classes for mobile dock" },
    ],
  },

  "image-spring": {
    title: "Image Spring 3D",
    category: "Three.js & Parametric Curves",
    badge: "HELIX 3D",
    author: "Lab Architecture",
    description: "Photographic cards continuously traveling along a 3D horizontal parametric helix spring with perspective occlusion.",
    howItWorks: [
      {
        title: "1. 3D Parametric Helix Formula",
        desc: "Positions cards along a horizontal spring: x = t, y = R * cos(ωt), z = R * sin(ωt). Cards continuously advance along t.",
      },
      {
        title: "2. Tangent & Normal Mesh Curvature",
        desc: "Cards are bent along the curvature of the spring and oriented perpendicular to the radius vector for authentic physical presence.",
      },
      {
        title: "3. Infinite Cyclic Loop",
        desc: "As cards exit on the right, their parameter t is wrapped seamlessly back to the left entrance, creating an infinite ribbon of images.",
      },
    ],
    techStack: ["Three.js", "WebGL", "Parametric Geometry", "React"],
    dependencies: ["three", "react"],
    usageSnippet: `import ImageSpring from "@/components/ImageSpring";

export default function Showcase() {
  return (
    <div className="w-full h-screen">
      <ImageSpring />
    </div>
  );
}`,
    componentCode: imageSpringRaw,
    props: [
      { name: "radius", type: "number", default: "4.0", desc: "Radius of the helical spring cylinder" },
      { name: "pitch", type: "number", default: "2.5", desc: "Distance between consecutive helical coils" },
      { name: "speed", type: "number", default: "1.0", desc: "Travel speed of cards along the spring" },
    ],
  },

  "webcam-pixel-grid": {
    title: "Webcam Pixel Grid",
    category: "MediaDevices & Matrix Shaders",
    badge: "INTERACTIVE",
    author: "Lab Architecture",
    description: "Live camera feed converted into an ASCII & pixel shader matrix with edge detection and fluid mouse displacement.",
    howItWorks: [
      {
        title: "1. Real-time Video Sampling",
        desc: "Captures webcam video via navigator.mediaDevices.getUserMedia and samples pixel brightness into a discrete 2D grid.",
      },
      {
        title: "2. Luminance to Glyph Mapping",
        desc: "Maps grayscale luminance (0.299R + 0.587G + 0.114B) into ASCII density characters: @%#*+=-:. .",
      },
      {
        title: "3. Interactive Mouse Distortion",
        desc: "Mouse position applies a radial displacement wave that warps the matrix and intensifies glow effects.",
      },
    ],
    techStack: ["HTML5 Video", "Canvas 2D", "ASCII Shaders", "React"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import WebcamPixelGridDemo from "@/components/WebcamPixelGridDemo";

export default function App() {
  return <WebcamPixelGridDemo />;
}`,
    componentCode: webcamPixelGridRaw,
    props: [
      { name: "cellSize", type: "number", default: "12", desc: "Size of each pixel/ASCII block in pixels" },
      { name: "mode", type: "'ascii' | 'blocks' | 'neon'", default: "'ascii'", desc: "Visual rendering style" },
    ],
  },

  "image-trail": {
    title: "Image Trail",
    category: "Pointer Velocity & Card Stacking",
    badge: "IMAGE TRAIL",
    author: "Lab Architecture",
    description: "Cascading image trail following mouse movement with distance threshold triggers and rotational variations.",
    howItWorks: [
      {
        title: "1. Velocity & Travel Threshold",
        desc: "Monitors cursor coordinates, calculating travel distance delta Math.hypot(dx, dy). When travel exceeds 65px, spawns an image card.",
      },
      {
        title: "2. Procedural Rotation & Jitter",
        desc: "Each spawned card receives random rotational variance (-15° to 15°) and dynamic stacking z-index.",
      },
      {
        title: "3. Automatic Decay Lifecycle",
        desc: "Cards smoothly fade and shrink after their lifespan using CSS transitions or spring animations.",
      },
    ],
    techStack: ["React", "Pointer Events", "CSS 3D Transforms", "DOM Pooling"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import ImageTrail from "@/components/ImageTrail";

export default function Showcase() {
  return (
    <div className="w-full h-screen">
      <ImageTrail />
    </div>
  );
}`,
    componentCode: imageTrailRaw,
    props: [
      { name: "threshold", type: "number", default: "65", desc: "Distance in pixels mouse must move before spawning next image" },
      { name: "maxImages", type: "number", default: "12", desc: "Maximum simultaneous active cards in trail" },
    ],
  },

  "card-globe": {
    title: "Card Globe 3D",
    category: "Three.js & Spherical Geometry",
    badge: "3D SPHERE",
    author: "Lab Architecture",
    description: "Fibonacci spherical distribution placing cards in 3D space around a revolving sphere with inertia drag.",
    howItWorks: [
      {
        title: "1. Fibonacci Sphere Algorithm",
        desc: "Evenly distributes cards over a sphere: y = 1 - (i / (N - 1)) * 2, radius = sqrt(1 - y * y), theta = phi * i.",
      },
      {
        title: "2. Three.js LookAt Alignment",
        desc: "Each card mesh calculates mesh.lookAt(0, 0, 0), orienting faces outward perpendicular to the sphere center.",
      },
      {
        title: "3. Rotational Inertia Damping",
        desc: "Pointer drag gestures accelerate rotational momentum with smooth exponential decay (0.95 factor).",
      },
    ],
    techStack: ["Three.js", "WebGL", "Fibonacci Lattice", "React"],
    dependencies: ["three", "react"],
    usageSnippet: `import CardGlobe from "@/components/CardGlobe";

export default function Showcase() {
  return (
    <div className="w-full h-screen">
      <CardGlobe />
    </div>
  );
}`,
    componentCode: cardGlobeRaw,
    props: [
      { name: "cardCount", type: "number", default: "36", desc: "Total number of cards distributed on the sphere" },
      { name: "radius", type: "number", default: "5.0", desc: "Radius of the spherical shell" },
    ],
  },

  "card-tunnel": {
    title: "Card Tunnel 3D",
    category: "Three.js & Infinite Depth",
    badge: "3D TUNNEL",
    author: "Lab Architecture",
    description: "Concentric card rings positioned along an infinite Z-axis tunnel moving toward the camera with mouse steering.",
    howItWorks: [
      {
        title: "1. Cylindrical Ring Placement",
        desc: "Cards are arranged into radial rings along the Z-axis: x = R * cos(angle), y = R * sin(angle), z = ringIndex * spacing.",
      },
      {
        title: "2. Infinite Conveyor Recycling",
        desc: "As rings advance past camera Z, they are automatically recycled to the far end of the tunnel.",
      },
      {
        title: "3. Mouse Perspective Steering",
        desc: "Camera position offsets subtly with mouse position, creating realistic parallax depth through the tunnel.",
      },
    ],
    techStack: ["Three.js", "WebGL", "Cylindrical Coordinates", "React"],
    dependencies: ["three", "react"],
    usageSnippet: `import CardTunnel from "@/components/CardTunnel";

export default function Showcase() {
  return (
    <div className="w-full h-screen">
      <CardTunnel />
    </div>
  );
}`,
    componentCode: cardTunnelRaw,
    props: [
      { name: "speed", type: "number", default: "1.0", desc: "Velocity of tunnel travel" },
      { name: "ringCount", type: "number", default: "12", desc: "Number of concentric card rings" },
    ],
  },

  "card-toss": {
    title: "Card Toss Physics",
    category: "Framer Motion & Gesture Physics",
    badge: "PHYSICS TOSS",
    author: "Lab Architecture",
    description: "Interactive draggable and throwable cards with momentum throw physics, rotational inertia, and stack recycling.",
    howItWorks: [
      {
        title: "1. Gesture Drag Tracking",
        desc: "Uses Framer Motion drag gestures with velocity extraction upon dragEnd.",
      },
      {
        title: "2. Velocity to Spin & Throw Mapping",
        desc: "Translates velocity.x and velocity.y into projectile glide distance and rotational spin: rotate: velocity.x * 0.05.",
      },
      {
        title: "3. Stack Layer Recycling",
        desc: "Cards tossed beyond the threshold fly off screen and recycle smoothly to the bottom of the card deck.",
      },
    ],
    techStack: ["React", "Framer Motion", "Physics Momentum", "Gesture API"],
    dependencies: ["motion", "react"],
    usageSnippet: `import CardToss from "@/components/CardToss";

export default function Showcase() {
  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <CardToss />
    </div>
  );
}`,
    componentCode: cardTossRaw,
    props: [
      { name: "cards", type: "Array", default: "Default cards", desc: "Array of cards to display in the deck" },
    ],
  },

  "video-collage": {
    title: "Video Moodboard Collage",
    category: "HTML5 Video & Masonry Grid",
    badge: "VIDEO GRID",
    author: "Lab Architecture",
    description: "Synchronized autoplaying muted video grid with hover expansion, audio preview, and interactive scrub controls.",
    howItWorks: [
      {
        title: "1. Synchronized HTML5 Video Streams",
        desc: "Manages multiple concurrent muted video streams with IntersectionObserver to pause offscreen videos.",
      },
      {
        title: "2. Hover Audio & Scrub Preview",
        desc: "Hovering activates audio fade-in and enables cursor-scrubbing across the video playback timeline.",
      },
      {
        title: "3. Masonry Aspect Scaling",
        desc: "Maintains optimal video aspect ratios across variable viewport widths without layout shifts.",
      },
    ],
    techStack: ["HTML5 Video", "IntersectionObserver", "CSS Grid", "React"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import VideoReferenceCollage from "@/components/VideoReferenceCollage";

export default function Showcase() {
  return <VideoReferenceCollage />;
}`,
    componentCode: videoCollageRaw,
    props: [
      { name: "videos", type: "Array", default: "Sample videos", desc: "List of video sources and metadata" },
    ],
  },

  "card-collage": {
    title: "Animated Card Collage",
    category: "CSS 3D Transforms & Parallax",
    badge: "3D COLLAGE",
    author: "Lab Architecture",
    description: "Multi-layer depth card collage with mouse-tracking parallax tilt and floating physics.",
    howItWorks: [
      {
        title: "1. 3D Perspective Hierarchy",
        desc: "Container applies perspective: 1200px and transform-style: preserve-3d, placing cards at distinct translateZ depths.",
      },
      {
        title: "2. Mouse Parallax Coordinate Mapping",
        desc: "Maps mouse position from center (-0.5 to 0.5) to subtle rotateX and rotateY angles.",
      },
      {
        title: "3. Ambient Float Animation",
        desc: "Each card gently undulates with a unique keyframe delay for an organic, breathing collage aesthetic.",
      },
    ],
    techStack: ["React", "CSS 3D Transforms", "Mouse Parallax", "Keyframe Physics"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import AnimatedCardCollage from "@/components/AnimatedCardCollage";

export default function Showcase() {
  return <AnimatedCardCollage />;
}`,
    componentCode: cardCollageRaw,
    props: [
      { name: "items", type: "Array", default: "Default items", desc: "Collage card items" },
    ],
  },

  "threed-card-ring": {
    title: "3D Card Ring",
    category: "Three.js & Radial Carousel",
    badge: "CARD RING",
    author: "Lab Architecture",
    description: "Cylindrical carousel ring with pointer drag inertia, mousewheel cycling, and focused card zoom.",
    howItWorks: [
      {
        title: "1. Radial Circle Geometry",
        desc: "Positions N cards along a circle: x = R * sin(theta), z = R * cos(theta), where theta = (i / N) * 2 * PI.",
      },
      {
        title: "2. Drag Velocity Damping",
        desc: "Calculates angular velocity from drag deltas with smooth friction damping for lifelike spinning inertia.",
      },
      {
        title: "3. Wheel Scroll Cycling",
        desc: "Mousewheel events step the carousel forward or backward with spring-like snap to the nearest card.",
      },
    ],
    techStack: ["Three.js", "WebGL", "Trigonometric Ring", "React"],
    dependencies: ["three", "react"],
    usageSnippet: `import ThreeDCardRing from "@/components/ThreeDCardRing";

export default function Showcase() {
  return (
    <div className="w-full h-screen">
      <ThreeDCardRing />
    </div>
  );
}`,
    componentCode: threedCardRingRaw,
    props: [
      { name: "radius", type: "number", default: "4.5", desc: "Radius of the carousel ring" },
      { name: "cardCount", type: "number", default: "8", desc: "Number of cards in ring" },
    ],
  },

  "grainy-carousel": {
    title: "Grainy Carousel",
    category: "SVG Noise Shaders & Slide Physics",
    badge: "RETRO GRAIN",
    author: "Lab Architecture",
    description: "Analog film aesthetic carousel with procedural high-frequency SVG noise grain and tactile slide indicators.",
    howItWorks: [
      {
        title: "1. Procedural SVG Noise Filter",
        desc: "Applies an SVG feTurbulence filter with type='fractalNoise' and baseFrequency='0.8' to create retro film texture.",
      },
      {
        title: "2. Smooth Slide Transitions",
        desc: "Translates active cards with cubic-bezier(0.16, 1, 0.3, 1) easing for natural analog slide movement.",
      },
      {
        title: "3. Tactile Progress Dots",
        desc: "Interactive dot indicators dynamically expand and glow to highlight the current active card.",
      },
    ],
    techStack: ["React", "SVG feTurbulence", "CSS Slide Physics", "Film Aesthetic"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import GrainyCarousel from "@/components/GrainyCarousel";

export default function Showcase() {
  return <GrainyCarousel />;
}`,
    componentCode: grainyCarouselRaw,
    props: [
      { name: "items", type: "Array", default: "Default items", desc: "Slides containing title, category, and image" },
    ],
  },

  "focus-slice": {
    title: "Focus Slice Carousel",
    category: "Clip-Path & Flexible Accordion",
    badge: "FOCUS SLICE",
    author: "Lab Architecture",
    description: "Horizontal image slices with geometric clip-paths, expanding accordion hover states, and focal tracking.",
    howItWorks: [
      {
        title: "1. Variable Flex Growth",
        desc: "Slices share a flex container where idle slices have flex: 1 and hovered slices expand to flex: 4 smoothly.",
      },
      {
        title: "2. Focal Point Anchoring",
        desc: "Image positions are anchored so expanding slices reveal hidden composition without distortion.",
      },
      {
        title: "3. Vertical Typography Transitions",
        desc: "Text rotates and expands on active slice with fade-in details.",
      },
    ],
    techStack: ["React", "CSS Flexbox", "Clip-Path", "Vanilla CSS"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import FocusSliceCarousel from "@/components/FocusSliceCarousel";

export default function Showcase() {
  return <FocusSliceCarousel />;
}`,
    componentCode: focusSliceRaw,
    props: [
      { name: "items", type: "Array", default: "Default slices", desc: "Slice items with image and title" },
    ],
  },

  "magazine": {
    title: "Magazine 3D Page Flip",
    category: "StPageFlip & Paper Curvature",
    badge: "PAGE FLIP 3D",
    author: "Lab Architecture",
    description: "Realistic 3D magazine page flip physics with paper curling, shadow gradients, and corner drag flipping.",
    howItWorks: [
      {
        title: "1. StPageFlip Engine Integration",
        desc: "Wraps react-pageflip to render realistic double-page magazine spreads with dynamic paper deformation.",
      },
      {
        title: "2. Spine & Page Curvature Shadows",
        desc: "Simulates inner spine crease shadow and page curvature lighting as pages are turned.",
      },
      {
        title: "3. Corner Drag Gestures",
        desc: "Clicking or dragging any page corner peels the page back with authentic resistance physics.",
      },
    ],
    techStack: ["React", "react-pageflip", "3D Canvas / DOM", "CSS Paper Physics"],
    dependencies: ["react-pageflip", "react", "react-dom"],
    usageSnippet: `import Magazine from "@/components/Magazine";

export default function Showcase() {
  return <Magazine />;
}`,
    componentCode: magazineRaw,
    props: [
      { name: "width", type: "number", default: "550", desc: "Page width in pixels" },
      { name: "height", type: "number", default: "733", desc: "Page height in pixels" },
    ],
  },

  "buttons": {
    title: "Modern Buttons Showcase",
    category: "CSS Micro-Interactions & Shimmer",
    badge: "INTERACTIONS",
    author: "Lab Architecture",
    description: "Collection of cutting-edge interactive buttons featuring conic gradient border shimmers, magnetic hover, and ripple effects.",
    howItWorks: [
      {
        title: "1. Conic Gradient Border Shimmers",
        desc: "Uses rotating conic-gradient masks with @keyframes spin to produce perpetual glowing border beams.",
      },
      {
        title: "2. Magnetic Cursor Displacement",
        desc: "Tracks pointer distance from button center and translates the button slightly toward the cursor for a magnetic tactile feel.",
      },
      {
        title: "3. Ripple & Glow Micro-Interactions",
        desc: "Emits radial expanding ripples on click and soft box-shadow blooms on hover.",
      },
    ],
    techStack: ["React", "CSS Conic Gradients", "CSS Keyframes", "Micro-Interactions"],
    dependencies: ["react", "react-dom"],
    usageSnippet: `import ButtonShowcase from "@/components/ButtonShowcase";

export default function Showcase() {
  return <ButtonShowcase />;
}`,
    componentCode: buttonsRaw,
    props: [
      { name: "variant", type: "string", default: "'shimmer'", desc: "Button style variant" },
    ],
  },
};
