#!/usr/bin/env bash
#
# publish.sh — 一键发布 HTML 到 mingyuyang.com
#
# 网站托管在 Cloudflare Pages,连接 GitHub 仓库 nuan623-code/personal-site。
# 只要把文件推送到 GitHub,Cloudflare Pages 会自动构建并上线(约 30-60 秒)。
#
# 用法:
#   ./publish.sh <html文件> [目标子目录]   把某个 HTML 复制进仓库并发布
#   ./publish.sh                          直接发布仓库里当前所有改动
#
# 示例:
#   ./publish.sh ~/Desktop/demo.html               -> 发布到 mingyuyang.com/demo.html
#   ./publish.sh ~/Desktop/demo.html projects/demo -> 发布到 mingyuyang.com/projects/demo/demo.html
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
  echo "📄 已复制 $(basename "$SRC") -> ${SUBDIR:-根目录}/"
fi

# 没有任何改动就退出
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
