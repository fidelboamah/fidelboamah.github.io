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
