Classification: INTERNAL

# CLAUDE.md — Frontend Repo Guide

Instructions for Claude Code in this repository. Follow them every session.
If a rule here is never needed, propose deleting it. If a rule must never be broken, propose enforcing it with a hook instead.

---

## 1. Project facts

- **App:** MainStory Book Management, the admin back office for StoryBook by MainStory (master book list + subscription config).
- **Stack:** React 19 single-page app, built with Vite. React Router 8 in declarative mode (`BrowserRouter` / `Routes`, imported from `react-router`). TypeScript (strict) + Tailwind CSS 4.
- **Not Next.js.** There are no Server Components, no `"use client"`, no `next/*` imports.
- **Package manager:** pnpm
- **Unit / component tests:** Vitest + React Testing Library (jsdom)
- **E2E tests:** Playwright (`tests/e2e/`)
- **Dev server:** `pnpm dev` → http://localhost:3000. It forwards `/api/*` to the Go backend (`BACKEND_URL`, default `http://localhost:9999`).
- **Backend contract (source of truth, never guess endpoints):** `../storybook_management_app/docs/API-contracts.md`, admin section.
- **Spec:** `docs/design/PRD_storybook-lib-app.md` (US-15 to US-17, §8 edge cases) and `docs/design/CR-001_Badge_and_Subscription_Pricing.md`.
- **Design:** `docs/design/extracted/prd-two-app-design-system/project/MainStory Apps.dc.html`, section "App 2 · Book Management" (screens E1–E5).

## 2. Commands

| Purpose          | Command                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Dev server       | `pnpm dev`                                                                                 |
| Typecheck        | `pnpm typecheck` (`tsc --noEmit`)                                                          |
| Lint             | `pnpm lint`                                                                                |
| Format           | `pnpm format`                                                                              |
| Single test file | `pnpm vitest run <path>`                                                                   |
| All unit tests   | `pnpm test`                                                                                |
| E2E              | `E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… pnpm e2e` (needs the backend and its seeded admin) |
| Production build | `pnpm build` (then `pnpm preview`)                                                         |

While iterating, run single test files. Before declaring a task done, run the full checks in §5.

Hooks in `.claude/settings.json` run Prettier and `eslint --fix` after every edit, and block finishing while `pnpm typecheck` fails.

---

## 3. Golden rules

1. **Verify before you claim done.** Show evidence (commands run and their output, screenshots). "Looks done" is not done.
2. **Reuse before you create.** Search `src/components/ui/` and `src/features/` for an existing component, hook, or util before writing a new one.
3. **No new dependencies** without asking first. Explain why the existing stack can't do it.
4. **Stay in scope.** Change only what the task needs. Note unrelated issues instead of fixing them.
5. **Fix root causes, not symptoms.** Never use `@ts-ignore`, `eslint-disable`, `any`, `.skip`, or deleted assertions to get checks green.

---

## 4. Workflow for every task

### 4.1 Understand

- **Small change** (describable in one sentence): just do it.
- **Multi-file change, unclear approach, or unfamiliar area:** explore first, then present a plan _before editing_. The plan lists:
  - files to change or create
  - existing components or patterns to follow (name the file you will copy the pattern from)
  - data and state flow
  - UI states to handle (loading / empty / error / success)
  - test plan
  - what is out of scope
- The PRD, CR-001 and the API contract are the source of truth. If they conflict with the code or the request, flag the conflict instead of guessing.
- **Large new feature with no spec:** interview the user with the AskUserQuestion tool (UI/UX, states, edge cases, permissions, responsive behavior, tradeoffs). Skip the obvious questions. Then write the spec to `docs/specs/<feature>.md` before writing code. Recommend starting a fresh session to implement it.
- For broad codebase investigation, use a subagent so the main context stays clean.

### 4.2 Implement in thin slices

- Build one component, route, or vertical slice at a time. Each slice ends with code + tests + passing checks.
- Follow the nearest existing example in the codebase. Don't invent new patterns. For a new component, use the `new-component` skill.
- Commit after each green slice using Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).

### 4.3 Verify (definition of done)

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes with no new warnings
- [ ] Relevant unit/component tests added or updated, and passing
- [ ] New user flows have a Playwright happy-path test
- [ ] UI checked in the browser (see §6)
- [ ] No console errors or failed network requests
- [ ] Layout works at 375px, 768px, and 1280px
- [ ] Keyboard navigable, visible focus, labels and alt text present
- [ ] Final report lists the commands run with results, plus screenshots for UI work

### 4.4 Review

For non-trivial work, review the diff before reporting done. Use the `/code-review` skill for correctness and the `ui-reviewer` subagent for UI work, and check it against the spec in a fresh context. Fix gaps that affect correctness or stated requirements. List the rest as optional suggestions. Don't over-engineer to satisfy every finding.

---

## 5. Pre-handoff check (run in this order)

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Run the relevant Playwright specs too when user flows changed.

---

## 6. Visual verification

- **Browser tools available** (Claude in Chrome / `claude --chrome`): open the dev server, navigate to the changed screen, interact with it, read the console and network errors, and take screenshots.
- **Reference design given:** implement it, screenshot the result, list the differences against the reference (`MainStory Apps.dc.html`, App 2), fix them, and repeat until they match.
- **No browser tools:** take screenshots with Playwright (`page.screenshot`) and inspect the images.
- Signed-in screens need the backend running. Without it, only `/login` and its error states can be checked.
- Never say the UI "looks right" without having looked at it.

---

## 7. Code conventions

### 7.1 Structure

