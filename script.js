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

// Vertical site menu: open/close, outside click, escape.
(function () {
  const btn = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
})();

// Custom cursor: small dot + lagging ring with lerp interpolation.
(function () {
  // Skip on touch devices
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  const cursorLabel = document.createElement("span");
  cursorLabel.className = "cursor-label";
  ring.appendChild(cursorLabel);
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
    const labelled = e.target.closest("[data-cursor-label]");
    if (labelled) {
      cursorLabel.innerHTML = labelled.dataset.cursorLabel;
      ring.classList.add("cursor-ring--label");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(HOVER_SEL)) ring.classList.remove("cursor-ring--hover");
    if (e.target.closest("[data-cursor-label]")) ring.classList.remove("cursor-ring--label");
  });

  // Click pulse
  document.addEventListener("mousedown", () => ring.classList.add("cursor-ring--click"));
  document.addEventListener("mouseup",   () => ring.classList.remove("cursor-ring--click"));
})();

// Case study table of contents: highlight the section currently in view.
(function () {
  const toc = document.querySelector(".cs-toc");
  if (!toc) return;

  const links = [...toc.querySelectorAll(".cs-toc-link")];
  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  function setActive(id) {
    links.forEach((l) =>
      l.classList.toggle("active", l.getAttribute("href") === "#" + id)
    );
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Pick the entry nearest the top of the viewport that is visible.
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length) {
        const top = visible.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )[0];
        setActive(top.target.id);
      }
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));

  // The rail is always on screen; only the active-section highlight moves.
  toc.classList.add("visible");
})();

// First-load preloader: "Fidel [avatar] Boamah" intro, then reveal the page.
// Plays once per session — returning to the home page from the nav skips it.
(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const body = document.body;
  const SEEN_KEY = "introPlayed";

  // sessionStorage can throw in private mode; treat a failure as "not seen".
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch (e) {}

  if (seen) {
    body.classList.remove("preloading");
    preloader.remove();
    return;
  }
  try { sessionStorage.setItem(SEEN_KEY, "1"); } catch (e) {}

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Hold the intro long enough for the words + avatar to settle, then hand off.
  const HOLD = reduced ? 200 : 2500;

  // Briefly wink before the page reveals.
  const avatar = preloader.querySelector(".pre-avatar");
  if (avatar && !reduced) {
    setTimeout(() => { avatar.src = "assets/profilepic_wink.png"; }, HOLD - 550);
  }

  function reveal() {
    body.classList.remove("preloading"); // fade the page content in
    preloader.classList.add("is-done");   // fade the overlay out
    preloader.addEventListener(
      "transitionend",
      () => preloader.remove(),
      { once: true }
    );
    // Fallback removal in case the transition event doesn't fire.
    setTimeout(() => preloader && preloader.remove(), 900);
  }

  window.addEventListener("load", () => setTimeout(reveal, HOLD));
  // Safety net if the load event already fired or is delayed by media.
  setTimeout(reveal, HOLD + 2500);
})();
