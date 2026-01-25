// Load artists and render cards
async function loadArtists() {
  try {
    const response = await fetch('data/artists.json');
    const data = await response.json();
    renderArtists(data.artists);
  } catch (error) {
    console.error('Failed to load artists:', error);
    document.getElementById('artistsGrid').innerHTML = `
      <p style="color: var(--color-text-secondary); text-align: center; grid-column: 1/-1;">
        작가 정보를 불러오는 중 오류가 발생했습니다.
      </p>
    `;
  }
}

// Generate a dark complementary background from key color
function generateDarkBg(hexColor, isHover = false) {
  // Parse hex color
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Create a very dark version with a hint of the key color
  const mult = isHover ? 0.18 : 0.12;
  const base = isHover ? 25 : 15;
  const darkR = Math.floor(r * mult + base);
  const darkG = Math.floor(g * mult + base);
  const darkB = Math.floor(b * mult + base + 5);

  return `rgba(${darkR}, ${darkG}, ${darkB}, 0.95)`;
}

function renderArtists(artists) {
  const grid = document.getElementById('artistsGrid');

  // Engine type mapping for mini preview
  const engineMap = {
    'aura-7': 'organic',
    'kuro-x': 'geometric',
    'neon-v': 'cyberpunk',
    'flora-9': 'bloom',   // New: Digital Nature
    'echo-0': 'wave',
    'void-3': 'cosmic',
    'terra-1': 'contour',
    'aqua-5': 'flow',
    'prism-2': 'refraction'
  };

  grid.innerHTML = artists.map((artist, index) => {
    const colors = artist.styleHints.colorPalette;
    const delay = index * 50;
    const keyColor = colors[0];
    const bgColor = generateDarkBg(keyColor);
    const bgHoverColor = generateDarkBg(keyColor, true);
    const engineType = engineMap[artist.id] || 'organic';

    return `
      <article 
        class="artist-card fade-in" 
        style="
          --card-color-1: ${colors[0]};
          --card-color-2: ${colors[1]};
          --card-bg: ${bgColor};
          --card-bg-hover: ${bgHoverColor};
          animation-delay: ${delay}ms;
        "
        onclick="openViewer('${artist.id}')"
        data-artist-id="${artist.id}"
        data-engine="${engineType}"
        role="button"
        tabindex="0"
        aria-label="${artist.name} 작가의 갤러리 열기"
      >
        <canvas class="card-preview-canvas" data-engine="${engineType}" data-colors='${JSON.stringify(colors)}'></canvas>
        <span class="artist-theme-badge">${artist.theme}</span>
        <div class="artist-card-content">
          <h2 class="artist-name">${artist.name}</h2>
          <p class="artist-description">${artist.description}</p>
          <div class="artist-colors">
            ${colors.map(color => `
              <span class="color-dot" style="background: ${color};" title="${color}"></span>
            `).join('')}
          </div>
        </div>
        <div class="artist-enter" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </article>
    `;
  }).join('');

  // Add keyboard support
  grid.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Initialize mini canvas previews
  initCardPreviews();
}

// Mini Canvas Preview System (Lightweight)
function initCardPreviews() {
  const canvases = document.querySelectorAll('.card-preview-canvas');
  const engines = [];

  canvases.forEach(canvas => {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    const colors = JSON.parse(canvas.dataset.colors);
    const engineType = canvas.dataset.engine;

    // Create lightweight mini engine
    const engine = new MiniPreviewEngine(canvas, ctx, colors, engineType);
    engines.push(engine);
  });

  // Single animation loop for all cards
  let frame = 0;
  function animateAll() {
    frame++;
    engines.forEach(e => {
      e.frame = frame;
      e.draw();
    });
    requestAnimationFrame(animateAll);
  }
  animateAll();
}

