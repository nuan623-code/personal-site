/**
 * 全站导航 — Digital Garden 版
 */
(function () {
  const NAV_ITEMS = [
    { label: "首页",    href: "/index.html" },
    { label: "学习",    href: "/ai-notes/index.html" },
    { label: "项目",    href: "/projects/index.html" },
    { label: "文章",    href: "/articles/index.html" },
    { label: "阅读",    href: "/reading/index.html" },
    { label: "GitHub",  href: "https://github.com/nuan623-code", external: true },
    { label: "关于",    href: "/about.html" },
  ];

  const SUN_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  function getTheme() {
    return localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  function buildNav() {
    const el = document.getElementById("site-nav");
    if (!el) return;

    const currentPath = location.pathname.replace(/\/$/, "") || "/index.html";

    const links = NAV_ITEMS.map(({ label, href, external }) => {
      const isActive = !external && (
        currentPath === href ||
        (href !== "/index.html" && currentPath.startsWith(href.replace("/index.html", "")))
      );
      const attrs = external ? ` target="_blank" rel="noopener"` : "";
      return `<li><a href="${href}"${attrs}${isActive ? ' class="active"' : ""}>${label}</a></li>`;
    }).join("");

    const theme = getTheme();
    applyTheme(theme);

    el.innerHTML = `
      <nav class="nav-inner">
        <a class="nav-logo" href="/index.html">Mingyu Yang</a>
        <div class="nav-right">
          <button class="nav-toggle" aria-label="菜单" id="nav-toggle-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <ul class="nav-links" id="nav-links">${links}</ul>
          <button class="nav-theme-btn" id="theme-toggle" aria-label="切换主题">
            ${theme === "dark" ? SUN_ICON : MOON_ICON}
          </button>
        </div>
      </nav>`;

    document.getElementById("theme-toggle").addEventListener("click", function () {
      const next = getTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      this.innerHTML = next === "dark" ? SUN_ICON : MOON_ICON;
    });

    document.getElementById("nav-toggle-btn").addEventListener("click", function () {
      document.getElementById("nav-links").classList.toggle("open");
    });
  }

  // Reveal animation
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { buildNav(); initReveal(); });
  } else {
    buildNav(); initReveal();
  }
})();
