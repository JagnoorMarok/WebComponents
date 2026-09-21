import React, { useRef, useEffect } from "react";
import "./cursor-driven-particles-typography.css";

class Particle {
  constructor(x, y, size, color, dispersion, returnSpd) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.size = size;
    this.color = color;
    this.dispersion = dispersion;
    this.returnSpd = returnSpd;
  }

  update(mouseX, mouseY, burstX = null, burstY = null, burstPower = 0) {
    // Handle cursor repulsion
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 130;

    if (distance < maxDistance && mouseX !== -1000 && mouseY !== -1000) {
      const forceDirectionX = dx / (distance || 1);
      const forceDirectionY = dy / (distance || 1);
      const force = (maxDistance - distance) / maxDistance;
      const directionX = forceDirectionX * force * this.dispersion;
      const directionY = forceDirectionY * force * this.dispersion;
      this.vx -= directionX;
      this.vy -= directionY;
    }

    // Handle instant click burst / shockwave if active
    if (burstX !== null && burstY !== null && burstPower > 0) {
      const bdx = burstX - this.x;
      const bdy = burstY - this.y;
      const bDist = Math.sqrt(bdx * bdx + bdy * bdy);
      const burstRadius = 240;
      if (bDist < burstRadius && bDist > 0) {
        const bFactor = (burstRadius - bDist) / burstRadius;
        const bForceX = (bdx / bDist) * bFactor * burstPower;
        const bForceY = (bdy / bDist) * bFactor * burstPower;
        this.vx -= bForceX;
        this.vy -= bForceY;
      }
    }

    // Spring return towards origin
    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;

    // Friction / damping
    this.vx *= 0.86;
    this.vy *= 0.86;

    // Subtle Brownian jitter when close to home
    const distHome = Math.hypot(this.x - this.originX, this.y - this.originY);
    if (distHome < 1.2 && Math.random() > 0.94) {
      this.vx += (Math.random() - 0.5) * 0.25;
      this.vy += (Math.random() - 0.5) * 0.25;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function CursorDrivenParticleTypography({
  text = "Design",
  fontSize = 140,
  fontFamily = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight = 800,
  particleSize = 1.6,
  particleDensity = 5,
  dispersionStrength = 18,
  returnSpeed = 0.08,
  color = "#ffffff",
  className = "",
  onParticleCountChange = null,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const burstRef = useRef({ x: null, y: null, power: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animId;
    let particles = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let containerW = 0;
    let containerH = 0;

    const init = () => {
      if (!container) return;
      containerW = container.clientWidth;
      containerH = container.clientHeight;
      if (containerW === 0 || containerH === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(containerW * dpr);
      canvas.height = Math.floor(containerH * dpr);
      canvas.style.width = `${containerW}px`;
      canvas.style.height = `${containerH}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Draw baseline typography into the canvas to sample pixel geometry
      ctx.clearRect(0, 0, containerW, containerH);

      // Auto-fit font size if too wide for container
      const computedColor = color || "#ffffff";
      const targetFontSize = Math.min(
        fontSize,
        Math.floor((containerW * 0.85) / (text.length * 0.58 || 1)),
        containerH * 0.45
      );
      const activeFontSize = Math.max(32, targetFontSize);

      ctx.fillStyle = computedColor;
      ctx.font = `${fontWeight} ${activeFontSize}px ${fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, containerW / 2, containerH / 2);

      // Read back pixel data
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      particles = [];

      const step = Math.max(1, Math.floor(particleDensity * dpr));

      for (let y = 0; y < imgData.height; y += step) {
        for (let x = 0; x < imgData.width; x += step) {
          const index = (y * imgData.width + x) * 4;
          const alpha = imgData.data[index + 3] || 0;

          // If pixel has significant alpha, generate particle
          if (alpha > 120) {
            particles.push(
              new Particle(
                x / dpr,
                y / dpr,
                particleSize,
                computedColor,
                dispersionStrength,
                returnSpeed
              )
            );
          }
        }
      }

      if (onParticleCountChange) {
        onParticleCountChange(particles.length);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, containerW, containerH);

      // Fade out burst effect
      if (burstRef.current.power > 0) {
        burstRef.current.power *= 0.88;
        if (burstRef.current.power < 0.2) {
          burstRef.current.power = 0;
          burstRef.current.x = null;
          burstRef.current.y = null;
        }
      }

      const b = burstRef.current;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouseX, mouseY, b.x, b.y, b.power);
        particles[i].draw(ctx);
      }

      animId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.touches[0].clientX - rect.left;
        mouseY = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchEnd = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      burstRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        power: 45,
      };
    };

    const resizeObserver = new ResizeObserver(() => {
      init();
    });
    resizeObserver.observe(container);

    const initTimeout = setTimeout(() => {
      init();
      animate();
    }, 50);

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("click", handleClick);

    return () => {
      clearTimeout(initTimeout);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
    };
  }, [
    text,
    fontSize,
    fontFamily,
    fontWeight,
    particleSize,
    particleDensity,
    dispersionStrength,
    returnSpeed,
    color,
  ]);

  return (
    <div
      ref={containerRef}
      className={`particle-typography-container ${className}`.trim()}
    >
      <canvas ref={canvasRef} className="particle-typography-canvas" />
    </div>
  );
}

export default CursorDrivenParticleTypography;
