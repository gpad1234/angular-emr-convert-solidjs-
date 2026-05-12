#!/usr/bin/env bash
# convert-docs.sh — Convert Markdown docs to HTML using npx marked
#
# USAGE:
#   ./convert-docs.sh              # converts all docs/ markdown in mobile-emr/ and web/
#   ./convert-docs.sh <file.md>    # converts a single file
#
# REQUIREMENTS:
#   Node.js (uses npx — no global install needed)
#
# OUTPUT:
#   HTML files are written next to their source .md files with the same name.
#   e.g. web/docs/ARCHITECTURE.md -> web/docs/ARCHITECTURE.html

set -euo pipefail

convert() {
  local src="$1"
  local dest="${src%.md}.html"
  npx --yes marked "$src" -o "$dest"
  echo "Converted: $src -> $dest"
}

if [ $# -gt 0 ]; then
  for file in "$@"; do
    convert "$file"
  done
else
  for f in mobile-emr/docs/*.md web/docs/*.md; do
    [ -f "$f" ] && convert "$f"
  done
fi
