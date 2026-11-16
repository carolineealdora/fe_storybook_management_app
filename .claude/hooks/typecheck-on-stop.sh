#!/usr/bin/env bash
# Stop: block finishing while `pnpm typecheck` fails (CLAUDE.md §11).
input=$(cat)
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
out=$(pnpm -s typecheck 2>&1) && exit 0
# Already blocked once this turn: report instead of looping forever.
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  jq -n '{systemMessage: "pnpm typecheck is still failing."}'
  exit 0
fi
printf 'pnpm typecheck failed. Fix these before finishing:\n%s\n' "$(printf '%s\n' "$out" | tail -30)" >&2
exit 2
