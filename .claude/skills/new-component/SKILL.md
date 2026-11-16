---
name: new-component
description: Scaffold a React component with its colocated Vitest + React Testing Library test, following CLAUDE.md §7. Use when asked to create, add, or scaffold a component, UI primitive, or feature widget in this repo.
---

# New component

1. **Reuse first.** Search `src/components/ui/` and `src/features/` for something that already does this
   (and `src/components/ui/button-styles.ts` for link-styled buttons). Extend it instead of duplicating.
2. **Pick the location.**
   - Generic, app-agnostic primitive → `src/components/ui/<Name>.tsx`
   - Belongs to one feature → `src/features/<feature>/<Name>.tsx`
   - A routed page → `src/app/<Name>Page.tsx` (keep it thin: compose features), then add the route in `src/app/App.tsx`.
3. **Write the component** (`<Name>.tsx`):
   - Function component, props typed with an explicit `interface <Name>Props`. No `any`.
   - One component per file; non-component helpers go in a separate `.ts` file (fast-refresh lint rule).
   - Styling with Tailwind tokens from `src/index.css` only: no raw hex, no arbitrary px values.
   - Shows data? Handle loading, empty, error (use `LoadError`) and success. Load with `useApi` from `@/lib/use-api`;
     mutate with `apiRequest` from `@/lib/api`. Never call `fetch` directly.
   - Semantic HTML, labelled controls, visible focus (`focus-visible:outline-*`), keyboard reachable.
4. **Write the test** (`<Name>.test.tsx`, same folder):
   - Query by role, label or text. Test IDs only as a last resort.
   - If the component uses router APIs, render with `renderRoute(ui, path)` from `@/test/render-route`.
   - Mock the network with `vi.stubGlobal("fetch", vi.fn()...)`; never mock internal modules.
   - Cover the main behaviour plus each UI state the component owns.
5. **Check:** `pnpm vitest run <test path>`, then `pnpm typecheck && pnpm lint`.

No Storybook in this repo, so no story file.
