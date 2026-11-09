# AI usage

## Tools and models

- **Claude Code** (CLI), model **Claude Sonnet 5** (`claude-sonnet-5`), for the entire exercise —
  planning, implementation, testing, and this documentation.
- **WebFetch** (a Claude Code tool), used once against the live Fake Store API
  (`https://fakestoreapi.com/products`) to pull the real product list before writing the curation
  seed file — ids, titles, categories, and ratings are real data, not invented examples.
- **TaskCreate/TaskUpdate** (Claude Code's task tracker), used to break the build into 11 tracked
  steps (scaffold → backend → seed → backend tests → frontend → frontend tests → Docker → docs →
  smoke test) and keep them honestly marked in-progress/complete rather than batching everything
  into one opaque pass.
- **Bash**, for `npm install`/`test`/`build`/`lint` in both packages and for building and running
  the full stack with `docker compose up --build` to verify it end to end, including a live check
  that a submitted enquiry actually arrived in MailHog.

## Agent instruction files

- [`CLAUDE.md`](./CLAUDE.md) — committed to the repo root. Written in a session before this one
  (via `/init`), when the repository had no code yet; deliberately didn't invent build/lint/test
  commands for code that didn't exist, and instead documented the architectural constraints
  (`ProductProvider`/`EmailProvider` as the swap points, the layering rules, the split consistency
  model) that the implementation in this session was then built against. Updated at the end of
  this session with the real `npm run dev/build/typecheck/lint/test` commands now that both
  packages exist, so it doesn't go stale for the next agent that opens this repo.

## Plan / spec

[`SYSTEM_DESIGN.md`](./SYSTEM_DESIGN.md) was written and reviewed *before* any code, in a prior
session, specifically so there would be a spec to build against rather than improvising
architecture while writing code. Nearly every structural decision in this repo traces back to a
specific section of it:

- the `ProductProvider`/`EmailProvider` interface boundary (§03/§04) → `backend/src/providers/`
- the MongoDB collections and their indexes (§06) → `backend/src/models/`
- the API surface (§05) → `backend/src/routes/` + `backend/src/controllers/`
- the enquiry-never-blocks-on-email ordering (§04/§08) → `EnquiryService.submit()`
- the fault-tolerance table (§09) → the cache-aside + circuit-breaker logic in `ProductService`
- the Docker Compose ↔ AWS service mapping (§10) → `docker-compose.yml` + both Dockerfiles

## Key prompts/moments that shaped the solution

1. *"...create documentation for this doc, to demo"* — the original ask that produced
   `SYSTEM_DESIGN.md`. Treating this as its own deliverable, written and reviewed before
   implementation started, is what kept the build from drifting into ad hoc architecture choices
   made mid-coding.
2. *"Instead of the link better to create some .md file... keep this .md file in this project
   root folder"* — redirected the design doc from a rendered artifact link into a versioned file
   in the repo. That's what let `CLAUDE.md` and this implementation session reference it directly
   by path instead of a URL that wouldn't survive into the Git history.
3. *"...whatever component name or filename or folder name you are giving should give business
   project vibes"* — drove naming throughout: `FeaturedCollection`, `EnquiryDialog`,
   `FakeStoreProvider`/`SmtpProvider`, the `Fieldstone Goods Co.` brand used in the header and
   footer, rather than generic placeholders like `Card1` or `Form`.
4. Fetching the *real* Fake Store API product list via WebFetch before writing the curation seed
   — rather than inventing plausible-looking ids and category names. That surfaced a real edge
   case (`"men's clothing"` → `mens-clothing`, apostrophe-and-space handling) early enough to give
   `slugify()` its own unit test instead of discovering it in a demo.
5. Deciding, mid-build, to verify with `docker compose up --build` and `curl` against every
   acceptance-criterion endpoint — including checking MailHog's own API for the delivered email —
   rather than trusting that passing unit tests meant the containerised stack also worked.

## Where the AI got something wrong, and how it was caught

- **TypeScript strictness gap.** `noUncheckedIndexedAccess` (turned on deliberately for safety)
  made `req.params.id`/`req.params.slug` and a destructured array element in
  `EnquiryRepository.create` type as possibly `undefined`, even though Express and the
  single-item array guarantee a value at runtime. Caught immediately by `npm run typecheck`
  failing; fixed with narrow, commented non-null assertions at exactly the two call sites where
  the guarantee actually holds.
- **Off-by-one in a circuit-breaker test.** The first version asserted that the *3rd* call to a
  breaker configured with `failureThreshold: 3` would short-circuit with "circuit open" — but the
  circuit only opens as a side effect *after* the 3rd failure, so that call still hits the (failing)
  server and throws the real upstream error. Caught by running `npm test` and reading the actual
  failure message; fixed by asserting a 4th call is the one that gets short-circuited.
- **A mocking library that wouldn't have worked.** The initial plan was to use `nock` to mock the
  Fake Store API in provider tests. `nock` patches Node's `http`/`https` modules, which Node 20's
  built-in `fetch` (undici) doesn't reliably route through — a known compatibility gap, not a bug
  in the test itself. Rather than ship tests that could pass or fail depending on Node/undici
  internals, this was caught during test design (not after a flaky failure) and replaced with a
  real local `http.createServer` per test — slower to write, but it tests the actual code path.
- **A dangling promise in a test.** An enquiry-service test released a mocked slow email send,
  waited a single `setImmediate` tick, and asserted — but the real Mongo status-update write
  needed more ticks than that, so it sometimes resolved *after* the test suite's `afterAll` had
  disconnected Mongo, logging `MongoNotConnectedError` after the suite reported done. Caught from
  Jest's own "Cannot log after tests are done" warning in the test output; fixed by making the
  service's retry delay an injectable constructor parameter (tests use milliseconds, production
  uses 2 seconds) and giving the affected test a real short wait instead of one microtask tick.

None of these were logic bugs that would have shipped unnoticed — each was caught by actually
running `typecheck`/`test`/`docker compose up` before calling a step done, which is the point of
running that loop rather than trusting generated code on the first pass.

## Time spent

Built in a single continuous AI-assisted session (planning done in an earlier session, producing
`SYSTEM_DESIGN.md`). Rough split of the work in *this* session:

| Phase | Share |
|---|---|
| Planning (translating `SYSTEM_DESIGN.md` into a concrete file/module plan, task breakdown) | ~10% |
| Building — backend (models, providers, repositories, services, routes, Docker) | ~35% |
| Building — frontend (components, pages, styling, Docker/nginx) | ~30% |
| Testing (writing + debugging backend and frontend test suites) | ~15% |
| Verification + docs (`docker compose up`, curl/MailHog smoke test, README/DECISIONS/this file) | ~10% |

This significantly exceeds the brief's 2–3 hour human time-box — the trade explicitly made here
was depth of scope (full backend + frontend + both test suites + Docker + docs, all working
end-to-end) in exchange for going over the box, which the brief says is acceptable as long as it's
disclosed.
