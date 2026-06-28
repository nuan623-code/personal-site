#!/usr/bin/env bash
#
# publish.sh — 一键发布 HTML 到 mingyuyang.com
#
# 用法:
#   ./publish.sh <html文件> [目标子目录]   把某个 HTML 复制进仓库并发布
#   ./publish.sh                          直接发布仓库里当前所有改动
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

SRC="${1:-}"
SUBDIR="${2:-}"

if [[ -n "$SRC" ]]; then
  if [[ ! -f "$SRC" ]]; then
    echo "❌ 找不到文件: $SRC" >&2
    exit 1
  fi

  DEST_DIR="$REPO_DIR"
  if [[ -n "$SUBDIR" ]]; then
    DEST_DIR="$REPO_DIR/$SUBDIR"
    mkdir -p "$DEST_DIR"
  fi
  cp "$SRC" "$DEST_DIR/"
  BASENAME="$(basename "$SRC")"
  echo "📄 已复制 $BASENAME -> ${SUBDIR:-根目录}/"

  # ── 计算 URL 路径 ────────────────────────────────────────────────
  if [[ -n "$SUBDIR" ]]; then
    URL_PATH="/$SUBDIR/$BASENAME"
  else
    URL_PATH="/$BASENAME"
  fi

  # ── 从 HTML 提取 <title> ─────────────────────────────────────────
  DEST_FILE="$DEST_DIR/$BASENAME"
  TITLE=$(python3 -c "
import re, sys
html = open('$DEST_FILE').read()
m = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
print(m.group(1).strip() if m else '')
")

  if [[ -z "$TITLE" ]]; then
    TITLE="${BASENAME%.html}"
  fi

  # ── 推断 tag 和 type ─────────────────────────────────────────────
  if [[ "$URL_PATH" == /projects/* ]]; then
    TAG="项目"; TYPE="project"
  elif [[ "$URL_PATH" == /overseas/* ]]; then
    TAG="移动广告"; TYPE="article"
  else
    TAG="AI"; TYPE="article"
  fi

  # ── 把新文章插入 articles.json 最前面（去重）──────────────────────
  python3 - <<PYEOF
import json, sys
path = '$REPO_DIR/articles.json'
articles = json.loads(open(path).read())

# 去重：已有同 url 则移除旧条目
articles = [a for a in articles if a['url'] != '$URL_PATH']

new_article = {
    "title": "$TITLE",
    "short_title": "$TITLE",
    "url": "$URL_PATH",
    "tag": "$TAG",
    "type": "$TYPE"
}
articles.insert(0, new_article)

open(path, 'w').write(json.dumps(articles, ensure_ascii=False, indent=2))
print(f"📝 articles.json 已更新: {new_article['title']}")
PYEOF

  # ── 重新生成 index.html ──────────────────────────────────────────
  python3 "$REPO_DIR/build-index.py"
fi

# ── 没有任何改动就退出 ───────────────────────────────────────────────
if [[ -z "$(git status --porcelain)" ]]; then
  echo "✅ 没有需要发布的改动,网站已是最新。"
  exit 0
fi

echo "📦 本次发布的改动:"
git status --short

git add -A
MSG="publish: 更新 $(date '+%Y-%m-%d %H:%M')"
if [[ -n "$SRC" ]]; then
  MSG="publish: $(basename "$SRC") ($(date '+%Y-%m-%d %H:%M'))"
fi
git commit -m "$MSG"
git push origin main

echo ""
echo "🚀 已推送到 GitHub,Cloudflare Pages 正在自动构建。"
echo "   约 30-60 秒后访问: https://mingyuyang.com"