```
src/
├── main.tsx             # entry: BrowserRouter + App
├── app/                 # App.tsx (routes) + one thin *Page.tsx per route, composing features
├── components/ui/       # design-system primitives (Button, Field, Input, ConfirmDialog, LoadError, …)
├── features/<name>/     # feature components, form logic, tests (colocated): auth, books, subscription, shell
├── lib/                 # api.ts (requests + auth), session.ts, use-api.ts, use-cover-url.ts, types.ts, format.ts
├── test/                # test helpers (render-route.tsx)
└── index.css            # Tailwind + design tokens (@theme)
tests/e2e/               # Playwright specs + fixtures
docs/design/             # PRD, CR-001, design handoff (read-only)
```

### 7.2 Components

- Function components in TypeScript, with props typed by an explicit `interface`. No `any`.
- One component per file. Split any file that grows past ~200 lines. Non-component exports (style helpers, constants) go in their own `.ts` file.
- Components that show data must handle **loading, empty, error, and success** states.
- Prefer composition (children/slots) over piling on boolean props.
- Set the page title with React 19's `<title>` element inside the page component.

### 7.3 Styling

- Use design tokens only (the `@theme` block in `src/index.css`). No raw hex colors and no one-off pixel values.
- No inline styles except for truly dynamic values.
- Mobile-first: write base styles for small screens, then add breakpoints for larger ones.
- Brand orange (`brand`) is for primary actions only. The StoryBook palette and fonts (`sb-*`, `font-kid*`) appear only in the subscription preview.

### 7.4 State and data

- Read data with `useApi(path)` from `@/lib/use-api`. Send changes with `apiRequest` from `@/lib/api`. Never call `fetch` directly: auth headers, token refresh and error handling live in `api.ts`.
- API shapes live in `src/lib/types.ts`, matching the contract. Responses go through `readEnvelope`, and errors arrive as `ApiError` with the contract's `code`.
- Form validation is plain TypeScript in `features/*/…-form.ts`, mirroring the contract's rules, with unit tests. There's no TanStack Query or zod yet (decided 2026-11-16). Ask before adding them.
- Use local state for UI-only concerns. Filters live in the URL (`useSearchParams` / `navigate`).
- `encodeURIComponent` any id that goes into a request path.

### 7.5 Security

- Admin tokens are stored in `localStorage` (`src/lib/session.ts`). Never log them, render them, or put them in URLs.
- Only a `401` from `/auth/refresh` signs the admin out. Network failures and 5xx responses surface as `SERVICE_UNAVAILABLE`.
- Render API text as React text, never as `dangerouslySetInnerHTML`.

### 7.6 Accessibility

- Use semantic HTML first. Add ARIA only when native elements can't express the behavior.
- Every interactive element is reachable by keyboard and has a visible focus state.
- Form inputs have labels, images have meaningful `alt` text, and color contrast meets WCAG AA.
- Respect `prefers-reduced-motion` (handled globally in `index.css`).

### 7.7 Testing

- Test behavior, not implementation. Query by role, label, or text, not by class names. Use test IDs only as a last resort.
- Mock the network at the boundary with `vi.stubGlobal("fetch", …)`. Don't mock internal modules. MSW isn't installed.
- Components that use the router render through `renderRoute` from `@/test/render-route`. Assert where navigation landed, not that a function was called.
- **Bug fixes:** first write a failing test that reproduces the bug, then fix it.

---

## 8. Design quality

- Use real copy from the spec and design, not lorem ipsum.
- Build or extend `components/ui/` primitives before composing pages.
- For new screens with no design: use the `frontend-design` skill if it's available, and choose a deliberate visual direction that stays within the existing tokens. Ask before introducing new fonts, colors, or animation libraries.

---

## 9. Context and session hygiene

- Stay on one task. If the user switches to unrelated work, suggest running `/clear` first.
- If the same issue has been corrected twice, stop. Summarize what you learned and suggest `/clear` plus a sharper prompt.
- Scope searches narrowly. Don't read the whole codebase, and delegate large explorations to subagents.
- **When compacting, always preserve:** the list of modified files, the current plan or spec path, and the test commands in use.

---

## 10. Never

- Edit generated files or `.env*` files, edit lockfiles by hand, or commit secrets. Don't read the backend repo's `.env`.
- Add dependencies, change build or lint config, or upgrade framework versions without asking.
- Skip or disable tests, lint rules, or type checks to make things pass.
- Leave `console.log`, commented-out code, or untracked TODOs behind.
- Push to `main` or force-push.

---

## 11. Repo setup tasks (when asked to "set up the repo")

Status as of 2026-11-16: items 1–5 are done. Item 6 is up to you.

1. TypeScript strict mode, ESLint, Prettier, Vitest + RTL, and Playwright, with `package.json` scripts matching §2. ✅
2. Hooks in `.claude/settings.json` (scripts in `.claude/hooks/`): ✅
   - after every file edit/write → run Prettier and `eslint --fix` on the changed file
   - on Stop → run `pnpm typecheck` and block finishing if it fails
3. A permission allowlist for safe commands (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm vitest run`, `pnpm format`, `pnpm build`, `git status`, `git diff`, `git commit`). ✅
4. Skill `.claude/skills/new-component/SKILL.md` that scaffolds a component with its test (no Storybook in this repo). ✅
5. Subagent `.claude/agents/ui-reviewer.md` that reviews a diff for accessibility, token usage, component reuse, and missing UI states. ✅
6. Install these plugins yourself via `/plugin`: a TypeScript code-intelligence plugin and `frontend-design`.

Once item 6 is done, remove this section to keep the file lean.

---

## 12. Keep this file healthy

- When the user corrects the same mistake twice, propose a one-line rule for this file.
- Propose removing rules that never matter in practice. A short CLAUDE.md gets followed; a long one gets ignored.
