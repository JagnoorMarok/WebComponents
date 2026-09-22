import React, { useState, useMemo } from 'react';
import './LandingPage.css';

const COMPONENTS_DATA = [
  {
    id: 'eclipse',
    title: 'Eclipse',
    category: 'Backgrounds & WebGL Shaders',
    badge: 'WEBGL CORONA',
    accent: 'linear-gradient(135deg, #00f5ff 0%, #a855f7 40%, #ff007a 70%, #030712 100%)',
    icon: '🌘',
    desc: 'A turbulent spectral corona burning around a dark eclipse. Multi-octave fBm solar plasma prominences, chromatic aberration dispersion, and intense diamond rim limb brightening.',
    tech: ['WebGL', 'GLSL Fragment Shader', 'fBm Plasma', 'Spectral Dispersion', 'React Bits Pro'],
    difficulty: 'Mastery',
  },
  {
    id: 'glitch-text',
    title: 'Glitch Text',
    category: 'Interactive & Typography',
    badge: 'CANVAS GLITCH',
    accent: 'linear-gradient(135deg, #ff003c 0%, #ff6600 40%, #050508 100%)',
    icon: '⚡',
    desc: 'Canvas-based interactive text with per-character cursor-reactive RGB-split ghost layers, sticky glitch persistence, sweeping scanline bars and frame-jitter shake.',
    tech: ['Canvas 2D', 'RGB Channel Split', 'Sticky Hold Timer', 'CRT Scanlines', 'React Bits Pro'],
    difficulty: 'Advanced',
  },
  {
    id: 'ascii-ripple',
    title: 'ASCII Ripple',
    category: 'Interactive & Physics',
    badge: 'LIQUID ASCII',
    accent: 'linear-gradient(135deg, #ad57ff 0%, #3b82f6 50%, #050508 100%)',
    icon: '〰️',
    desc: 'Monospace liquid surface physics. Pointer drops and drags propagate simulated 2D finite-difference wave fronts bending words and blooming into heavy ASCII density glyphs.',
    tech: ['Canvas 2D', 'Wave Equation PDE', 'Optical Refraction', 'ASCII Shaders', 'React Bits Pro'],
    difficulty: 'Mastery',
  },
  {
    id: 'text-loop',
    title: 'Text Loop',
    category: '3D & Typography',
    badge: 'TEXT ANIMATION',
    accent: 'linear-gradient(135deg, #5227ff 0%, #a855f7 50%, #030712 100%)',
    icon: '➰',
    desc: 'Infinite, seamless typography looping along dynamic parametric SVG paths (wave, circle, infinity, arch, line) with dual-textPath offset wrapping and GSAP ticker.',
    tech: ['React', 'SVG textPath', 'Parametric Béziers', 'GSAP Linear Ticker', 'React Bits'],
    difficulty: 'Advanced',
  },
  {
    id: 'kinetic-text',
    title: 'Kinetic Text',
    category: '3D & Typography',
    badge: 'VARIABLE TYPOGRAPHY',
    accent: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 50%, #030712 100%)',
    icon: '⚡',
    desc: 'Pure CSS kinetic character wave typography. Letterforms interpolate across variable font weight axes with sibling ripples and micro-lift physics on hover.',
    tech: ['Pure CSS :has()', 'Variable Fonts', 'Typographic Wave', 'Magic UI'],
    difficulty: 'Advanced',
  },
  {
    id: 'cursor-particles-typography',
    title: 'Cursor Particles Typography',
    category: 'Interactive & Physics',
    badge: 'KINETIC TYPOGRAPHY',
    accent: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #030712 100%)',
    icon: '✨',
    desc: 'Dynamic typography synthesized from thousands of kinetic micro-particles that disperse on cursor proximity and recoil with spring elasticity and click shockwave physics.',
    tech: ['Canvas 2D', 'Pixel Sampling', 'Hookean Springs', 'Shockwave Blast'],
    difficulty: 'Advanced',
  },
  {
    id: 'ink-reveal',
    title: 'Ink Reveal',
    category: 'Interactive & Physics',
    badge: 'CANVAS COMPOSITING',
    accent: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #030712 100%)',
    icon: '🖋️',
    desc: 'Dynamic canvas overlay using destination-out compositing and harmonic sinusoidal wobble to fluidly brush away an opaque mask and reveal underlying media.',
    tech: ['Canvas 2D', 'GlobalCompositeOperation', 'Sinusoidal Harmonics', 'Cubic Easing'],
    difficulty: 'Intermediate',
  },
  {
    id: 'image-stack',
    title: 'Image Stack',
    category: 'Interactive & Physics',
    badge: 'DRAGGABLE STACK',
    accent: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #09090b 100%)',
    icon: '🎴',
    desc: 'Interactive fanned-out card stack with natural elastic dragging, displacement threshold cycling, and fluid spring reordering.',
    tech: ['React', 'Motion', 'Spring Physics', 'Gesture Drag'],
    difficulty: 'Intermediate',
  },
  {
    id: 'water-ripple-image',
    title: 'Water Ripple Image',
    category: 'Interactive & Physics',
    badge: 'FLUID SIMULATION',
    accent: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 50%, #082f49 100%)',
    icon: '🌊',
    desc: 'Real-time animated water ripples, procedural wave harmonics, and caustic light refraction synthesized with WebGL shaders.',
    tech: ['React', 'WebGL 1.0', 'GLSL Shaders', 'Simplex Noise', 'Fluid Harmonics'],
    difficulty: 'Mastery',
  },
  {
    id: 'morph-gallery',
    title: 'Morph Gallery',
    category: '3D & Typography',
    badge: 'WEBGL SHADER',
    accent: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #0f172a 100%)',
    icon: '🌌',
    desc: 'Hardware-accelerated WebGL gallery whose slides dissolve through dynamic Simplex Noise and fractal shreds with opposing parallax drift and luminance burn-through.',
    tech: ['React', 'WebGL 1.0', 'GLSL Simplex Noise', 'FBM', 'Kedhareswer Naidu'],
    difficulty: 'Mastery',
  },
  {
    id: 'stack-tower',
    title: 'Stack Tower',
    category: '3D & Typography',
    badge: '3D CYLINDER',
    accent: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #000000 100%)',
    icon: '🏛️',
    desc: 'Vertically rotating 3D typographic cylinder with simulated diffuse lighting, infinite horizon masks, and interactive row hover magnification.',
    tech: ['React', 'Motion', 'Cylindrical Projections', 'Trigonometric Math'],
    difficulty: 'Advanced',
  },
  {
    id: 'constellation-field',
    title: 'Constellation Field',
    category: 'Interactive & Physics',
    badge: 'CANVAS PARTICLES',
    accent: 'linear-gradient(135deg, #eab308 0%, #d97706 50%, #4f46e5 100%)',
    icon: '✨',
    desc: 'Drifting pointer-reactive starlight particles connected by fading constellation lines with real-time physics and Lumira analytics hero.',
    tech: ['Canvas 2D', 'Kinetic Drift', 'Pointer Gravity', '21st.dev / Meng To'],
    difficulty: 'Intermediate',
  },
  {
    id: 'interface-crafts',
    title: 'Interface Crafts Cards',
    category: 'Interactive & Physics',
    badge: 'FAN CARDS',
    accent: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    icon: '🃏',
    desc: 'Interactive overlapping card fan with layout spring transitions, z-depth elevation, and focus expansion as seen on interfacecraft.dev.',
    tech: ['Framer Motion', 'Spring Physics', 'Dynamic Stacking'],
    difficulty: 'Intermediate',
  },
  {
    id: 'wispr-flow',
    title: 'Wispr Flow Animation',
    category: 'Interactive & Physics',
    badge: 'TEXT FLOW',
    accent: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    icon: '〰️',
    desc: 'Continuous conversational text stream undulating through dynamic cubic Bézier curves with interactive drag-to-edit path handles.',
    tech: ['SVG textPath', 'Cubic Bézier', 'Motion / PointerCapture'],
    difficulty: 'Advanced',
  },
  {
    id: 'floating-dock',
    title: 'Floating Dock',
    category: 'UI & Controls',
    badge: 'DOCK NAV',
    accent: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    icon: '⚓',
    desc: 'macOS-inspired magnetic floating navigation dock with smooth spring magnification physics and mobile collapsible drawer.',
    tech: ['Framer Motion', 'Spring Physics', 'Tabler Icons'],
    difficulty: 'Intermediate',
  },
  {
    id: 'image-spring',
    title: 'Image Spring 3D',
    category: '3D & Spatial',
    badge: 'HELIX 3D',
    accent: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    icon: '〰️',
    desc: 'Photographic cards continuously traveling along a 3D horizontal parametric helix spring with perspective occlusion.',
    tech: ['Three.js', 'Parametric Helix', 'Infinite Loop'],
    difficulty: 'Advanced',
  },
  {
    id: 'webcam-pixel-grid',
    title: 'Webcam Pixel Grid',
    category: 'Interactive & Physics',
    badge: 'INTERACTIVE',
    accent: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    icon: '📹',
    desc: 'Real-time camera feed converted into an ASCII & pixel shader matrix with edge detection and fluid mouse displacement.',
    tech: ['HTML5 Video', 'Canvas API', 'Matrix Shaders'],
    difficulty: 'Advanced',
  },
  {
    id: 'image-trail',
    title: 'Image Trail',
    category: 'Interactive & Physics',
    badge: 'POPULAR',
    accent: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    icon: '✨',
    desc: 'Fluid cursor-following image stream that cascades dynamically across the screen with organic velocity decay and physics.',
    tech: ['Pointer Events', 'GSAP / Motion', 'Fluid Decay'],
    difficulty: 'Intermediate',
  },
  {
    id: 'card-globe',
    title: 'Card Globe 3D',
    category: '3D & Spatial',
    badge: '3D SPATIAL',
    accent: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    icon: '🌐',
    desc: 'Orbital spherical arrangement of 3D cards with interactive momentum drag, auto-rotation, and smooth perspective depth.',
    tech: ['CSS 3D Transforms', 'Spherical Math', 'Drag Physics'],
    difficulty: 'Advanced',
  },
  {
    id: 'card-tunnel',
    title: 'Card Tunnel',
    category: '3D & Spatial',
    badge: 'IMMERSIVE',
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    icon: '🌀',
    desc: 'Infinite depth tunnel effect driving stacked perspective cards along a hypnotic Z-axis journey with mouse parallax.',
    tech: ['Perspective 3D', 'Scroll/Wheel Driven', 'Z-Depth'],
    difficulty: 'Advanced',
  },
  {
    id: 'card-toss',
    title: 'Card Toss',
    category: 'Interactive & Physics',
    badge: 'TACTILE',
    accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    icon: '🃏',
    desc: 'Physics-based card stack with throw & fling gestures, inertial flick detection, snap points, and tactile rotation.',
    tech: ['Touch Gestures', 'Inertia Physics', 'Framer Motion'],
    difficulty: 'Intermediate',
  },
  {
    id: 'video-collage',
    title: 'Video Moodboard',
    category: 'Media & Visual',
    badge: 'MULTIMEDIA',
    accent: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)',
    icon: '🎞️',
    desc: 'Dynamic media collage featuring looping ambient videos, responsive masonry distribution, and hover soundscapes.',
    tech: ['HTML5 Video', 'Masonry CSS', 'Media Grid'],
    difficulty: 'Intermediate',
  },
  {
    id: 'card-collage',
    title: 'Animated Card Collage',
    category: 'Media & Visual',
    badge: 'EDITORIAL',
    accent: 'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
    icon: '🖼️',
    desc: 'Art-directed editorial layout with staggered floating card entrances, hover magnetic pull, and smooth transitions.',
    tech: ['CSS Grid', 'Staggered Motion', 'Hover Depth'],
    difficulty: 'Intermediate',
  },
  {
    id: 'threed-card-ring',
    title: '3D Card Ring',
    category: '3D & Spatial',
    badge: '3D CYLINDER',
    accent: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    icon: '🎡',
    desc: 'Cylindrical 3D carousel ring allowing continuous 360-degree rotation, card inspection, and perspective projection.',
    tech: ['CSS 3D Transforms', 'Angular Geometry', 'Touch Orbit'],
    difficulty: 'Advanced',
  },
  {
    id: 'grainy-carousel',
    title: 'Grainy Carousel',
    category: 'Media & Visual',
    badge: 'AESTHETIC',
    accent: 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
    icon: '📼',
    desc: 'Cinematic slider imbued with analog film grain textures, typography reveals, and smooth slide pagination.',
    tech: ['SVG Noise Shader', 'CSS Filters', 'Motion Slider'],
    difficulty: 'Beginner',
  },
  {
    id: 'focus-slice',
    title: 'Focus Slice Carousel',
    category: 'Media & Visual',
    badge: 'EDITORIAL',
    accent: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
    icon: '📐',
    desc: 'Horizontal accordion slice gallery that smoothly expands focused panels while subtly compressing inactive slices.',
    tech: ['Flexbox Expansion', 'CSS Transitions', 'Sound FX'],
    difficulty: 'Intermediate',
  },
  {
    id: 'magazine',
    title: 'Magazine 3D Flip',
    category: '3D & Spatial',
    badge: 'TACTILE 3D',
    accent: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
    icon: '📖',
    desc: 'Realistic double-sided publication page flipper with authentic paper curl physics, shadows, and click/drag turning.',
    tech: ['React PageFlip', '3D Shadow Mesh', 'Editorial Print'],
    difficulty: 'Advanced',
  },
  {
    id: 'buttons',
    title: 'Modern Buttons',
    category: 'UI & Controls',
    badge: 'MICRO-UX',
    accent: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    icon: '🔘',
    desc: 'Collection of accessible, minimalist button styles with glowing borders, liquid ripples, and tactile press states.',
    tech: ['Vanilla CSS', 'Micro-interactions', 'a11y Ready'],
    difficulty: 'Beginner',
  },
];

