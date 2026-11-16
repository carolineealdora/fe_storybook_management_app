# MainStory Book Management (admin)

Back office for StoryBook by MainStory: sign in, manage the master book list, and configure the monthly subscription.

- Design: `docs/design/extracted/.../MainStory Apps.dc.html` (section "App 2 · Book Management", screens E1–E5)
- Behaviour: `docs/design/PRD_storybook-lib-app.md` (US-15 to US-17) and `docs/design/CR-001_Badge_and_Subscription_Pricing.md`
- API contract: `../storybook_management_app/docs/API-contracts.md` (admin section)

## Run

Start the Go backend (`storybook_management_app`, default `http://localhost:9999`), then:

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Set `BACKEND_URL` if the backend runs somewhere else.

## How auth works

The browser never sees the backend tokens. `src/app/api/v1/[...path]` is a small backend-for-frontend:
login stores the access and refresh tokens in httpOnly cookies, and every `/api/v1/admin/*` call is
forwarded with `Authorization: Bearer …`. `src/proxy.ts` sends signed-out visitors to `/login` and
refreshes the 30-minute access token from the 7-day refresh token.

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
E2E_ADMIN_EMAIL=… E2E_ADMIN_PASSWORD=… pnpm e2e   # needs the backend and its seeded admin
```
