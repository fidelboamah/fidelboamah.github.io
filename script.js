// Theme toggle: switches between light and dark mode, persists choice.
(function () {
  const STORAGE_KEY = "theme";
  const root = document.body;

  function applyTheme(theme) {
    if (theme === "dark") {
      root.classList.add("dark-mode");
    } else {
      root.classList.remove("dark-mode");
    }
    syncToggles(theme === "dark");
  }

  function syncToggles(isDark) {
    document
      .querySelectorAll(".theme-toggle, .cs-theme-toggle")
      .forEach((btn) => btn.setAttribute("aria-pressed", String(isDark)));
  }

  // Apply saved preference (defaults to light if none saved).
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(saved || "light");

  const toggles = document.querySelectorAll(".theme-toggle, .cs-theme-toggle");
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isDark = root.classList.toggle("dark-mode");
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
      syncToggles(isDark);
    });
  });
})();

// Custom cursor: small dot + lagging ring with lerp interpolation.
(function () {
  // Skip on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.appendChild(ring);

  let mouseX  = window.innerWidth  / 2;
  let mouseY  = window.innerHeight / 2;
  let visible = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!visible) {
      ring.style.opacity = "1";
      visible = true;
    }

    ring.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  document.addEventListener("mouseleave", () => {
    ring.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    if (visible) {
      ring.style.opacity = "1";
    }
  });

  // Hover state: scale ring up on interactive elements
  const HOVER_SEL = "a, button, [role='button'], input, textarea, select, label, video, .home-card, .cs2-next-card";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(HOVER_SEL)) ring.classList.add("cursor-ring--hover");
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(HOVER_SEL)) ring.classList.remove("cursor-ring--hover");
  });

  // Click pulse
  document.addEventListener("mousedown", () => ring.classList.add("cursor-ring--click"));
  document.addEventListener("mouseup",   () => ring.classList.remove("cursor-ring--click"));
})();
