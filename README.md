# Fieldstone Goods Co. — Catalogue

A product catalogue proof of concept: customers browse, search, and submit enquiries; the sales
team gets them by email. Built so the product data source, look & feel, and email provider can
each be swapped later without a rewrite — see [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) for the
full architecture, and [`DECISIONS.md`](./DECISIONS.md) for assumptions and trade-offs.

**Stack:** React 18 + TypeScript (client) · Node.js + Express + TypeScript (API) · MongoDB ·
AWS-compatible, run locally with Docker Compose. Why this stack, and why MongoDB specifically,
is explained in [`SYSTEM_DESIGN.md` §02](./SYSTEM_DESIGN.md#02-tech-stack--rationale) and
[§06](./SYSTEM_DESIGN.md#06-data--database).

## Quick start

Requires Docker Desktop (or Colima) only — no Node install, no AWS account, no API keys.

```bash
docker compose up --build
```

Then open:

| | |
|---|---|
| **Storefront** | http://localhost:3000 |
| **API** | http://localhost:4000/api/v1 (health check at `/healthz`) |
| **Sales inbox (MailHog)** | http://localhost:8025 — enquiry emails land here instead of a real inbox |

That's the entire setup — one command, nothing to configure, nothing to sign up for. Mongo and
MailHog are plain unauthenticated local containers, and the Fake Store API is public, so there
are no secrets to provide even though `docker compose up` needs none.

To stop: `docker compose down` (add `-v` to also drop the Mongo volume and reseed from scratch
next time).

## Trying the five flows

1. **Home** — the 5 curated "top rated" products load immediately.
2. **Category** — click a category in the header; you'll see its curated picks plus the rest of
   that category's products.
3. **Search** — type a term in the header search box and press *Search*; only matching products
   are returned.
4. **Product detail** — click any product tile.
5. **Enquiry** — on a product page, click *Enquire*, fill in the form, submit. You'll see a
   "Thank you" message immediately, and the email will appear in MailHog
   (http://localhost:8025) within a couple of seconds.

## Running without Docker

Two terminals, against a MongoDB you already have running locally (or run
`docker compose up mongo mailhog` to just get those two dependencies):

```bash
# terminal 1 — API
cd backend
cp .env.example .env     # defaults already point at localhost:27017 / localhost:1025
npm install
npm run dev               # http://localhost:4000

# terminal 2 — client
cd frontend
npm install
npm run dev               # http://localhost:3000, proxies /api to localhost:4000
```

The frontend has no environment configuration of its own — every API call is a relative `/api/*`
request, proxied to the backend by Vite in dev and by nginx in the Docker image. There's nothing
to put in a `.env` file on the client side, which is why there's no `frontend/.env.example`.

## Tests

```bash
cd backend && npm test     # Jest — providers, services, and API integration tests
cd frontend && npm test    # Vitest — search, product navigation, enquiry form
```

Backend tests spin up an in-memory MongoDB (`mongodb-memory-server`) and a throwaway local HTTP
server standing in for the Fake Store API — no network access or running services required.

Other useful commands (both packages): `npm run typecheck`, `npm run lint`, `npm run build`.

## Project layout

```
backend/     Node/Express API — the only thing that talks to Fake Store API or sends email
  src/providers/     ProductProvider, EmailProvider — the two swap points
  src/services/      business rules (curation, search, the enquiry flow)
  src/repositories/  MongoDB access
  src/routes/        /api/v1 HTTP surface
  src/tests/         unit + integration tests

frontend/    React/TypeScript client — only ever calls our own backend
  src/api/           typed client for /api/v1
  src/components/    layout, catalogue, enquiry, feedback
  src/pages/         Home, Category, Product, Search, NotFound
  src/tests/         component tests for the critical path

docker-compose.yml   mongo + mailhog + backend + frontend, one command, no secrets
```

## Further reading

- [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) — HLD/LLD, API design, data model, scalability,
  consistency, fault tolerance, AWS deployment topology.
- [`DECISIONS.md`](./DECISIONS.md) — assumptions, what was cut and why, how this grows beyond a
  PoC, what's next.
- [`AI_USAGE.md`](./AI_USAGE.md) — how AI tools were used to plan and build this.
- [`CLAUDE.md`](./CLAUDE.md) — repo-specific guidance for AI coding agents working in this codebase.
