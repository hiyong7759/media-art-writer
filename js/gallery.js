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

  grid.innerHTML = artists.map((artist, index) => {
    const colors = artist.styleHints.colorPalette;
    const delay = index * 50; // Faster stagger

    // Generate complementary dark background from key color
    const keyColor = colors[0];
    const bgColor = generateDarkBg(keyColor);
    const bgHoverColor = generateDarkBg(keyColor, true); // Slightly brighter

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
        role="button"
        tabindex="0"
        aria-label="${artist.name} 작가의 갤러리 열기"
      >
        <div class="artist-card-content">
          <h2 class="artist-name">${artist.name}</h2>
          <span class="artist-theme">${artist.theme}</span>
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