// Lightweight Mini Preview Engine - Artist-specific styles
class MiniPreviewEngine {
  constructor(canvas, ctx, colors, type) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.colors = colors;
    this.type = type;
    this.width = canvas.width;
    this.height = canvas.height;
    this.frame = 0;
    // Only render in bottom 50% area
    this.renderTop = this.height * 0.5;
    this.renderHeight = this.height * 0.5;
    this.init();
  }

  init() {
    switch (this.type) {
      case 'geometric':
        this.shapes = this.initShapes();
        break;
      case 'cyberpunk':
        this.drops = this.initDrops();
        break;
      case 'wave':
        this.waves = this.initWaves();
        break;
      case 'cosmic':
        this.stars = this.initStars();
        break;
      case 'flow':
        this.bubbles = this.initBubbles();
        break;
      case 'contour':
        this.contours = this.initContours();
        break;
      case 'refraction':
        this.beams = this.initBeams();
        break;
      case 'bloom':
        this.petals = this.initPetals();
        break;
      default: // organic
        this.particles = this.initParticles();
    }
  }

  initParticles() {
    return Array.from({ length: 6 }, () => ({
      x: Math.random() * this.width,
      y: this.renderTop + Math.random() * this.renderHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 4 + 2, // Increased size
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: Math.random() * 0.4 + 0.2
    }));
  }

  initShapes() {
    return Array.from({ length: 4 }, () => ({
      x: Math.random() * this.width,
      y: this.renderTop + Math.random() * this.renderHeight,
      size: Math.random() * 20 + 10,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      sides: Math.floor(Math.random() * 3) + 3,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }));
  }

  initDrops() {
    const cols = Math.floor(this.width / 15);
    return Array(cols).fill(0).map(() => this.renderTop + Math.random() * this.renderHeight);
  }

  initWaves() {
    return Array.from({ length: 12 }, (_, i) => ({
      y: this.renderTop + (this.renderHeight / 12) * i,
      amplitude: Math.random() * 8 + 4,
      frequency: Math.random() * 0.03 + 0.02,
      speed: Math.random() * 0.03 + 0.01,
      offset: Math.random() * Math.PI * 2,
      color: this.colors[i % this.colors.length]
    }));
  }

  initStars() {
    return Array.from({ length: 20 }, () => ({
      x: Math.random() * this.width - this.width / 2,
      y: Math.random() * this.renderHeight - this.renderHeight / 2,
      z: Math.random() * 200 + 50,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }));
  }

  initBubbles() {
    return Array.from({ length: 15 }, () => ({
      x: Math.random() * this.width,
      y: this.renderTop + Math.random() * this.renderHeight,
      radius: Math.random() * 4 + 2,
      speed: Math.random() * 0.5 + 0.2,
      wobble: Math.random() * Math.PI * 2,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }));
  }

  initContours() {
    return Array.from({ length: 5 }, (_, i) => ({
      y: this.renderTop + (this.renderHeight / 5) * i,
      points: Array.from({ length: 10 }, () => Math.random() * 10 - 5),
      speed: Math.random() * 0.02 + 0.01,
      color: this.colors[i % this.colors.length]
    }));
  }

  initBeams() {
    return Array.from({ length: 20 }, () => ({
      x: Math.random() * this.width,
      angle: Math.random() * Math.PI - Math.PI / 2, // Match generative.js (Wide angle)
      width: Math.random() * 5 + 2, // Scaled down for mini preview (vs 10-30)
      length: Math.random() * this.renderHeight * 0.6 + this.renderHeight * 0.4, // Match generative.js (Relative length)
      speed: Math.random() * 0.01 + 0.005,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }));
  }

  initPetals() {
    return Array.from({ length: 8 }, () => ({
      x: Math.random() * this.width,
      y: this.renderTop + Math.random() * this.renderHeight,
      size: Math.random() * 10 + 5, // Increased size
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
      sway: Math.random() * 0.05,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    }));
  }

  hexToRgba(hex, alpha) {
    let r = 0, g = 0, b = 0;
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  draw() {
    // 1. Clear TOP area completely (keep it clean)
    this.ctx.clearRect(0, 0, this.width, this.renderTop);

    // 2. Handle BOTTOM area (Animation Zone)
    // Set clipping to bottom area
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(0, this.renderTop, this.width, this.renderHeight);
    this.ctx.clip();

    // Background handling based on type
    if (['cyberpunk', 'cosmic', 'geometric', 'bloom', 'refraction'].includes(this.type)) {
      // Trails effect: Draw semi-transparent background
      if (this.type === 'refraction') {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Match generative.js exactly for refraction
      } else {
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      }
      this.ctx.fillRect(0, this.renderTop, this.width, this.renderHeight);
    } else {
      // Clean background: Clear and fill opaque
      this.ctx.clearRect(0, this.renderTop, this.width, this.renderHeight);
      this.ctx.fillStyle = 'rgba(10, 10, 15, 0.85)';
      this.ctx.fillRect(0, this.renderTop, this.width, this.renderHeight);
    }

    switch (this.type) {
      case 'geometric':
        this.drawGeometric();
        break;
      case 'cyberpunk':
        this.drawCyberpunk();
        break;
      case 'wave':
        this.drawWave();
        break;
      case 'cosmic':
        this.drawCosmic();
        break;
      case 'flow':
        this.drawFlow();
        break;
      case 'contour':
        this.drawContour();
        break;
      case 'refraction':
        this.drawRefraction();
        break;
      case 'bloom':
        this.drawBloom();
        break;
      default:
        this.drawOrganic();
    }

    this.ctx.restore();
  }

  drawOrganic() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < this.renderTop) p.y = this.renderTop + this.renderHeight;
      if (p.y > this.renderTop + this.renderHeight) p.y = this.renderTop;

      const pulse = Math.sin(this.frame * 0.02 + p.x) * 0.15;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(p.color, Math.min(1, p.alpha + pulse + 0.3));
      this.ctx.fill();
    });

    // Connections - draw from each particle
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 100;
        if (dist < maxDist) {
          // Much brighter lines for visibility
          const lineAlpha = Math.min(1, (1 - dist / maxDist) * 1.5);
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = this.hexToRgba(p.color, lineAlpha);
          this.ctx.lineWidth = 2; // Thicker lines
          this.ctx.stroke();
        }
      }
    }
  }

  drawGeometric() {
    this.shapes.forEach(s => {
      s.rotation += s.rotSpeed;
      // Gentle float movement
      s.x += Math.sin(this.frame * 0.01 + s.size) * 0.3;
      if (s.x < 0) s.x = this.width;
      if (s.x > this.width) s.x = 0;

      this.ctx.save();
      this.ctx.translate(s.x, s.y);
      this.ctx.rotate(s.rotation);
      this.ctx.strokeStyle = this.hexToRgba(s.color, 0.85);
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (let i = 0; i < s.sides; i++) {
        const angle = (i / s.sides) * Math.PI * 2;
        const x = Math.cos(angle) * s.size;
        const y = Math.sin(angle) * s.size;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  drawCyberpunk() {
    const koreanChars = '가나다라마바사아자차카타파하디지털코드데이터미래네온시티전력신호접속흐름';
    this.ctx.font = '13px monospace';
    // Ensure density is correct for "rain" effect
    for (let i = 0; i < this.drops.length; i++) {
      const char = koreanChars[Math.floor(Math.random() * koreanChars.length)];

      // Match viewer logic: mostly main color, rarely white/secondary
      if (Math.random() > 0.95) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = this.hexToRgba(this.colors[0], 0.9);
      }

      // Draw character
      this.ctx.fillText(char, i * 15, this.drops[i]);

      // Always move drops
      this.drops[i] += 5; // Adjust speed as needed

      // Reset if out of bounds (random reset to make it look natural)
      if (this.drops[i] > this.renderTop + this.renderHeight && Math.random() > 0.975) {
        this.drops[i] = this.renderTop;
      }
    }
  }

  drawWave() {
    this.waves.forEach(w => {
      this.ctx.beginPath();
      // Brighter lines for wave
      this.ctx.strokeStyle = this.hexToRgba(w.color, 0.6);
      this.ctx.lineWidth = 1.5;
      for (let x = 0; x < this.width; x += 8) {
        const y = w.y + Math.sin(x * w.frequency + this.frame * w.speed + w.offset) * w.amplitude;
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    });
  }

  drawCosmic() {
    const cx = this.width / 2;
    const cy = this.renderTop + this.renderHeight / 2;

    this.stars.forEach(s => {
      s.z -= 1; // Move towards viewer
      if (s.z <= 0) {
        s.z = 200;
        s.x = Math.random() * this.width - this.width / 2;
        s.y = Math.random() * this.renderHeight - this.renderHeight / 2;
      }

      const scale = 100 / s.z;
      const x = cx + s.x * scale;
      const y = cy + s.y * scale;
      const r = Math.max(1.0, scale * 2.5);
      const alpha = 0.8 * (1 - s.z / 200);

      this.ctx.beginPath();
      this.ctx.arc(x, y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(s.color, alpha);
      this.ctx.fill();
    });
  }

  drawFlow() {
    this.bubbles.forEach(b => {
      b.y -= b.speed;
      b.x += Math.sin(this.frame * 0.05 + b.wobble) * 0.5;

      if (b.y < this.renderTop) b.y = this.renderTop + this.renderHeight;

      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(b.color, 0.6);
      this.ctx.strokeStyle = this.hexToRgba(b.color, 0.8);
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  drawContour() {
    this.contours.forEach((c, i) => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.hexToRgba(c.color, 0.7);
      this.ctx.lineWidth = 1.5;

      for (let x = 0; x <= this.width; x += 20) {
        const idx = Math.floor(x / (this.width / 10));
        const offset = c.points[idx] || 0;
        const nextOffset = c.points[idx + 1] || 0;
        const t = (x % (this.width / 10)) / (this.width / 10);
        const smoothOffset = offset * (1 - t) + nextOffset * t;

        const y = c.y + smoothOffset * 5 + Math.sin(this.frame * c.speed + i) * 5;
        if (x === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    });
  }

  drawRefraction() {
    this.beams.forEach(b => {
      b.angle += Math.sin(this.frame * 0.01) * 0.002;

      this.ctx.save();
      this.ctx.translate(b.x, this.renderTop + this.renderHeight);
      this.ctx.rotate(b.angle);

      const grad = this.ctx.createLinearGradient(0, 0, 0, -b.length);
      grad.addColorStop(0, this.hexToRgba(b.color, 0));
      grad.addColorStop(0.5, this.hexToRgba(b.color, 0.8)); // Brighter
      grad.addColorStop(1, this.hexToRgba(b.color, 0));

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(-b.width / 2, -b.length, b.width, b.length);

      this.ctx.restore();
    });
  }

  drawBloom() {
    this.petals.forEach(p => {
      p.angle += p.speed;
      p.x += Math.sin(this.frame * p.sway) * 0.2;
      p.y += Math.cos(this.frame * p.sway) * 0.2;

      // Wrap around
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < this.renderTop) p.y = this.renderTop + this.renderHeight;
      if (p.y > this.renderTop + this.renderHeight) p.y = this.renderTop;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);

      this.ctx.beginPath();
      // Draw petal shape using bezier curves
      this.ctx.moveTo(0, 0);
      // Left curve
      this.ctx.quadraticCurveTo(-p.size, -p.size, 0, -p.size * 3);
      // Right curve
      this.ctx.quadraticCurveTo(p.size, -p.size, 0, 0);

      this.ctx.fillStyle = this.hexToRgba(p.color, 0.9); // Brighter
      this.ctx.fill();

      this.ctx.restore();
    });
  }
}

function openViewer(artistId) {
  window.location.href = `viewer.html?artist=${artistId}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', loadArtists);

// Background Particle Animation
(function () {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6', '#06b6d4'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function initParticles() {
    particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.4 + 0.1
    }));
  }
  initParticles();

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function animate() {
    // Dark gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 1.5
    );
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
    gradient.addColorStop(0.5, 'rgba(10, 10, 15, 1)');
    gradient.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, p.alpha);
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const alpha = (1 - dist / 100) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = hexToRgba(colors[0], alpha);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
