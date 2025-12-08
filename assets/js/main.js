/* ===============================
  FINAL main.js — Component loader + Theme + Mobile Nav + Smooth Scroll
  File: assets/js/main.js
  =============================== */

(() => {
  // --- small helpers ---
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const isMobileWidth = () => window.innerWidth <= 700;

  // --- determine components path (works from root and subfolders like /blog/) ---
  function componentsBasePath() {
    const path = window.location.pathname;
    // If page is in a nested folder (e.g. /blog/...), components are ../components/
    const segments = path.split('/').filter(Boolean);
    // If segments length >= 2 OR starts with 'blog', go up one level
    if (segments.length >= 2 || segments[0] === 'blog') {
      return '../components/';
    }
    return 'components/';
  }

  // --- fetch and inject component with fallback html ---
  async function loadComponent(targetId, filename, fallbackHtml = '') {
    const target = document.getElementById(targetId);
    if (!target) return false;
    const base = componentsBasePath();
    const url = base + filename;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const html = await res.text();
      target.innerHTML = html;
      return true;
    } catch (err) {
      console.warn('Could not load component:', url, err);
      // insert fallback so UI never breaks
      target.innerHTML = fallbackHtml;
      return false;
    }
  }

  // --- fallback header & footer (minimal, used only if fetch fails) ---
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
        </nav>

        <div class="nav-controls">
          <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">🌙</button>
          <button id="navToggle" class="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>
        </div>
      </div>
    </header>
  `;

  const footerFallback = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <p>© <span id="year"></span> rdsgn • Redesign Digital. All rights reserved.</p>
        <p class="footer-note">Built with HTML, CSS & JS. Hosted on GitHub Pages.</p>
      </div>
    </footer>
  `;

  // --- initialization utilities ---
  function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function getStoredTheme() {
    return localStorage.getItem('theme');
  }

  function setStoredTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.setAttribute('data-theme', 'dark');
    updateThemeToggleUI();
  }

  function updateThemeToggleUI() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const toggles = $$('button#themeToggle, button.theme-toggle');
    toggles.forEach(btn => {
      // show sun for light, moon for dark
      btn.textContent = theme === 'light' ? '☀️' : '🌙';
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    });
  }

  // --- delegated theme toggle listener (works even if button injected later) ---
  function initThemeToggleListener() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (!t) return;
      if (t.id === 'themeToggle' || t.classList.contains('theme-toggle')) {
        const root = document.documentElement;
        const now = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        applyTheme(now);
        setStoredTheme(now);
      }
    });
  }

  // --- mobile nav toggle behavior ---
  function initNavToggle() {
    // Using delegated queries to support injected header
    const navToggle = document.getElementById('navToggle') || $('.nav-toggle');
    const mainNav = document.getElementById('mainNav') || $('.main-nav');

    if (!navToggle || !mainNav) return;

    // Ensure ARIA reflects state
    function setNavAria(open) {
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    navToggle.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const opening = !mainNav.classList.contains('open');
      mainNav.classList.toggle('open');
      setNavAria(opening);
    });

    // Close nav on link click (mobile only)
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (isMobileWidth()) {
          mainNav.classList.remove('open');
          setNavAria(false);
        }
      });
    });

    // Close when clicking outside (mobile)
    document.addEventListener('click', (ev) => {
      if (!isMobileWidth()) return;
      if (!mainNav.contains(ev.target) && !navToggle.contains(ev.target)) {
        if (mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          setNavAria(false);
        }
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        setNavAria(false);
      }
    });

    // Prevent layout jumps: force width from computed style when opening (safety)
    const openWatcher = new MutationObserver(() => {
      if (mainNav.classList.contains('open')) {
        // read computed width to stabilise layout (no inline style change)
        const w = getComputedStyle(mainNav).width;
        // set CSS variable if needed — avoid writing inline width unless necessary
        // (we rely on CSS clamp; this is just a no-op read to stabilize reflow)
        void w;
      }
    });
    openWatcher.observe(mainNav, { attributes: true, attributeFilter: ['class'] });
  }

  // --- smooth scroll for same-page anchors (works even for links with path+hash) ---
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;

      // handle simple hash links
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 72);
        window.scrollTo({ top: y, behavior: 'smooth' });
        // close mobile nav
        const nav = document.getElementById('mainNav') || $('.main-nav');
        if (nav && isMobileWidth()) nav.classList.remove('open');
        return;
      }

      // handle links like /#about or same-page path with hash
      try {
        const url = new URL(href, window.location.origin);
        if (url.hash && url.pathname === window.location.pathname) {
          const target = document.querySelector(url.hash);
          if (!target) return;
          e.preventDefault();
          const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 72);
          window.scrollTo({ top: y, behavior: 'smooth' });
          const nav = document.getElementById('mainNav') || $('.main-nav');
          if (nav && isMobileWidth()) nav.classList.remove('open');
        }
      } catch (err) {
        // ignore invalid URLs
      }
    });
  }

  // --- bootstrap: load components then initialize features ---
  async function bootstrap() {
    // load header/footer (try multiple times if necessary)
    await loadComponent('site-header', 'header.html', headerFallback);
    await loadComponent('site-footer', 'footer.html', footerFallback);

    // prefer stored theme
    const stored = getStoredTheme();
    if (stored) applyTheme(stored);
    else {
      // if no stored, keep existing data-theme or default to dark
      const root = document.documentElement;
      const cur = root.getAttribute('data-theme');
      applyTheme(cur === 'light' ? 'light' : 'dark');
    }

    // small delay for elements to be present
    setTimeout(() => {
      initYear();
      initThemeToggleListener();
      initNavToggle();
      initSmoothScroll();
    }, 40);
  }

  // start on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', bootstrap);
})();