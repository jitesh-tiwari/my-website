/* ===============================
  Robust main script: component loader, theme, mobile nav, smooth scroll
  FULL FILE — USE AS assets/js/main.js
  =============================== */

(() => {
  const select = (sel) => document.querySelector(sel);
  const selectAll = (sel) => Array.from(document.querySelectorAll(sel));

  function componentsBasePath() {
    const path = window.location.pathname;
    if (path.startsWith('/blog/') || path.split('/').filter(Boolean).length > 1) {
      return '../components/';
    }
    return 'components/';
  }

  async function loadComponent(targetId, filename, fallbackHtml = '') {
    const target = document.getElementById(targetId);
    if (!target) return;
    const base = componentsBasePath();
    const url = base + filename;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const html = await res.text();
      target.innerHTML = html;
      return true;
    } catch {
      target.innerHTML = fallbackHtml;
      return false;
    }
  }

  const headerFallback = `
    <header class="site-header">
      <div class="container nav-container">
        <div class="logo">
          <span class="logo-main">rdsgn</span>
          <span class="logo-sub">Redesign Digital</span>
        </div>
        <nav class="main-nav" id="mainNav">
          <a href="/">Home</a>
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/#portfolio">Portfolio</a>
          <a href="/blog/">Blog</a>
          <a href="/#contact">Contact</a>
          <button id="themeToggle" class="theme-toggle">🌙</button>
        </nav>
        <button id="navToggle" class="nav-toggle">☰</button>
      </div>
    </header>
  `;

  const footerFallback = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <p>© <span id="year"></span> rdsgn • Redesign Digital.</p>
        <p class="footer-note">Built with HTML, CSS, JS • Hosted on GitHub Pages</p>
      </div>
    </footer>
  `;

  function initYear() {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme') || root.getAttribute('data-theme');
    root.setAttribute('data-theme', saved || 'dark');
    updateThemeToggleUI();
  }

  function updateThemeToggleUI() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme');
    const toggles = selectAll('#themeToggle, .theme-toggle');
    toggles.forEach(btn => btn.textContent = theme === 'light' ? '☀️' : '🌙');
  }

  function initThemeToggleListener() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t || (!t.classList.contains('theme-toggle') && t.id !== 'themeToggle')) return;
      const root = document.documentElement;
      const now = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', now);
      localStorage.setItem('theme', now);
      updateThemeToggleUI();
    });
  }

  function initNavToggle() {
    const navToggle = document.getElementById('navToggle') || select('.nav-toggle');
    const mainNav = document.getElementById('mainNav') || select('.main-nav');
    if (!navToggle || !mainNav) return;

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 700) mainNav.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth > 700) return;
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') mainNav.classList.remove('open');
    });
  }

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#')) {
        const t = document.querySelector(href);
        if (!t) return;
        e.preventDefault();
        const offset = t.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: offset, behavior: 'smooth' });
        const mainNav = select('.main-nav');
        if (window.innerWidth <= 700) mainNav?.classList.remove('open');
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname && url.hash) {
          const t = document.querySelector(url.hash);
          if (t) {
            e.preventDefault();
            const offset = t.getBoundingClientRect().top + window.scrollY - 72;
            window.scrollTo({ top: offset, behavior: 'smooth' });
            const mainNav = select('.main-nav');
            if (window.innerWidth <= 700) mainNav?.classList.remove('open');
          }
        }
      } catch {}
    });
  }

  async function bootstrap() {
    await loadComponent('site-header', 'header.html', headerFallback);
    await loadComponent('site-footer', 'footer.html', footerFallback);

    setTimeout(() => {
      initYear();
      initTheme();
      initThemeToggleListener();
      initNavToggle();
      initSmoothScroll();
    }, 50);
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})();
