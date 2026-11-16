#!/usr/bin/env bash
# PostToolUse (Edit|Write|MultiEdit): Prettier, then ESLint --fix, on the file Claude just changed.
f=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
case "$f" in "$root"/*) ;; *) exit 0 ;; esac            # only files inside this repo
case "$f" in *.ts|*.tsx|*.js|*.css|*.json|*.md) ;; *) exit 0 ;; esac
[ -f "$f" ] || exit 0
cd "$root" || exit 0
pnpm exec prettier --write --ignore-unknown "$f" >/dev/null 2>&1
case "$f" in *.ts|*.tsx|*.js) pnpm exec eslint --fix "$f" >/dev/null 2>&1 ;; esac
exit 0 # never block an edit; pnpm lint / the Stop hook catch what's left
