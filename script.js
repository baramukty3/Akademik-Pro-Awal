/* ═══════════════════════════════════════════
   AKADEMIKPRO — script.js
═══════════════════════════════════════════ */

/* ── Scroll progress bar ── */
const scrollBar = document.getElementById('scroll-bar');
if (scrollBar) {
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
}

/* ── Navbar: scrolled state ── */
const header = document.getElementById('header');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Hamburger menu ── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('nav-menu');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navLinks.classList.toggle('open', open);
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!header.contains(e.target)) {
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
    }
  });
}

/* ── Scroll reveal ── */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings slightly
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(idx * 80, 320));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
} else {
  // Fallback: show all
  revealEls.forEach(el => el.classList.add('visible'));
}

/* ── FAQ accordion ── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const id      = btn.getAttribute('aria-controls');
    const answer  = document.getElementById(id);
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    // Close all others
    document.querySelectorAll('.faq-question').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        const otherId = document.getElementById(other.getAttribute('aria-controls'));
        if (otherId) otherId.hidden = true;
      }
    });

    btn.setAttribute('aria-expanded', String(!expanded));
    if (answer) answer.hidden = expanded;
  });
});

/* ── Contact form → WhatsApp redirect ── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = (form.querySelector('[name="name"]')?.value || '').trim();
    const phone   = (form.querySelector('[name="phone"]')?.value || '').trim();
    const service = (form.querySelector('[name="service"]')?.value || '').trim();
    const message = (form.querySelector('[name="message"]')?.value || '').trim();

    // Basic validation
    if (!name || !phone || !service || !message) {
      showToast('⚠️ Mohon lengkapi semua kolom yang wajib diisi.');
      return;
    }
    if (!/^0[0-9]{8,13}$/.test(phone.replace(/\s/g, ''))) {
      showToast('⚠️ Nomor WhatsApp tidak valid. Mulai dengan 08...');
      return;
    }

    const text = [
      `Halo AkademikPro 👋`,
      ``,
      `Nama    : ${name}`,
      `WA      : ${phone}`,
      `Layanan : ${service}`,
      ``,
      `Kebutuhan:`,
      message,
    ].join('\n');

    const waNumber = '6282280704934'; // ← GANTI dengan nomor WA aktif
    const waURL    = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

    showToast('✅ Mengarahkan ke WhatsApp…');
    setTimeout(() => window.open(waURL, '_blank', 'noopener,noreferrer'), 800);
  });
}

/* ── Toast helper ── */
function showToast(msg, duration = 3500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

if (sections.length && navAnchors.length) {
  const activateLink = () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.style.color = '';
      a.style.opacity = '';
      if (a.getAttribute('href') === `#${current}`) {
        a.style.color = 'var(--gold-light)';
        a.style.opacity = '1';
      }
    });
  };
  window.addEventListener('scroll', activateLink, { passive: true });
  activateLink();
}

/* ── Smooth scroll polyfill for older browsers ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.warn('SW failed:', err));
  });
}
