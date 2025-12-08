/* =========================================================
   main.js — Component Loader + Theme Toggle + Mobile Nav
   ========================================================= */

(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  /* --------------------------------------------
     DETECT COMPONENT PATH (supports /blog/* pages)
     -------------------------------------------- */
  function getComponentsPath() {
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);

    if (segments.length >= 2) {
      return "../components/";
    }
    return "components/";
  }

  /* --------------------------------------------
     LOAD COMPONENT (header / footer)
     -------------------------------------------- */
  async function loadComponent(targetId, fileName, fallback = "") {
    const target = document.getElementById(targetId);
    if (!target) return;

    const base = getComponentsPath();
    const url = base + fileName;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Fetch failed");
      const html = await res.text();
      target.innerHTML = html;
    } catch (err) {
      console.warn("Component load failed:", url, err);
      target.innerHTML = fallback;
    }
  }

  /* --------------------------------------------
     FALLBACK HEADER + FOOTER (if fetch fails)
     -------------------------------------------- */
  const fallbackHeader = `
    <header class="site-header">
      <div class="container nav-container">
        <div class="logo">
          <span class="logo-main">rdsgn</span>
          <span class="logo-sub">Redesign Digital</span>
        </div>

        <nav id="mainNav" class="main-nav">
          <a href="/">Home</a>
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/#portfolio">Portfolio</a>
          <a href="/blog/">Blog</a>
          <a href="/#contact">Contact</a>
        </nav>

        <div class="nav-controls">
          <button id="themeToggle" class="theme-toggle">🌙</button>
          <button id="navToggle" class="nav-toggle">☰</button>
        </div>
      </div>
    </header>
  `;

  const fallbackFooter = `
    <footer class="site-footer">
      <div class="container footer-inner">
        <p><strong>rdsgn</strong> — Redesign Digital</p>
        <p class="footer-note">© <span id="year"></span> All rights reserved.</p>
      </div>
    </footer>
  `;

  /* --------------------------------------------
     THEME TOGGLE SYSTEM (light / dark)
     -------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const toggles = $$("button#themeToggle, .theme-toggle");
    toggles.forEach((btn) => {
      btn.textContent = theme === "light" ? "☀️" : "🌙";
      btn.setAttribute("aria-pressed", theme === "light");
    });

    localStorage.setItem("theme", theme);
  }

  function initTheme() {
    const stored = localStorage.getItem("theme");
    if (stored) {
      applyTheme(stored);
    } else {
      applyTheme("dark"); // default
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("#themeToggle")) {
        const current =
          document.documentElement.getAttribute("data-theme") === "light"
            ? "dark"
            : "light";
        applyTheme(current);
      }
    });
  }

  /* --------------------------------------------
     MOBILE NAVIGATION BEHAVIOR
     -------------------------------------------- */
  function initMobileNav() {
    const nav = $("#mainNav");
    const toggle = $("#navToggle");

    if (!nav || !toggle) return;

    function openNav() {
      nav.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeNav() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.classList.contains("open") ? closeNav() : openNav();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (window.innerWidth > 700) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeNav();
      }
    });

    // Close when pressing escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // Close after clicking a nav link (mobile only)
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        if (window.innerWidth <= 700) closeNav();
      });
    });
  }

  /* --------------------------------------------
     SMOOTH SCROLL FOR #ANCHORS and /#anchors
     -------------------------------------------- */
  function initSmoothScroll() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Same page hash (#about)
      if (href.startsWith("#")) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          const y = el.getBoundingClientRect().top + window.scrollY - 60;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }

      // Same-page /#about
      if (href.includes("#")) {
        try {
          const url = new URL(href, window.location.origin);
          if (url.pathname === window.location.pathname) {
            const target = document.querySelector(url.hash);
            if (target) {
              e.preventDefault();
              const y = target.offsetTop - 60;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }
        } catch (err) {}
      }
    });
  }

  /* --------------------------------------------
     YEAR UPDATE
     -------------------------------------------- */
  function updateYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------
     BOOTSTRAP
     -------------------------------------------- */
  async function start() {
    await loadComponent("site-header", "header.html", fallbackHeader);
    await loadComponent("site-footer", "footer.html", fallbackFooter);

    initTheme();
    initMobileNav();
    initSmoothScroll();
    updateYear();
  }

  document.addEventListener("DOMContentLoaded", start);
})();