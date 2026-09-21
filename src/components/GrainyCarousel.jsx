import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import './GrainyCarousel.css';

const curatedImages = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200", 
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200", 
  "https://images.unsplash.com/photo-1629198728070-7871b68dc2df?q=80&w=1200", 
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200", 
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1200", 
  "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1200", 
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=1200", 
  "https://images.unsplash.com/photo-1614729939124-03290b55c9ce?q=80&w=1200"  
];

/**
 * Procedurally generates a noise texture using Canvas for the CSS mask-image.
 * The noise density increases aggressively towards the absolute edge.
 */
const generateEdgeNoise = (width = 200, height = 500, direction = 'left') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let progress = direction === 'left' ? x / width : (width - x) / width;
      // Cube the progress so the clear center pushes further into the edge before dissolving
      const opaqueProb = Math.pow(progress, 3.0); 
      
      const isOpaque = Math.random() < opaqueProb;
      const idx = (y * width + x) * 4;
      data[idx + 0] = 0;   // R
      data[idx + 1] = 0;   // G
      data[idx + 2] = 0;   // B
      data[idx + 3] = isOpaque ? 255 : 0; // Alpha
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
};

const GalleryCard = ({ src, trackX }) => {
  const cardRef = React.useRef(null);
  const [metrics, setMetrics] = useState({ baseX: 0, width: 0, windowWidth: 1000 });

  useEffect(() => {
    const measure = () => {
      if (!cardRef.current) return;
      // offsetLeft is perfectly relative to the track's starting position
      const baseX = cardRef.current.offsetLeft;
      const rect = cardRef.current.getBoundingClientRect();
      setMetrics({ 
        baseX, 
        width: rect.width, 
        windowWidth: window.innerWidth 
      });
    };

    measure();
    window.addEventListener('resize', measure);
    const timer = setTimeout(measure, 150);
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(timer);
    };
  }, []);

  const { baseX, width, windowWidth } = metrics;
  
  // Calculate perspective rotation based on absolute screen position
  const rotateY = useTransform(trackX, (tx) => {
    if (width === 0) return 0; 
    
    const screenX = tx + baseX;
    const cardCenter = screenX + width / 2;
    const zone = Math.min(350, windowWidth * 0.35); 
    
    if (cardCenter < zone) {
      // Exiting into left grain: Left edge (leading) stretches
      const progress = 1 - (cardCenter / zone);
      return Math.max(0, Math.min(progress, 1)) * -40; 
    }
    
    if (cardCenter > windowWidth - zone) {
      // Entering from right grain: Left edge (leading) stretches
      const progress = (cardCenter - (windowWidth - zone)) / zone;
      return Math.max(0, Math.min(progress, 1)) * -40;
    }
    
    return 0;
  });

  return (
    <motion.div 
      ref={cardRef}
      className="gallery-card"
      style={{ 
        rotateY,
        transformOrigin: 'right center',
        transformPerspective: 1000 
      }}
    >
      <img src={src} alt="Cinematic Aesthetic" />
    </motion.div>
  );
};

const GrainyCarousel = () => {
  const items = [...curatedImages, ...curatedImages]; // Duplicate for infinite seamless loop
  const [masks, setMasks] = useState(null);
  
  const x = useMotionValue(0);

  useEffect(() => {
    // Generate masks once on mount
    setMasks({
      left: generateEdgeNoise(200, 500, 'left'),
      right: generateEdgeNoise(200, 500, 'right')
    });
  }, []);

  useEffect(() => {
    let controls;
    // Tiny timeout ensures the DOM layout is complete and scrollWidth is accurate
    const timer = setTimeout(() => {
      const track = document.getElementById('infinite-track');
      if (!track) return;
      
      // Since we duplicated the array, exactly half the scrollWidth is one full set
      const totalWidth = track.scrollWidth / 2;
      
      // Animate continuously from 0 to -totalWidth
      controls = animate(x, [0, -totalWidth], {
        ease: 'linear',
        duration: 40, // Cinematic slow pace
        repeat: Infinity
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (controls) controls.stop();
    };
  }, [x]);

  return (
    <div className="infinite-gallery-section">
      <div 
        className="infinite-gallery-viewport"
        style={masks ? {
          maskImage: `url(${masks.left}), url(${masks.right}), linear-gradient(to right, transparent var(--edge-width), black var(--edge-width), black calc(100% - var(--edge-width)), transparent calc(100% - var(--edge-width)))`,
          WebkitMaskImage: `url(${masks.left}), url(${masks.right}), linear-gradient(to right, transparent var(--edge-width), black var(--edge-width), black calc(100% - var(--edge-width)), transparent calc(100% - var(--edge-width)))`,
          maskRepeat: 'repeat-y, repeat-y, no-repeat',
          WebkitMaskRepeat: 'repeat-y, repeat-y, no-repeat',
          maskSize: 'var(--edge-width) auto, var(--edge-width) auto, 100% 100%',
          WebkitMaskSize: 'var(--edge-width) auto, var(--edge-width) auto, 100% 100%'
        } : {}}
      >
        <motion.div 
          id="infinite-track"
          className="infinite-gallery-track" 
          style={{ x }}
        >
          {items.map((src, i) => (
            <GalleryCard key={i} src={src} trackX={x} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default GrainyCarousel;
