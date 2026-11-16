# MainStory Book Management (admin)

Back office for StoryBook by MainStory: sign in, manage the master book list, and configure the monthly subscription.
React 19 single-page app built with Vite, React Router and Tailwind CSS.

- Design: `docs/design/extracted/.../MainStory Apps.dc.html` (section "App 2 · Book Management", screens E1–E5)
- Behaviour: `docs/design/PRD_storybook-lib-app.md` (US-15 to US-17) and `docs/design/CR-001_Badge_and_Subscription_Pricing.md`
- API contract: `../storybook_management_app/docs/API-contracts.md` (admin section)

## Run

Start the Go backend (`storybook_management_app`, default `http://localhost:9999`), then:

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The dev server forwards `/api/*` to the backend. Set `BACKEND_URL` if it runs elsewhere.
For a deployed build, either serve it behind the same `/api` path or set `VITE_API_URL`
(e.g. `https://api.example.com/api/v1`) at build time.

## How auth works

`src/lib/api.ts` logs in with `POST /admin/auth/login` and keeps the tokens in `localStorage`
(`src/lib/session.ts`). Every request sends `Authorization: Bearer …`. On `401 TOKEN_EXPIRED` it
refreshes once and retries; if the refresh fails, the session is cleared and the app goes to `/login`.
Book covers need the token too, so they load via `fetch` → blob (`src/lib/use-cover-url.ts`).

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… pnpm e2e   # needs the backend and its seeded admin
```
