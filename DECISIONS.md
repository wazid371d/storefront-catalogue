# Decisions

Companion to [`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md), written against what actually got built.
Where the acceptance criteria in the brief left a gap, this is the call that was made, and why.

## Assumptions

- **"Top rated" is curated, not computed.** The brief says "I have chosen 5 products to be
  top rated" — that's an editorial decision, not a formula. Fake Store API's `rating.rate` is a
  different thing (customer rating) and isn't used to pick the featured five. Curation lives in
  its own MongoDB collection (`featured_products`: `productId`, `category`, `position`),
  completely separate from the product data itself, and is seeded from
  [`backend/src/seed/featured-products.seed.json`](./backend/src/seed/featured-products.seed.json)
  on every boot (idempotent upsert, safe to re-run).
- **Category "top rated" falls back when nothing's curated.** Three of the four categories have
  explicit curated picks in the seed file; if a category had none, the API falls back to the
  top-N products in that category by Fake Store's own `rating.average` (`ProductService
  .getCategoryPage`) rather than showing an empty "top rated" section.
- **Search is case-insensitive substring ("include") matching across title, category name,
  price, and rating** — not exact or tokenized matching, and not scoped to the product's own
  text alone. Fake Store API has no search endpoint of its own, so this is entirely the backend's
  own logic, filtering its cached catalogue in application code (mixed string/numeric fields
  aren't one efficient Mongo query, and the catalogue is ~20 products). The acceptance criterion
  ("only products that have text matching that search term") doesn't define which fields count
  as "text," so this was widened on request to match what a shopper would actually expect —
  typing a price or a rating should surface the product it describes.
- **"Sales inbox" is one address**, `SALES_INBOX_EMAIL`, not a ticketing system or per-category
  routing. Nothing in the brief implies more than one inbox.
- **No customer or admin accounts.** Nothing in the acceptance criteria requires either — curation
  is a seed file, and enquiries don't require the customer to be signed in.
- **Currency is fixed to USD**, matching Fake Store API's data; there's no conversion layer.
- **An enquiry must reference a real product.** `POST /enquiries` with an unknown `productId`
  returns `404`, not a silently-accepted orphan enquiry — the sales team should never see a lead
  for a product that doesn't exist in the catalogue.

## What was dropped or simplified, and why

| Full version (see `SYSTEM_DESIGN.md`) | What shipped instead | Why |
|---|---|---|
| Admin UI for curating "top rated" | A JSON seed file (`featured-products.seed.json`) loaded on boot | Curation is a data-layer concern either way — a UI doesn't change the architecture, it's pure screen-building time that the acceptance criteria don't ask for. |
| SQS + worker for retrying failed enquiry emails | A single in-process retry with a fixed delay (`EnquiryService`, configurable `retryDelayMs`) | Same observable behaviour (one retry, then `email_failed` for manual follow-up) without standing up a queue for a PoC that runs on one box. |
| A circuit-breaker library | A ~30-line failure-counter class (`utils/circuit-breaker.ts`) | The behaviour needed is narrow (open after N failures, cool down, allow a trial call) — a dependency wasn't worth it for that. |
| AWS infrastructure actually provisioned | The topology documented in `SYSTEM_DESIGN.md §10`, with every AWS service mapped to its local Docker Compose stand-in | The brief explicitly says the reviewer shouldn't need an AWS account; provisioning real infra would violate that constraint, not satisfy it. |
| End-to-end browser tests (Playwright) | Backend integration tests (supertest) + frontend component tests (Vitest/RTL) covering the same critical paths | Covers the same logic acceptance-criteria-by-acceptance-criteria without a browser-automation dependency in the time-box. |
| Pagination UI on category/search pages | The API paginates (`page`/`limit`, `total` in the response) but the client always requests `limit=20` and doesn't render page controls | Fake Store API's entire catalogue is 20 products — a human reviewer will never see a second page, so the UI for one wasn't worth building yet. The API contract is already in place for when the catalogue grows. |
| Rate limiting tuned for real traffic | A generous default (20 requests/minute per IP on `POST /enquiries`) | Enough to stop naive spam without needing real traffic data to tune against. |

## How this grows beyond a PoC

- **The data source swap is a single file.** `FakeStoreProvider` is the only class that knows
  Fake Store API exists (`backend/src/providers/product/fake-store.provider.ts`). A future PIM or
  proprietary catalogue is a new class implementing `ProductProvider`
  (`fetchAll(): Promise<Product[]>`) — nothing in `ProductService`, the controllers, or the
  frontend changes, because they only ever see the normalised `Product` DTO, never Fake Store's
  raw shape.
- **The email vendor swap is the same pattern.** `SmtpProvider` implements `EmailProvider`; moving
  from MailHog/Nodemailer to AWS SES in production is a new implementation of `send()`, selected
  by environment variables (`SMTP_HOST`/`SMTP_PORT`) — `EnquiryService` doesn't change.
  `docker-compose.yml` wires the dev stand-in; `SYSTEM_DESIGN.md §10` has the SES target.
- **The look and feel is isolated to `frontend/src/components` and `styles/global.css`.** The API
  contract (`frontend/src/api/types.ts`) is the only coupling between the client and the backend;
  a full redesign only ever touches the frontend package.
- **The enquiry's `status` field (`received → email_sent | email_failed`) is the seam for
  reliability work.** It already lets you see which enquiries never got emailed; growing from
  "retry once" to "durable SQS retry queue" is additive — the field doesn't change, only what
  writes to it.
- **Docker Compose and the AWS topology are intentionally parallel** (see the mapping table in
  `SYSTEM_DESIGN.md §10`) — moving to AWS is swapping infrastructure, not rewriting application
  code, because the app never talks to AWS services directly; it talks to `MONGODB_URI`,
  `SMTP_HOST`, etc., and those env vars are the only thing that changes between environments.

## What's next, with another day

1. Wire a real SQS (or equivalent) queue + worker for the email retry path, replacing the
   in-process retry.
2. Build the curation screen so "top rated" stops being a JSON file a developer has to edit.
3. Add Playwright E2E coverage across all five acceptance-criteria flows against the Docker
   Compose stack.
4. Add pagination controls to the category and search pages — the API already supports it.
5. Graduate search from an in-application substring scan to Atlas Search (or OpenSearch) once the
   catalogue outgrows "fetch the category, filter in memory" or relevance ranking/typo-tolerance
   starts to matter.
6. Write the AWS topology in `SYSTEM_DESIGN.md §10` as actual IaC (CDK or Terraform) instead of a
   diagram and a table.
