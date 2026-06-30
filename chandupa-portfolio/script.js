/* ═══════════════════════════════════════════════════════
   CHANDUPA VAS GUNAWARDENA — Portfolio · script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── UTILITY ──────────────────────────────────────────────────────────────────

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const isMobile = () => window.innerWidth <= 640;

// ── 1. PARTICLE CANVAS ───────────────────────────────────────────────────────

(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const COLORS = [
    'rgba(157,78,221,',
    'rgba(199,125,255,',
    'rgba(224,64,251,',
    'rgba(255,255,255,'
  ];

  class Particle {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = Math.random() * 1.8 + 0.3;
      this.speed = Math.random() * 0.35 + 0.1;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.04 + 0.01;
    }

    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.twinkle += this.twinkleSpeed;
      if (this.y < -5) this.reset();
    }

    draw() {
      const a = this.alpha * (0.7 + 0.3 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    }
  }

  // Data constellation lines
  const MAX_DIST = 100;

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(157,78,221,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: Math.min(count, 80) }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(animId); resize(); loop(); });
  resize();
  loop();
})();

// ── 2. CUSTOM CURSOR ─────────────────────────────────────────────────────────

(function initCursor() {
  if (isMobile()) return;

  const glow = document.getElementById('cursorGlow');
  const dot  = document.getElementById('cursorDot');
  if (!glow || !dot) return;

  let mx = 0, my = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Smooth glow follow
  (function followGlow() {
    gx += (mx - gx) * 0.06;
    gy += (my - gy) * 0.06;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    requestAnimationFrame(followGlow);
  })();

  // Scale dot on interactive elements
  const interactive = 'a, button, .btn, .tool-chip, .social-btn, .nav-link';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactive)) {
      dot.style.transform = 'translate(-50%,-50%) scale(2.2)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactive)) {
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
    }
  });
})();

// ── 3. NAVBAR ─────────────────────────────────────────────────────────────────

(function initNav() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  const navAnchors = $$('.nav-link');

  // Scrolled style
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveLink();
    showBackToTop();
  }, { passive: true });

  // Mobile toggle
  toggle?.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close on link click
  navAnchors.forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle?.classList.remove('active');
    });
  });

  // Active section highlight
  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    $$('section[id]').forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const match = $(`a[href="#${sec.id}"]`);
        match?.classList.add('active');
      }
    });
  }
})();

// ── 4. BACK TO TOP ───────────────────────────────────────────────────────────

function showBackToTop() {
  const btn = document.getElementById('backToTop');
  btn?.classList.toggle('visible', window.scrollY > 400);
}

document.getElementById('backToTop')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── 5. TYPEWRITER ────────────────────────────────────────────────────────────

(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Future Data Scientist',
    'ICT Undergraduate',
    'Business Analytics Student',
    'Public Speaker',
    'Algorithm Enthusiast',
    'Lifelong Learner'
  ];

  let pi = 0, ci = 0, deleting = false, wait = 0;

  function tick() {
    const current = phrases[pi];

    if (!deleting) {
      el.textContent = current.slice(0, ++ci);
      if (ci === current.length) { deleting = true; wait = 55; }
    } else {
      wait--;
      if (wait <= 0) {
        el.textContent = current.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          wait = 0;
        }
      }
    }

    const delay = deleting && wait <= 0 ? 60 : deleting ? 20 : 80;
    setTimeout(tick, delay);
  }

  setTimeout(tick, 1200);
})();

// ── 6. SCROLL ANIMATIONS (AOS-LITE) ─────────────────────────────────────────

(function initAOS() {
  const targets = $$('[data-aos]');
  if (!targets.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('aos-animate');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(t => obs.observe(t));
})();

// ── 7. SKILL BAR ANIMATION ───────────────────────────────────────────────────

(function initSkillBars() {
  const fills = $$('.skill-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const pct = e.target.dataset.pct;
        e.target.style.width = pct + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  fills.forEach(f => obs.observe(f));
})();

// ── 8. COUNTER ANIMATION ─────────────────────────────────────────────────────

(function initCounters() {
  const counters = $$('.stat-num');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const target = +e.target.dataset.target;
      let current = 0;
      const step = target / 40;

      const run = () => {
        current = Math.min(current + step, target);
        e.target.textContent = Math.floor(current);
        if (current < target) requestAnimationFrame(run);
      };

      requestAnimationFrame(run);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.7 });

  counters.forEach(c => obs.observe(c));
})();

// ── 9. CONTACT FORM ──────────────────────────────────────────────────────────

(function initContactForm() {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      note.style.color = '#f87171';
      note.textContent = 'Please fill in all fields.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.style.color = '#f87171';
      note.textContent = 'Please enter a valid email address.';
      return;
    }

    // Compose mailto link
    const mailto = `mailto:chandupavas@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Chandupa,\n\nMy name is ${name}.\n\n${message}\n\nBest regards,\n${name}\n${email}`)}`;
    window.location.href = mailto;

    note.style.color = '#4ade80';
    note.textContent = '✓ Opening your mail client...';
    form.reset();
    setTimeout(() => { note.textContent = ''; }, 4000);
  });
})();

// ── 10. MAGNETIC BUTTON EFFECT ───────────────────────────────────────────────

(function initMagneticBtns() {
  if (isMobile()) return;

  $$('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) translateY(-3px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// ── 11. GLITCH EFFECT ON HERO NAME HOVER ─────────────────────────────────────

(function initGlitch() {
  const nameLines = $$('.name-line');
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  nameLines.forEach(el => {
    const original = el.textContent;
    let timeout;

    el.addEventListener('mouseenter', () => {
      let iter = 0;
      clearInterval(timeout);
      timeout = setInterval(() => {
        el.textContent = original.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iter) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (iter >= original.length) {
          clearInterval(timeout);
          el.textContent = original;
        }
        iter += 1 / 3;
      }, 40);
    });
  });
})();

// ── 12. SMOOTH SECTION REVEAL WITH STAGGERED CHILDREN ────────────────────────

(function initSectionReveal() {
  const sections = $$('.section');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.05 });

  sections.forEach(s => {
    s.style.opacity = '0';
    s.style.transition = 'opacity 0.6s ease';
    obs.observe(s);
  });
})();

// ── 13. CARD TILT EFFECT ─────────────────────────────────────────────────────

(function initTilt() {
  if (isMobile()) return;

  $$('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── 14. NAVBAR TOGGLE HAMBURGER ──────────────────────────────────────────────

(function initHamburger() {
  const toggle = document.getElementById('navToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const spans = $$('span', toggle);
    if (toggle.classList.contains('active')) {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    } else {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    }
  });
})();

// ── 15. PAGE LOAD ENTRANCE ───────────────────────────────────────────────────

window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// ── 16. SCROLL PROGRESS INDICATOR ────────────────────────────────────────────

(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, #7B2FBE, #9D4EDD, #C77DFF);
    z-index: 9999;
    width: 0%;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(157,78,221,0.6);
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
})();