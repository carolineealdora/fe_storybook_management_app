Classification: INTERNAL

# Plan: admin counts, price-history names, and CORS lockdown (backend)

**For:** `storybook_management_app` (Go backend). **Requested by:** the Book Management frontend (`fe_storybook_management_app`).
**Status:** implemented on backend branch `feat/STORY-5-admin-counts-cors` (stacked on STORY-4), 2026-11-16. Not yet merged.
**Order:** apply **after** `feat/STORY-4-split-role-surface` is merged. That branch has uncommitted changes to
`adminbook/controller.go`, `adminbook/service.go` and `PLAN.md`, which this plan also touches.

---

## Why

The admin design (`MainStory Apps.dc.html`, screens E4 and E5) shows numbers the API does not return yet:

| Screen                   | Design copy                                            | Missing from the API                                      |
| ------------------------ | ------------------------------------------------------ | --------------------------------------------------------- |
| E5 · Delete confirmation | "**38 families** who bought it keep access in My Book" | how many users own the book                               |
| E4 · Subscription config | "**214 active subscribers** keep their current price…" | how many active subscriptions exist                       |
| CR-001 price history     | who changed the price                                  | `price_history[].changed_by` is an admin UUID, not a name |

And `CORS_ALLOW_ORIGINS` defaults to `*` (`config/config.go`), so any website can call the API from a browser
when the variable is not set. The admin frontend never needs cross-origin calls: it is served on the same origin
as `/api` (Vite proxy in dev, the nginx config in `deploy/` in production).

## API contract changes (additive, no breaking change)

Update `docs/API-contracts.md` in the same PR.

**AdminBook** (`GET /admin/books`, `GET /admin/books/:id`, `POST`/`PUT` responses), with one new field:

```json
{ "...": "...", "purchase_count": 38 }
```

`purchase_count` is the number of users who own the book: rows in `purchases` for this `book_id`. It is always present, and `0` when nobody has bought it.

**AdminPlan** (`GET` / `PUT /admin/subscription-plan`), with one new field, plus one new field on each history row:

```json
{
  "...": "...",
  "active_subscriber_count": 214,
  "price_history": [
    {
      "id": "uuid",
      "old_price": 49000,
      "new_price": 59000,
      "changed_by": "admin uuid",
      "changed_by_name": "Demo Admin",
      "changed_at": "…"
    }
  ]
}
```

- `active_subscriber_count`: subscriptions with `status = 'active' AND expires_at > NOW()`. One per user,
  because of `uq_subscriptions_one_active`. This is the same rule as the badge (CR-001-1 B1).
- `changed_by_name`: `admins.name` of `changed_by`. It is `null` only if that admin row no longer exists.

## Decisions (please confirm or annotate)

1. **D1: Count in SQL, not in Go.** The list uses a single `LEFT JOIN (SELECT book_id, COUNT(*) … GROUP BY book_id)`,
   so there is no N+1. `idx_purchases_book_id` already exists.
2. **D2: Soft-deleted books.** They are excluded from the admin list as today, so their counts are never shown. No change.
3. **D3: The subscriber count is computed on each `GET`/`PUT` of the plan.** It is one indexed query
   (`idx_subscriptions_due` covers `status='active'` + `expires_at`). No cache.
4. **D4: CORS default becomes empty, meaning same-origin only.** When `CORS_ALLOW_ORIGINS` is empty, the CORS middleware
   is **not registered**. A browser on another origin is then blocked by the browser itself. Deployments
   that really serve a frontend from another origin set the variable explicitly. `*` is no longer the default.
5. **D5: `.env.example`.** It currently says `CORS_ALLOW_ORIGINS=http://localhost:5173`. Change it to empty, with a
   comment, because the admin frontend runs on `:3000` behind the Vite proxy and needs no CORS.

## Phases (TDD: tests first, show them failing, then implement; tests and implementation in separate commits)

Branch: `feat/STORY-5-admin-counts-cors`. The ticket id is an assumption: use the real one.

### Phase 1: `purchase_count` on AdminBook

- Tests: repository integration tests. A book with 2 purchases gives 2 and a book with none gives 0, in both
  list and get. Service and controller tests check the field is mapped into the DTO and JSON.
- Files: `internal/repositories/book/repository.go` (list/get queries),
  `internal/services/adminbook/service.go` (mapping), `models/dto/book.go` (`PurchaseCount int \`json:"purchase_count"\``),
mocks in `test/mock/...`.

### Phase 2: `active_subscriber_count` and `changed_by_name` on AdminPlan

- Tests: repository integration tests. These cover active-and-unexpired subscriptions being counted, while expired,
  cancelled, and active subscriptions past `expires_at` are not. History rows carry the admin name, and the name is null
  when the admin is missing. Service and controller tests check the JSON shape.
- Files: `internal/repositories/subscription/repository.go` (count query; `LEFT JOIN admins` on history),
  `internal/services/subscription/service.go`, `models/dto/subscription.go`
  (`ActiveSubscriberCount int`, `PlanPriceChangeView.ChangedByName *string`).

### Phase 3: CORS lockdown

- Tests: route tests. With an empty config, a cross-origin preflight gets no `Access-Control-Allow-Origin`.
  With `CORS_ALLOW_ORIGINS=https://admin.example`, that origin is allowed and another origin is not.
- Files: `config/config.go` (drop `envDefault:"*"`), `handler/route.go` (register CORS only when the list
  is non-empty; add `// SECURITY: manual review required`), `.env.example`.

### Phase 4: Docs

- `docs/API-contracts.md`: the new fields above, plus the CORS note under Conventions.
- `make done`, with the full output shown.

## Files NOT touched

Auth (`internal/services/auth/*`, login/refresh/logout), the payment/order code, migrations (no schema
change is needed), and everything the STORY-4 branch is removing.

## Risks / open questions

- **R1:** Is anything else deployed against this backend from another origin (a staging frontend on a
  different host)? If so, set `CORS_ALLOW_ORIGINS` for that environment **before** deploying Phase 3.
- **R2:** "Families" on the delete dialog means users (one account per family, per the PRD assumptions). Confirm
  the copy is acceptable.
- **R3:** `changed_by_name` shows an admin's name to other admins. There's only one admin role, and admins are
  staff, so this is assumed acceptable. Confirm under UU PDP / ISO 27701 data-minimisation if needed.

## Frontend status

The admin frontend already reads these fields **when present** and falls back to today's generic copy when
absent (`src/lib/types.ts`, `features/books/delete-message.ts`, `features/subscription/PlanForm.tsx`,
`features/subscription/PriceHistory.tsx`). No frontend release has to wait for this backend change.
