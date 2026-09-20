"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import './webcam-pixel-grid.css';

/**
 * 3D Webcam Pixel Grid component.
 * Samples webcam feed into a discrete grid of 3D voxel cells with
 * brightness & optical motion depth elevation and smooth interpolation.
 */
export const WebcamPixelGrid = ({
  gridCols = 60,
  gridRows = 40,
  maxElevation = 45,
  motionSensitivity = 0.35,
  elevationSmoothing = 0.15,
  denoiseThreshold = 0.040,
  colorMode = 'webcam', // 'webcam' | 'grayscale' | 'monochrome' | 'inverted'
  monochromeColor = '#00ff88',
  backgroundColor = '#030303',
  mirror = true,
  gapRatio = 0.05,
  invertColors = false,
  darken = 0.5,
  borderColor = '#ffffff',
  borderOpacity = 0.06,
  className = '',
  onWebcamReady,
  onWebcamError,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const sampleCanvasRef = useRef(null);
  const sampleCtxRef = useRef(null);

  // WebGL / Three.js refs
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // State buffers for motion & elevation interpolation
  const prevFrameDataRef = useRef(null);
  const currentElevationRef = useRef(null);
  const targetElevationRef = useRef(null);

  // Status & interactive state
  const [webcamStatus, setWebcamStatus] = useState('loading'); // 'loading' | 'active' | 'denied' | 'simulated'
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);

  // Callbacks in refs to avoid infinite re-render loops
  const onWebcamReadyRef = useRef(onWebcamReady);
  const onWebcamErrorRef = useRef(onWebcamError);

  useEffect(() => {
    onWebcamReadyRef.current = onWebcamReady;
    onWebcamErrorRef.current = onWebcamError;
  }, [onWebcamReady, onWebcamError]);

  // Props ref to access inside the 60fps RAF loop without recreating functions
  const propsRef = useRef({
    gridCols,
    gridRows,
    maxElevation,
    motionSensitivity,
    elevationSmoothing,
    denoiseThreshold,
    colorMode,
    monochromeColor,
    backgroundColor,
    mirror,
    gapRatio,
    invertColors,
    darken,
    borderColor,
    borderOpacity,
    isSimulated,
  });

  useEffect(() => {
    propsRef.current = {
      gridCols,
      gridRows,
      maxElevation,
      motionSensitivity,
      elevationSmoothing,
      denoiseThreshold,
      colorMode,
      monochromeColor,
      backgroundColor,
      mirror,
      gapRatio,
      invertColors,
      darken,
      borderColor,
      borderOpacity,
      isSimulated,
    };
  }, [
    gridCols,
    gridRows,
    maxElevation,
    motionSensitivity,
    elevationSmoothing,
    denoiseThreshold,
    colorMode,
    monochromeColor,
    backgroundColor,
    mirror,
    gapRatio,
    invertColors,
    darken,
    borderColor,
    borderOpacity,
    isSimulated,
  ]);

  // Mounted flag to abort in-flight getUserMedia if user clicks away
  const isMountedRef = useRef(true);

  /**
   * Request webcam stream (executed strictly once on mount)
   */
  const startWebcam = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (isMountedRef.current) {
        setWebcamStatus('denied');
        setErrorMessage('Browser does not support camera access.');
      }
      onWebcamErrorRef.current?.(new Error('Webcam not supported'));
      return;
    }

    if (isMountedRef.current) {
      setWebcamStatus('loading');
      setErrorMessage('');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      // CRITICAL: If the user clicked to another component while camera was opening:
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => {
          track.enabled = false;
          track.stop();
        });
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          if (!isMountedRef.current) {
            stream.getTracks().forEach((track) => {
              track.enabled = false;
              track.stop();
            });
            return;
          }
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (isMountedRef.current) {
                  setWebcamStatus('active');
                  setIsSimulated(false);
                  onWebcamReadyRef.current?.();
                }
              })
              .catch((err) => {
                if (err.name !== 'AbortError') {
                  console.warn('Video play interrupted:', err);
                }
              });
          }
        };
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.warn('Webcam permission denied or unavailable:', err);
        setWebcamStatus('denied');
        setErrorMessage(
          err.name === 'NotAllowedError'
            ? 'Camera access permission was denied. You can enable it in browser settings or try the simulation.'
            : 'Camera device is unavailable or not found.'
        );
      }
      onWebcamErrorRef.current?.(err);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    // 1. Immediately disable and stop all media tracks to turn off camera hardware light
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.enabled = false;
          track.stop();
        } catch (e) {
          // ignore error on already stopped track
        }
      });
      streamRef.current = null;
    }

    // 2. Pause video element, clear srcObject, and load() to release OS DirectShow/AVFoundation handle
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const enableSimulation = useCallback(() => {
    stopWebcam();
    setIsSimulated(true);
    setWebcamStatus('simulated');
    onWebcamReadyRef.current?.();
  }, [stopWebcam]);

  // Mount/unmount camera lifecycle - completely turns off camera when switching components
  useEffect(() => {
    isMountedRef.current = true;
    startWebcam();

    const handleUnload = () => {
      stopWebcam();
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      isMountedRef.current = false;
      stopWebcam();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [startWebcam, stopWebcam]);

  /**
   * Three.js 3D Voxel Scene & Render Loop
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // 2. Perspective Camera with balanced elevation tilt
    const fov = 40;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 3000);
    
    // Adaptive camera distance: In portrait mode (width < height), push camera back
    // so the entire 60-column matrix fits within the mobile viewport without clipping
    const computeDistance = (w, h) => {
      if (w < h) {
        return Math.max(580, 580 * (h / w) * 0.58);
      }
      return 580;
    };

    let currentDistance = computeDistance(width, height);
    camera.position.set(0, -32, currentDistance);
    camera.lookAt(0, 6, 0);
    cameraRef.current = camera;

    // Mouse & Touch tracking for subtle 3D interactive tilt
    const mousePos = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mousePos.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mousePos.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
    };

    const onTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          mousePos.targetX = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
          mousePos.targetY = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting for 3D elevation depth & shaded voxel walls
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(250, 350, 450);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
    rimLight.position.set(-250, -200, 250);
    scene.add(rimLight);

    const topDownLight = new THREE.DirectionalLight(0xffeedd, 0.6);
    topDownLight.position.set(0, 400, 200);
    scene.add(topDownLight);

    // 5. Offscreen sampling canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = gridCols;
    sampleCanvas.height = gridRows;
    sampleCanvasRef.current = sampleCanvas;
    const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    sampleCtxRef.current = sampleCtx;

    // 6. Geometry & Instanced Mesh
    const totalCells = gridCols * gridRows;
    currentElevationRef.current = new Float32Array(totalCells);
    targetElevationRef.current = new Float32Array(totalCells);
    prevFrameDataRef.current = new Float32Array(totalCells * 3);
    const rawDeltaBuffer = new Float32Array(totalCells);
    const cleanDeltaBuffer = new Float32Array(totalCells);

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.32,
      metalness: 0.18,
    });

    const instancedMesh = new THREE.InstancedMesh(boxGeometry, boxMaterial, totalCells);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instancedMeshRef.current = instancedMesh;
    scene.add(instancedMesh);

    // 7. Render Loop
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();
    let simTime = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const cfg = propsRef.current;
      const cols = cfg.gridCols;
      const rows = cfg.gridRows;

      const video = videoRef.current;
      const sCtx = sampleCtxRef.current;
      const sCanvas = sampleCanvasRef.current;

      const curElev = currentElevationRef.current;
      const tarElev = targetElevationRef.current;
      const prevData = prevFrameDataRef.current;

      if (!sCtx || !sCanvas || !curElev || !tarElev || !prevData) return;

      // Mouse parallax smoothing
      mousePos.x += (mousePos.targetX - mousePos.x) * 0.05;
      mousePos.y += (mousePos.targetY - mousePos.y) * 0.05;

      camera.position.x = mousePos.x * 35;
      camera.position.y = -32 + mousePos.y * -22;
      camera.lookAt(mousePos.x * 10, 6 + mousePos.y * -6, 0);

      let imgData = null;

      if (
        !cfg.isSimulated &&
        video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        sCtx.drawImage(video, 0, 0, cols, rows);
        imgData = sCtx.getImageData(0, 0, cols, rows).data;
      } else {
        // Simulation mode: moving subject against a calm, dark static background
        simTime += 0.038;
        const waveData = sCtx.createImageData(cols, rows);
        const d = waveData.data;

        // Moving subject coordinates (smooth figure-8 trajectory)
        const subX = Math.sin(simTime * 0.8) * 0.28;
        const subY = Math.sin(simTime * 1.6) * 0.18;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (r * cols + c) * 4;
            const nx = c / cols - 0.5;
            const ny = r / rows - 0.5;

            // Distance to moving subject
            const dist = Math.hypot(nx - subX, ny - subY);
            // Subject presence: 1 at center of subject, 0 outside radius
            const subjectIntensity = Math.max(0, 1 - dist * 3.8);

            if (subjectIntensity > 0) {
              // Moving subject: vibrant, shifting colors
              const hueShift = simTime * 1.2 + nx * 3;
              const rVal = Math.sin(hueShift) * 0.5 + 0.5;
              const gVal = Math.sin(hueShift + 2.094) * 0.5 + 0.5;
              const bVal = Math.sin(hueShift + 4.188) * 0.5 + 0.5;

              d[idx] = Math.floor(subjectIntensity * (rVal * 220 + 35));
              d[idx + 1] = Math.floor(subjectIntensity * (gVal * 220 + 35));
              d[idx + 2] = Math.floor(subjectIntensity * (bVal * 235 + 20));
            } else {
              // Static calm background: low uniform dark blue/gray tones
              d[idx] = 16;
              d[idx + 1] = 18;
              d[idx + 2] = 24;
            }
            d[idx + 3] = 255;
          }
        }
        sCtx.putImageData(waveData, 0, 0);
        imgData = waveData.data;
      }

      // Responsive viewport dimensions in Three.js world units
      const vFOV = (camera.fov * Math.PI) / 180;
      const planeH = 2 * Math.tan(vFOV / 2) * currentDistance;
      const planeW = planeH * camera.aspect;

      const cellW = planeW / cols;
      const cellH = planeH / rows;

      const effectiveGapX = cellW * cfg.gapRatio;
      const effectiveGapY = cellH * cfg.gapRatio;

      const finalW = Math.max(1, cellW - effectiveGapX);
      const finalH = Math.max(1, cellH - effectiveGapY);

      const halfPlaneW = planeW / 2;
      const halfPlaneH = planeH / 2;

      // Parse monochrome color
      const monoHex = (cfg.monochromeColor || '#00ff88').replace('#', '');
      const monoR = (parseInt(monoHex.slice(0, 2), 16) || 0) / 255;
      const monoG = (parseInt(monoHex.slice(2, 4), 16) || 255) / 255;
      const monoB = (parseInt(monoHex.slice(4, 6), 16) || 136) / 255;

      // -------------------------------------------------------------
      // Pass 1: Extract RGB & compute raw color delta per cell
      // -------------------------------------------------------------
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const sampleC = cfg.mirror ? cols - 1 - c : c;
          const sampleIdx = (r * cols + sampleC) * 4;

          let red = imgData ? imgData[sampleIdx] : 16;
          let green = imgData ? imgData[sampleIdx + 1] : 16;
          let blue = imgData ? imgData[sampleIdx + 2] : 20;

          if (cfg.invertColors) {
            red = 255 - red;
            green = 255 - green;
            blue = 255 - blue;
          }

          const darkenMult = 1 - Math.max(0, Math.min(0.95, cfg.darken * 0.75));
          red *= darkenMult;
          green *= darkenMult;
          blue *= darkenMult;

          const pIdx = i * 3;
          const prevR = prevData[pIdx];
          const prevG = prevData[pIdx + 1];
          const prevB = prevData[pIdx + 2];

          const diffR = red - prevR;
          const diffG = green - prevG;
          const diffB = blue - prevB;

          // Euclidean color shift magnitude normalized 0 to 1
          rawDeltaBuffer[i] = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB) / 441.67;

          // Temporal smoothing on previous frame buffer:
          // Smoothly incorporates new values while filtering single-frame sensor grain
          prevData[pIdx] += (red - prevR) * 0.65;
          prevData[pIdx + 1] += (green - prevG) * 0.65;
          prevData[pIdx + 2] += (blue - prevB) * 0.65;
        }
      }

      // -------------------------------------------------------------
      // Pass 2: Spatial Coherence & Soft-Knee Noise Gate
      // (Eliminates high-frequency sensor noise, grain, and video compression noise)
      // -------------------------------------------------------------
      const denoiseCutoff = cfg.denoiseThreshold ?? 0.040;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;

          // Spatial 4-neighborhood cross average
          const left = c > 0 ? rawDeltaBuffer[i - 1] : rawDeltaBuffer[i];
          const right = c < cols - 1 ? rawDeltaBuffer[i + 1] : rawDeltaBuffer[i];
          const up = r > 0 ? rawDeltaBuffer[i - cols] : rawDeltaBuffer[i];
          const down = r < rows - 1 ? rawDeltaBuffer[i + cols] : rawDeltaBuffer[i];
          const neighborAvg = (left + right + up + down) * 0.25;

          // Spatial coherence test: isolated single-pixel noise has near-zero neighborAvg,
          // whereas a moving subject has high neighborAvg.
          const coherentDelta = Math.min(rawDeltaBuffer[i], Math.max(rawDeltaBuffer[i] * 0.35, neighborAvg * 1.35));

          // Soft-knee Hermite curve: cleanly suppresses noise below cutoff
          let cleanDelta = 0;
          if (coherentDelta > denoiseCutoff) {
            const t = Math.min(1.0, (coherentDelta - denoiseCutoff) / 0.05);
            cleanDelta = t * t * (3 - 2 * t) * (coherentDelta - denoiseCutoff);
          }
          cleanDeltaBuffer[i] = cleanDelta;
        }
      }

      // -------------------------------------------------------------
      // Pass 3: High-Intensity Subject Elevation & 3D Voxel Placement
      // -------------------------------------------------------------
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const pIdx = i * 3;
          const red = prevData[pIdx];
          const green = prevData[pIdx + 1];
          const blue = prevData[pIdx + 2];

          const activeDelta = cleanDeltaBuffer[i];

          // Luminance and chromatic vibrancy
          const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
          const maxChannel = Math.max(red, green, blue) / 255;
          const minChannel = Math.min(red, green, blue) / 255;
          const chroma = maxChannel - minChannel;

          // Calm baseline height for static/background cells (subtle, non-distracting)
          const backgroundBaseline = (luminance * 0.6 + chroma * 0.4) * 0.14;

          // High-intensity effect triggered ONLY by clean, coherent subject color motion
          const motionSurge = Math.pow(activeDelta, 0.72) * cfg.motionSensitivity * 20.0;
          const activeSubjectBoost = (luminance * 0.75 + chroma * 0.45) * Math.min(1.0, activeDelta * 6.0);

          const combinedHeightFactor = backgroundBaseline + motionSurge * 0.85 + activeSubjectBoost * 0.65;
          const targetZ = Math.min(1.8, combinedHeightFactor) * cfg.maxElevation;
          tarElev[i] = targetZ;

          // Rate-limited slew for rock-solid stability without breaking
          const currentZ = curElev[i];
          const step = targetZ - currentZ;
          const maxStep = cfg.maxElevation * 0.4;
          const clampedStep = Math.max(-maxStep, Math.min(maxStep, step));

          if (clampedStep > 0) {
            curElev[i] += clampedStep * 0.38;
          } else {
            const decaySpeed = Math.min(0.22, Math.max(0.04, cfg.elevationSmoothing * 0.70));
            curElev[i] += clampedStep * decaySpeed;
          }

          // -------------------------------------------------------------
          // Physical 3D Voxel Placement & Depth Extrusion
          // -------------------------------------------------------------
          const posX = -halfPlaneW + (c + 0.5) * cellW;
          const posY = halfPlaneH - (r + 0.5) * cellH;
          const depthScale = Math.max(0.9, curElev[i]);
          const posZ = depthScale * 0.5; // elevate forward from ground plane

          dummy.position.set(posX, posY, posZ);
          dummy.scale.set(finalW, finalH, depthScale);
          dummy.updateMatrix();

          instancedMesh.setMatrixAt(i, dummy.matrix);

          // -------------------------------------------------------------
          // Pixel Cell Color
          // -------------------------------------------------------------
          if (cfg.colorMode === 'grayscale') {
            tempColor.setRGB(luminance, luminance, luminance);
          } else if (cfg.colorMode === 'monochrome') {
            tempColor.setRGB(luminance * monoR, luminance * monoG, luminance * monoB);
          } else if (cfg.colorMode === 'inverted') {
            tempColor.setRGB(1 - red / 255, 1 - green / 255, 1 - blue / 255);
          } else {
            // 'webcam'
            tempColor.setRGB(
              Math.min(1, (red / 255) * 1.12),
              Math.min(1, (green / 255) * 1.12),
              Math.min(1, (blue / 255) * 1.12)
            );
          }

          instancedMesh.setColorAt(i, tempColor);
        }
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      currentDistance = computeDistance(width, height);
      camera.position.z = currentDistance;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      boxGeometry.dispose();
      boxMaterial.dispose();
    };
  }, [gridCols, gridRows, backgroundColor]);

  return (
    <div className={cn("webcam-pixel-grid-wrapper", className)} ref={containerRef}>
      {/* Hidden offscreen webcam video element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ display: 'none', position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Subtle border overlay pattern (creates physical LED matrix cell borders) */}
      <div
        className="webcam-cell-grid-overlay"
        style={{
          backgroundSize: `${100 / gridCols}% ${100 / gridRows}%`,
          borderColor: borderColor,
          opacity: borderOpacity,
        }}
      />

      {/* Camera status badge */}
      {webcamStatus === 'loading' && (
        <div className="webcam-status-pill">
          <span className="webcam-spinner" />
          <span>Accessing Camera Feed...</span>
        </div>
      )}

      {webcamStatus === 'active' && (
        <div className="webcam-active-badge">
          <span className="webcam-live-dot" />
          <span>LIVE 3D WEBCAM • {gridCols}×{gridRows} MATRIX</span>
        </div>
      )}

      {webcamStatus === 'simulated' && (
        <div className="webcam-active-badge simulated">
          <span className="webcam-sim-dot" />
          <span>SYNTHETIC MOTION DEMO • {gridCols}×{gridRows}</span>
        </div>
      )}

      {/* Fallback modal if permission denied or camera unavailable */}
      {webcamStatus === 'denied' && (
        <div className="webcam-fallback-modal">
          <div className="webcam-fallback-card">
            <div className="webcam-fallback-icon">📷</div>
            <h3 className="webcam-fallback-title">Camera Access Needed</h3>
            <p className="webcam-fallback-desc">
              {errorMessage || 'Camera access is required for the live interactive 3D webcam voxel grid.'}
            </p>
            <div className="webcam-fallback-actions">
              <button className="webcam-fallback-btn primary" onClick={enableSimulation}>
                ▶ Play Interactive Simulation
              </button>
              <button className="webcam-fallback-btn secondary" onClick={startWebcam}>
                ↺ Retry Camera
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamPixelGrid;
