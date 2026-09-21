import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/LandingPage';
import ImageSpring from './components/ImageSpring';
import ButtonShowcase from './components/ButtonShowcase';
import Magazine from './components/Magazine';
import FocusSliceCarousel from './components/FocusSliceCarousel';
import GrainyCarousel from './components/GrainyCarousel';
import ThreeDCardRing from './components/ThreeDCardRing';
import AnimatedCardCollage from './components/AnimatedCardCollage';
import VideoReferenceCollage from './components/VideoReferenceCollage';
import CardToss from './components/CardToss';
import CardTunnel from './components/CardTunnel';
import CardGlobe from './components/CardGlobe';
import ImageTrail from './components/ImageTrail';
import WebcamPixelGridDemo from './components/WebcamPixelGridDemo';

const COMPONENT_TITLES = {
  'home': 'Overview',
  'image-spring': 'Image Spring 3D',
  'webcam-pixel-grid': 'Webcam Pixel Grid',
  'image-trail': 'Image Trail',
  'card-globe': 'Card Globe 3D',
  'card-tunnel': 'Card Tunnel',
  'card-toss': 'Card Toss',
  'video-collage': 'Video Moodboard',
  'card-collage': 'Animated Card Collage',
  'threed-card-ring': '3D Card Ring',
  'grainy-carousel': 'Grainy Carousel',
  'focus-slice': 'Focus Slice',
  'magazine': 'Magazine 3D Flip',
  'buttons': 'Modern Buttons',
};

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth > 768 : true;
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close Sidebar"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo" onClick={() => handleTabClick('home')} style={{ cursor: 'pointer' }}>
            <h1>Components</h1>
            <span className="brand-badge">LAB</span>
          </div>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)} aria-label="Close Navigation">&times;</button>
        </div>
        <nav className="nav-links">
          <div 
            className={`nav-link nav-link-overview ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabClick('home')}
          >
            <span className="nav-icon">✦</span> Overview / Home
          </div>
          <div className="nav-divider" />
          <div 
            className={`nav-link ${activeTab === 'image-spring' ? 'active' : ''}`}
            onClick={() => handleTabClick('image-spring')}
          >
            Image Spring 3D
          </div>
          <div 
            className={`nav-link ${activeTab === 'webcam-pixel-grid' ? 'active' : ''}`}
            onClick={() => handleTabClick('webcam-pixel-grid')}
          >
            Webcam Pixel Grid
          </div>
          <div 
            className={`nav-link ${activeTab === 'image-trail' ? 'active' : ''}`}
            onClick={() => handleTabClick('image-trail')}
          >
            Image Trail
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-globe' ? 'active' : ''}`}
            onClick={() => handleTabClick('card-globe')}
          >
            Card Globe
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-tunnel' ? 'active' : ''}`}
            onClick={() => handleTabClick('card-tunnel')}
          >
            Card Tunnel
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-toss' ? 'active' : ''}`}
            onClick={() => handleTabClick('card-toss')}
          >
            Card Toss
          </div>
          <div 
            className={`nav-link ${activeTab === 'video-collage' ? 'active' : ''}`}
            onClick={() => handleTabClick('video-collage')}
          >
            Video Moodboard
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-collage' ? 'active' : ''}`}
            onClick={() => handleTabClick('card-collage')}
          >
            Card Collage
          </div>
          <div 
            className={`nav-link ${activeTab === 'threed-card-ring' ? 'active' : ''}`}
            onClick={() => handleTabClick('threed-card-ring')}
          >
            3D Card Ring
          </div>
          <div 
            className={`nav-link ${activeTab === 'grainy-carousel' ? 'active' : ''}`}
            onClick={() => handleTabClick('grainy-carousel')}
          >
            Grainy Carousel
          </div>
          <div 
            className={`nav-link ${activeTab === 'focus-slice' ? 'active' : ''}`}
            onClick={() => handleTabClick('focus-slice')}
          >
            Focus Slice
          </div>
          <div 
            className={`nav-link ${activeTab === 'magazine' ? 'active' : ''}`}
            onClick={() => handleTabClick('magazine')}
          >
            Magazine 3D
          </div>
          <div 
            className={`nav-link ${activeTab === 'buttons' ? 'active' : ''}`}
            onClick={() => handleTabClick('buttons')}
          >
            Buttons
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`main-wrapper ${!isSidebarOpen ? 'expanded' : ''}`}>
        <div className="top-bar">
          {!isSidebarOpen && (
            <button className="toggle-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open Navigation">
              &#9776; <span>Menu</span>
            </button>
          )}

          {activeTab !== 'home' ? (
            <div className="top-bar-nav">
              <button 
                className="back-showcase-btn" 
                onClick={() => handleTabClick('home')}
                title="Return to Component Showcase"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>Back to Showcase</span>
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{COMPONENT_TITLES[activeTab] || 'Experiment'}</span>
            </div>
          ) : (
            <div className="top-bar-home-brand">
              <span className="home-status-tag">✦ LIVE ARCHIVE</span>
            </div>
          )}
        </div>

        {activeTab === 'home' && (
          <LandingPage onSelectComponent={(tab) => handleTabClick(tab)} />
        )}

        {activeTab === 'image-spring' && (
          <div className="image-spring-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <ImageSpring />
          </div>
        )}

        {activeTab === 'webcam-pixel-grid' && (
          <div className="webcam-pixel-grid-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <WebcamPixelGridDemo />
          </div>
        )}

        {activeTab === 'image-trail' && (
          <div className="image-trail-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <ImageTrail />
          </div>
        )}

        {activeTab === 'card-globe' && (
          <div className="card-globe-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <CardGlobe />
          </div>
        )}

        {activeTab === 'card-tunnel' && (
          <div className="card-tunnel-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <CardTunnel />
          </div>
        )}

        {activeTab === 'card-toss' && (
          <div className="card-toss-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <CardToss />
          </div>
        )}

        {activeTab === 'video-collage' && (
          <div className="video-collage-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <VideoReferenceCollage />
          </div>
        )}

        {activeTab === 'card-collage' && (
          <div className="card-collage-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <AnimatedCardCollage />
          </div>
        )}

        {activeTab === 'threed-card-ring' && (
          <div className="threed-card-ring-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <ThreeDCardRing />
          </div>
        )}

        {activeTab === 'grainy-carousel' && (
          <div className="grainy-carousel-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <GrainyCarousel />
          </div>
        )}

        {activeTab === 'focus-slice' && (
          <div className="focus-slice-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <FocusSliceCarousel />
          </div>
        )}

        {activeTab === 'magazine' && (
          <div className="magazine-main" style={{ width: '100%', height: '100vh', display: 'flex' }}>
             <Magazine />
          </div>
        )}

        {activeTab === 'buttons' && (
          <main className="main-content" style={{ paddingTop: '5rem' }}>
            <header className="showcase-header">
              <h2>Buttons</h2>
              <p>Minimal, accessible button components.</p>
            </header>
            <section className="showcase-area">
              <ButtonShowcase />
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
