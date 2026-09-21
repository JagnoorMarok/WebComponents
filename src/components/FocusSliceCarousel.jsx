import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './FocusSliceCarousel.css';

const carouselData = [
  {
    id: 1,
    title: "The Silent Forest",
    description: "Nature's tranquil beauty captured in early morning mist.",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 2,
    title: "Urban Geometry",
    description: "The sharp angles and cold steel of modern cityscapes.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "Ocean Whisper",
    description: "A calming tide reflecting the colors of twilight.",
    image: "https://images.unsplash.com/photo-1498623116890-37e912163d5d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    title: "Desert Mirage",
    description: "Endless sand dunes shifting under the harsh sun.",
    image: "https://images.unsplash.com/photo-1682687982501-1e58f81014a6?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    title: "Starfall",
    description: "A breathtaking view of the cosmos away from city lights.",
    image: "https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&w=1200&q=80"
  }
];

const FocusSliceCarousel = () => {
  const [activeId, setActiveId] = useState(carouselData[0].id);

  return (
    <div className="focus-slice-container">
      <div className="focus-slice-wrapper">
        {carouselData.map((item) => {
          const isActive = activeId === item.id;
          return (
            <motion.div
              key={item.id}
              className={`slice-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveId(item.id)}
              layout
              initial={false}
              animate={{
                flex: isActive ? 10 : 1,
                borderRadius: isActive ? "32px" : "999px"
              }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 15,
                mass: 1
              }}
              style={{ overflow: 'hidden' }}
            >
              <div 
                className="slice-bg" 
                style={{ backgroundImage: `url(${item.image})` }}
              >
                <div className={`slice-overlay ${isActive ? 'active' : ''}`}></div>
              </div>
              
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div 
                    className="slice-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {!isActive && (
                  <motion.div 
                    className="slice-title-vertical"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span>{item.title}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FocusSliceCarousel;
