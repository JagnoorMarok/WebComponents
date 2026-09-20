import React, { useState } from 'react';
import './App.css';
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

function App() {
  const [activeTab, setActiveTab] = useState('webcam-pixel-grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <h1>Components</h1>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>&times;</button>
        </div>
        <nav className="nav-links">
          <div 
            className={`nav-link ${activeTab === 'webcam-pixel-grid' ? 'active' : ''}`}
            onClick={() => setActiveTab('webcam-pixel-grid')}
          >
            Webcam Pixel Grid
          </div>
          <div 
            className={`nav-link ${activeTab === 'image-trail' ? 'active' : ''}`}
            onClick={() => setActiveTab('image-trail')}
          >
            Image Trail
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-globe' ? 'active' : ''}`}
            onClick={() => setActiveTab('card-globe')}
          >
            Card Globe
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-tunnel' ? 'active' : ''}`}
            onClick={() => setActiveTab('card-tunnel')}
          >
            Card Tunnel
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-toss' ? 'active' : ''}`}
            onClick={() => setActiveTab('card-toss')}
          >
            Card Toss
          </div>
          <div 
            className={`nav-link ${activeTab === 'video-collage' ? 'active' : ''}`}
            onClick={() => setActiveTab('video-collage')}
          >
            Video Moodboard
          </div>
          <div 
            className={`nav-link ${activeTab === 'card-collage' ? 'active' : ''}`}
            onClick={() => setActiveTab('card-collage')}
          >
            Card Collage
          </div>
          <div 
            className={`nav-link ${activeTab === 'threed-card-ring' ? 'active' : ''}`}
            onClick={() => setActiveTab('threed-card-ring')}
          >
            3D Card Ring
          </div>
          <div 
            className={`nav-link ${activeTab === 'grainy-carousel' ? 'active' : ''}`}
            onClick={() => setActiveTab('grainy-carousel')}
          >
            Grainy Carousel
          </div>
          <div 
            className={`nav-link ${activeTab === 'focus-slice' ? 'active' : ''}`}
            onClick={() => setActiveTab('focus-slice')}
          >
            Focus Slice
          </div>
          <div 
            className={`nav-link ${activeTab === 'magazine' ? 'active' : ''}`}
            onClick={() => setActiveTab('magazine')}
          >
            Magazine 3D
          </div>
          <div 
            className={`nav-link ${activeTab === 'buttons' ? 'active' : ''}`}
            onClick={() => setActiveTab('buttons')}
          >
            Buttons
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`main-wrapper ${!isSidebarOpen ? 'expanded' : ''}`}>
        <div className="top-bar" style={{ position: 'absolute', top: 0, left: 0, zIndex: 100, display: 'flex', gap: '1rem' }}>
          {!isSidebarOpen && (
            <button className="toggle-btn" onClick={() => setIsSidebarOpen(true)}>
              &#9776; Menu
            </button>
          )}
        </div>
        
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
