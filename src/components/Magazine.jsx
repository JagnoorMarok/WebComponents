import React, { useState } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { pagesData } from '../data/magazineContent';
import './Magazine.css';

const Page = React.forwardRef(({ data, isBack }, ref) => {
  if (!data) return null;
  const { type, title, metadata, quote, body, image, subtitle, bg } = data;
  
  const bgStyle = image ? { background: `url('${image}') center / cover no-repeat` } : { backgroundColor: bg || '#0a0a0a' };

  return (
    <div className="demoPage" ref={ref}>
      <div className={`page-content page-${type}`} style={bgStyle}>
        {type === 'cover' && (
          <>
            <h2>{title}</h2>
            <div className="meta">{metadata}</div>
          </>
        )}
        {type === 'quote' && (
          <h3>"{quote}"</h3>
        )}
        {type === 'text-heavy' && (
          <>
            <h2>{title}</h2>
            <p>{body}</p>
          </>
        )}
        {type === 'final' && (
          <>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <div className="barcode"></div>
          </>
        )}
      </div>
    </div>
  );
});

const Magazine = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    // Normalize coordinates from -1 to 1
    const x = (clientX / innerWidth) * 2 - 1;
    const y = (clientY / innerHeight) * 2 - 1;
    
    setRotation({
      x: -y * 5, // tilting up/down (5 degrees max)
      y: x * 10,  // tilting left/right (10 degrees max)
    });
  };

  return (
    <section className="magazine-section" onMouseMove={handleMouseMove}>
      <div 
        className="magazine-parallax-wrapper"
        style={{
          transform: `perspective(2000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <HTMLFlipBook 
          width={400} 
          height={560} 
          size="stretch" 
          minWidth={300} 
          maxWidth={500} 
          minHeight={400} 
          maxHeight={700} 
          maxShadowOpacity={0.5} 
          showCover={true} 
          mobileScrollSupport={true}
          className="demo-book"
        >
          {pagesData.map((page, i) => (
             <Page data={page} key={i} />
          ))}
        </HTMLFlipBook>
      </div>
    </section>
  );
};

export default Magazine;
