#!/usr/bin/env python3
"""
从 articles.json 重新生成 index.html 中的三个列表区域：
  - 最近更新（主栏，显示 title + tag）
  - 最近学习（侧栏，显示 short_title）
  - 最近项目（侧栏，显示 short_title）
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).parent
articles = json.loads((ROOT / "articles.json").read_text())

# ── 生成 最近更新 <ul> ──────────────────────────────────────────────
MAIN_LIMIT = 7
main_articles = [a for a in articles if a["type"] == "article"][:MAIN_LIMIT]

def main_li(a):
    return (
        f'            <li>\n'
        f'              <a href="{a["url"]}">\n'
        f'                <div class="article-title">{a["title"]}</div>\n'
        f'                <div class="article-meta">\n'
        f'                  <span class="article-tag">{a["tag"]}</span>\n'
        f'                </div>\n'
        f'              </a>\n'
        f'            </li>'
    )

main_ul = '\n'.join(main_li(a) for a in main_articles)

# ── 生成 最近学习 <ul> ──────────────────────────────────────────────
SIDE_LIMIT = 8
side_articles = [a for a in articles if a["type"] == "article"][:SIDE_LIMIT]

def side_li(a):
    return f'            <li><a href="{a["url"]}"><span>{a["short_title"]}</span></a></li>'

side_ul = '\n'.join(side_li(a) for a in side_articles)

# ── 生成 最近项目 <ul> ──────────────────────────────────────────────
proj_articles = [a for a in articles if a["type"] == "project"]

def proj_li(a):
    return f'            <li><a href="{a["url"]}"><span>{a["short_title"]}</span></a></li>'

proj_ul = '\n'.join(proj_li(a) for a in proj_articles)

# ── 写回 index.html ─────────────────────────────────────────────────
html = (ROOT / "index.html").read_text()

def replace_ul(html, marker_start, marker_end, new_content):
    pattern = rf'({re.escape(marker_start)}\n\s*<ul[^>]*>)\n.*?(\n\s*</ul>)'
    replacement = rf'\1\n{new_content}\2'
    result, n = re.subn(pattern, replacement, html, flags=re.DOTALL)
    if n == 0:
        print(f"⚠️  未找到标记: {marker_start}", file=sys.stderr)
    return result

html = replace_ul(html, '<!-- 最近更新 -->', '<!-- /最近更新 -->', main_ul)
html = replace_ul(html, '<!-- 最近学习 -->', '<!-- /最近学习 -->', side_ul)
html = replace_ul(html, '<!-- 最近项目 -->', '<!-- /最近项目 -->', proj_ul)

(ROOT / "index.html").write_text(html)
print("✅ index.html 已更新")
