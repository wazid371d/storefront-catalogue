# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

Implemented: `backend/` (Node/Express/TypeScript API) and `frontend/` (React/TypeScript client), wired together via `docker-compose.yml` (mongo + mailhog + both apps). `SYSTEM_DESIGN.md` is the design doc this was built against; `DECISIONS.md` and `AI_USAGE.md` cover assumptions/cuts and AI usage notes respectively.

This is a take-home code challenge (AI-Native Engineer): build a product catalogue PoC — browse, search, product detail, and an enquiry form — backed by the Fake Store API, with a 2–3 hour time-box.

### Commands

Run from `backend/` or `frontend/` respectively — both packages expose the same script names:

```bash
npm install
npm run dev         # backend: tsx watch on :4000 · frontend: vite on :3000 (proxies /api to :4000)
npm run build        # backend: tsc -p tsconfig.json · frontend: tsc --noEmit && vite build
npm run typecheck    # tsc --noEmit
npm run lint          # eslint
npm test              # backend: jest · frontend: vitest run
```

Single test: backend `npx jest path/to/file.test.ts -t 'test name'`; frontend `npx vitest run path/to/file.test.tsx -t 'test name'`.

Backend tests need no running services — they spin up `mongodb-memory-server` and a throwaway local `http.createServer` standing in for the Fake Store API (see `backend/src/tests/setup/`). Don't reach for `nock` for this: Node 20's built-in `fetch` (undici) doesn't reliably route through `nock`'s `http`/`https` patching.

Full stack: `docker compose up --build` from the repo root (mongo, mailhog, backend on :4000, frontend on :3000 via nginx — nginx proxies `/api/*` to the backend service).

## Architecture — read `SYSTEM_DESIGN.md` first

`SYSTEM_DESIGN.md` is the authoritative design doc for this project and should be read in full before implementing anything. Key decisions that constrain how code should be written here:

- **Stack:** React 18 + TypeScript (Vite) client, Node.js + Express + TypeScript backend, MongoDB, targeting AWS (ECS Fargate, S3/CloudFront, SES) with a Docker Compose local equivalent.
- **The client never talks to the Fake Store API directly.** All product data flows through the Node backend — this is a hard constraint from the challenge brief, not just a preference.
- **Two provider interfaces are the core abstraction** and must be respected by any new code:
  - `ProductProvider` (`providers/product/product-provider.ts`) — `FakeStoreProvider` is the only implementation that may know about the Fake Store API. Services call the interface, never the concrete class.
  - `EmailProvider` (`providers/email/email-provider.ts`) — `SmtpProvider`/Nodemailer locally (MailHog in dev), swappable for SES in prod. Services call the interface.
  - This boundary exists because the brief explicitly expects the product data source and email provider to change later; don't let business logic import `fetch` or `nodemailer` directly.
- **Backend layering:** `routes/` (HTTP→controller mapping only) → `controllers/` (request/response shape, no business logic) → `services/` (business rules) → `providers/` + `repositories/` (the only layers allowed to know an external system or Mongo collection exists).
- **"Top rated" is curated data, not a computed field.** It lives in MongoDB (`featured_products`: `{ productId, category | null, position, curatedAt }`), separate from the Fake Store product data, because the brief requires the client to manually choose the 5 featured products.
- **Consistency model is split on purpose:** enquiries use strong consistency (majority write concern, synchronous ack — losing a lead is unacceptable); catalogue reads are eventually consistent via a 15-minute TTL cache (`products_cache` in MongoDB) in front of the Fake Store API.
- **Enquiry submission never blocks on email delivery.** The enquiry is persisted to MongoDB and the "thank you" response is sent back to the client before the email send is attempted; email result is tracked asynchronously via an `enquiries.status` field (`received` → `email_sent` | `email_failed`). Any change to this flow must preserve that ordering.
- **MongoDB collections:** `products_cache` (TTL index on `cachedAt`, index on `category.slug`), `featured_products`, `enquiries` (`productTitle` is a denormalised snapshot at submission time, not a live join).
- **Search is case-insensitive substring ("include") matching across title, category name, price, and rating** (`product-cache.repository.ts`'s `matchesSearchTerm`) — not exact match, not a Mongo text index. It runs in application code against the (category-scoped) candidate set after fetch, not as a Mongo query, since mixed string/numeric fields across those four properties aren't one efficient query and the catalogue is ~20 products.
- **API surface:** versioned REST under `/api/v1` — `GET /products`, `GET /products/featured`, `GET /products/:id`, `GET /categories`, `GET /categories/:slug/products`, `POST /enquiries`. Products returned to the client are always the normalised DTO (`id, title, description, price, currency, category, images, rating, source`), never Fake Store's raw shape.
- **Local dev must not require AWS or any paid account:** Fake Store API needs no credentials; email goes to a MailHog container (SMTP catcher with a web UI at `:8025`) instead of SES; config comes from `.env` seeded from `.env.example`, never real secrets committed.

Items marked `[GROWTH]` in `SYSTEM_DESIGN.md` (SQS retry queue, circuit-breaker library, Atlas Search, admin curation UI, Playwright E2E, IaC) are intentionally out of scope for the initial build — don't add them unprompted.
