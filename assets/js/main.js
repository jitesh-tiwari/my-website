// Reusable component loader (header, footer, etc.)
function loadComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) return;

  fetch(path)
    .then((res) => res.text())
    .then((html) => {
      target.innerHTML = html;
      // after header/footer inserted, re-init features
      if (path.includes("header.html")) {
        initNavToggle();
        initThemeToggle();
      }
      if (path.includes("footer.html")) {
        initYear();
      }
    })
    .catch((err) => {
      console.error("Error loading component:", path, err);
    });
}

// Initialize current year in footer
function initYear() {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

// Mobile nav toggle
function initNavToggle() {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (!navToggle || !mainNav) return;

  navToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
    });
  });
}

// Dark / light mode
function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      root.dataset.theme = "light";
      toggleBtn.textContent = "🌙";
    } else {
      root.dataset.theme = "dark";
      toggleBtn.textContent = "☀️";
    }
  }

  const saved = localStorage.getItem("rdsgn-theme");
  applyTheme(saved || "dark");

  toggleBtn.addEventListener("click", () => {
    const current = root.dataset.theme === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem("rdsgn-theme", next);
  });
}

// Load header & footer on all pages
document.addEventListener("DOMContentLoaded", () => {
  loadComponent("site-header", "/components/header.html");
  loadComponent("site-footer", "/components/footer.html");
  // future: loadComponent("sidebar", "/components/sidebar.html");
});
