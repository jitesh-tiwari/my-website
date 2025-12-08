/* ===============================
   THEME TOGGLE (Dark / Light)
   =============================== */

const themeToggleBtn = document.querySelector(".theme-toggle");
const html = document.documentElement;

// Load saved theme if exists
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
}

// Toggle theme function
function toggleTheme() {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}

// Theme toggle button click
if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
}


/* ===============================
   MOBILE NAVBAR TOGGLE
   =============================== */

const navToggleBtn = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

// Toggle navbar open/close
if (navToggleBtn && mainNav) {
    navToggleBtn.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });
}

// Close navbar when clicking outside (mobile only)
document.addEventListener("click", (e) => {
    if (window.innerWidth > 700) return; // only mobile

    if (
        !mainNav.contains(e.target) && 
        !navToggleBtn.contains(e.target)
    ) {
        mainNav.classList.remove("open");
    }
});

// Optional: close navbar on ESC key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        mainNav.classList.remove("open");
    }
});


/* ===============================
   SMOOTH SCROLL FOR NAV LINKS
   =============================== */

document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", function (e) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;

        e.preventDefault();
        window.scrollTo({
            top: target.offsetTop - 70,
            behavior: "smooth",
        });

        // Close mobile nav after clicking link
        if (window.innerWidth < 700) {
            mainNav.classList.remove("open");
        }
    });
});