const CATEGORIES = ['All', '3D & Spatial', 'Interactive & Physics', 'Media & Visual', 'UI & Controls'];

export default function LandingPage({ onSelectComponent }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComponents = useMemo(() => {
    return COMPONENTS_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.tech.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleRandomExperiment = () => {
    const randomIndex = Math.floor(Math.random() * COMPONENTS_DATA.length);
    const chosen = COMPONENTS_DATA[randomIndex];
    if (onSelectComponent) {
      onSelectComponent(chosen.id);
    }
  };

  const scrollToGrid = () => {
    const el = document.getElementById('components-archive');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Ambient background glow effects */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div className="ambient-glow ambient-glow-3" />
      <div className="grid-overlay" />

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-pill">
          <span className="pulsing-dot" />
          <span className="pill-text">LABORATORY EXPERIMENTS // 13 LIVE COMPONENTS</span>
        </div>

        <h1 className="hero-title">
          Spatial interfaces, <br />
          <span className="hero-gradient-text">motion physics</span> & canvas shaders.
        </h1>

        <p className="hero-subtitle">
          An art-directed gallery of experimental React UI components. Crafted for creative developers, 
          product designers, and explorers who want to break away from predictable web interfaces.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={scrollToGrid}>
            <span>Explore Collection</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>

          <button className="btn-secondary" onClick={handleRandomExperiment}>
            <span>Random Experiment</span>
            <span className="dice-icon">🎲</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">13</span>
            <span className="stat-label">Bespoke Components</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">60<span className="stat-unit">FPS</span></span>
            <span className="stat-label">Hardware Accelerated</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">3D</span>
            <span className="stat-label">Spatial & Physics</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-card">
            <span className="stat-number">0%</span>
            <span className="stat-label">Generic Templates</span>
          </div>
        </div>
      </header>

      {/* Main Showcase Section */}
      <section id="components-archive" className="showcase-section">
        <div className="showcase-controls">
          <div className="category-filters">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' 
                ? COMPONENTS_DATA.length 
                : COMPONENTS_DATA.filter(c => c.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                  <span className="chip-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Filter by name, tech or interaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')} aria-label="Clear Search">
                &times;
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="results-info">
          <span>Showing {filteredComponents.length} {filteredComponents.length === 1 ? 'experiment' : 'experiments'}</span>
          {selectedCategory !== 'All' && (
            <span className="active-filter-indicator">in <strong>{selectedCategory}</strong></span>
          )}
        </div>

        {/* Components Bento Grid */}
        <div className="components-bento">
          {filteredComponents.map((item) => (
            <div
              key={item.id}
              className="component-card"
              onClick={() => onSelectComponent(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectComponent(item.id);
                }
              }}
            >
              <div className="card-ambient-accent" style={{ background: item.accent }} />
              
              <div className="card-top">
                <div className="card-icon-badge" style={{ borderImage: `${item.accent} 1` }}>
                  <span>{item.icon}</span>
                </div>
                <div className="card-tags">
                  <span className="card-badge">{item.badge}</span>
                </div>
              </div>

              <div className="card-body">
                <h3 className="card-title">{item.title}</h3>
                <span className="card-category">{item.category}</span>
                <p className="card-desc">{item.desc}</p>
              </div>

              <div className="card-footer">
                <div className="tech-pills">
                  {item.tech.map((t) => (
                    <span key={t} className="tech-pill">{t}</span>
                  ))}
                </div>

                <div className="card-action">
                  <span>Launch</span>
                  <svg className="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No experiments match "{searchQuery}"</h3>
            <p>Try clearing your search or selecting a different category.</p>
            <button className="btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Tech & Philosophy Strip */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>KINETIC // UI EXPERIMENTS</h4>
            <p>Crafted with React 19, Three.js, GSAP, and hardware-accelerated CSS 3D.</p>
          </div>
          <div className="footer-actions">
            <button className="footer-cta-btn" onClick={handleRandomExperiment}>
              Launch Random Demo →
            </button>
            <button className="footer-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              ↑ Back to top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
