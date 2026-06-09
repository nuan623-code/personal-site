/**
 * 全站导航组件 — 自动注入并高亮当前页
 * 在每个 HTML 文件 <body> 顶部放 <div id="site-nav"></div>，
 * 然后 <script src="/assets/nav.js"></script> 即可。
 */
(function () {
  const NAV_ITEMS = [
    { label: "首页",           href: "/index.html" },
    { label: "🤖 AI 笔记",    href: "/ai-notes/index.html" },
    { label: "🌏 出海研习社", href: "/overseas/index.html" },
    { label: "📈 SaaS 成长",  href: "/saas-career/index.html" },
    { label: "✍️ 公众号归档", href: "/wechat-archive/index.html" },
    { label: "🎯 个人项目",   href: "/projects/index.html" },
  ];

  function buildNav() {
    const el = document.getElementById("site-nav");
    if (!el) return;

    const currentPath = location.pathname.replace(/\/$/, "") || "/index.html";

    const links = NAV_ITEMS.map(({ label, href }) => {
      const isActive = currentPath === href || (href !== "/index.html" && currentPath.startsWith(href.replace("/index.html", "")));
      return `<li><a href="${href}"${isActive ? ' class="active"' : ""}>${label}</a></li>`;
    }).join("");

    el.innerHTML = `
      <nav class="nav-inner">
        <a class="nav-logo" href="/index.html">鸣宇 Mingyu</a>
        <button class="nav-toggle" aria-label="菜单" onclick="this.nextElementSibling.classList.toggle('open')">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <ul class="nav-links">${links}</ul>
      </nav>`;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildNav);
  } else {
    buildNav();
  }
})();
