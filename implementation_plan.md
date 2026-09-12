# Nigraan (نگران) — Master Implementation Plan v2
### CWA Ship Karachi 2026 — Civic Intelligence Copilot
**Stack:** FastAPI (backend + agents) · React/Vite (frontend) · Supabase (Postgres + Realtime + Storage)
**Written for:** direct handoff to an agentic build tool (Antigravity) or a live 3-person build team.

---

## 0. How to run this plan through Antigravity

Feed this document to Antigravity **one phase at a time**, not all at once:

1. Paste the "0. How to run this plan" + "1–4" background sections once, so it has context.
2. Then paste **only** the current phase's section as the active task, plus the Database Schema section (§5) pinned as a standing reference — tell it explicitly: *"the schema in §5 is fixed source of truth, do not modify it without flagging first."*
3. After each phase, check its Deliverable checkbox yourself before handing over the next phase. Don't let the agent self-report "done" — open the running app and verify.
4. Keep the critique/revise loops (§7) as literal code (an explicit second LLM call that checks the first's output against a rule), not as a single prompt asking the model to "be careful." Antigravity will default to the latter unless told otherwise.
5. If Antigravity proposes a UI pattern from the "Avoid" list in §6, reject and re-paste §6 — style drift is the most common failure mode in agent-built frontends.

---

## 1. Unique selling point

1. **One architecture, many domains** — a single orchestrator + specialist-agent pattern. Civic issues, bill verification, and procedure guidance are three thin subgraphs off one router, not three separate apps.
2. **Verification before generation** — every domain re-derives the answer from a real table (tariff math, authority mandate, procedure source record) before drafting anything, instead of trusting the model's first guess.
3. **Individual outputs become public evidence** — one complaint or one flagged bill isn't the end state; it's a row on a live public dashboard. Personal utility becomes systemic pressure.
4. **Genuinely agentic** — a real router, conditional tool-use, and a critique/revise loop, visible as a live trace during the demo.
5. **Zero paid dependencies** — deployable and demoable entirely on free tiers, no paid maps, messaging, or data APIs, and every data source is publicly accessible online (required for an onsite build).

---

## 2. Architecture

```
Citizen (React SPA)
      │
      ▼
FastAPI /api/* ──────────────► Supabase (Postgres + Storage)
      │                              ▲
      ▼                              │ Realtime subscription
LangGraph Orchestrator                (frontend reads/writes
   (routes on state.mode)             directly via supabase-js
      │                               for dashboard + tracking)
      ├──► Civic issue agent    ──► verify(authority_mandates) ──► draft ──► critique ─┐
      ├──► Billing verify agent ──► verify(tariff_rules)       ──► draft ──► critique ─┤
      └──► Procedure guide agent──► retrieve(procedures)       ──► format ──► critique ─┤
                                                                                          ▼
                                                                         Public Dashboard (React)
```

**Key execution shortcut:** FastAPI owns all *writes that require agent logic* (drafting, verifying, critiquing). The React frontend talks to **Supabase directly** (via `supabase-js`) for plain reads, the dashboard views, and the Realtime tracking subscription — don't build a redundant FastAPI read-proxy for data that's already a public Postgres view. This alone saves a full phase of backend work.

---

## 3. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Backend | **FastAPI** (Python) | Agent orchestration lives here only |
| Agent framework | **LangGraph** | Orchestrator + 3 subgraphs |
| Frontend | **React + Vite** | Plain SPA — no SSR needed for a hackathon MVP; faster setup than Next.js |
| Routing | **React Router** | Intake / Dashboard / Tracking pages |
| Data fetching | **TanStack Query** | Wraps both FastAPI calls and supabase-js reads |
| Database | **Supabase (Postgres)** | Free tier; also gives Storage (photos) + Realtime for free |
| Maps | **React-Leaflet + OpenStreetMap** | No API key required |
| Charts | **Recharts** | Dashboard visualizations |
| LLM / vision | **Groq (free tier — text models + a vision-capable multimodal model), Google AI Studio (Gemini Flash, free tier, vision-capable), Qwen (Qwen3-32B free on Groq for text; Qwen-VL via Alibaba Cloud Model Studio's one-time free trial for vision)** | Use more than one — see "No dedicated OCR" note below the table |
| Dedup matching | **pg_trgm (Postgres extension, free)** | Fuzzy text match — skip pgvector unless time allows, trigram similarity is enough for MVP |
| Fonts | **Fraunces, IBM Plex Sans, IBM Plex Mono** (Google Fonts, free, self-hostable) | See §6 |

**No dedicated OCR.** Extraction from bill/issue photos runs through a single call to a vision-capable multimodal model — the model reads the image and returns structured JSON directly. There's no separate OCR library (Tesseract, cloud OCR APIs) in this stack; it would just be an extra moving part doing a job the vision model already does in one call. The one thing this removes is a safety net, so manual-entry fallback (already in Phases 2–3) matters more, not less. Free-tier rate limits are the real constraint on a demo day, not extraction quality — wire a fallback chain (e.g. try Groq's vision model first, fall back to Gemini Flash or Qwen-VL on a 429) rather than a single hard dependency. Model names and which provider's free tier is fastest/most generous shift often — confirm current options at `console.groq.com/docs/vision`, Google AI Studio, and Alibaba Cloud Model Studio during Phase 0, not from this document.

---

## 4. Use cases (recap)

- **Civic issue** — citizen reports a problem (garbage, potholes, water, electricity, streetlights), gets a correctly-addressed complaint drafted and tracked, duplicate reports become confirmations not noise.
- **Billing verify** — citizen uploads a utility bill, system recomputes the correct amount slab-by-slab from a real tariff table and shows exact math, flags overcharges with a ready complaint.
- **Procedure guide** — citizen looks up a civic procedure (e.g. CNIC renewal), gets a checklist that can only contain fields traceable to a sourced, dated record — never model-invented steps.

---

## 5. Database schema (Supabase / Postgres) — fixed source of truth

```sql
-- extensions
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ============ CURATED LOOKUP TABLES (Phase 0) ============

create table authority_mandates (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null,          -- 'garbage' | 'pothole' | 'water' | 'electricity' | 'streetlight' | 'sewage'
  area text not null,                -- e.g. 'Korangi', 'Clifton'
  authority_name text not null,
  contact_info text,
  complaint_template text,
  created_at timestamptz default now()
);

create table tariff_rules (
  id uuid primary key default gen_random_uuid(),
  provider text not null,            -- 'K-Electric' | 'SSGC'
  tariff_category text not null,
  slab_from numeric,
  slab_to numeric,
  rate_per_unit numeric,
  fixed_charge numeric,
  tax_formula text,                  -- plain description or simple expression
  effective_date date,
  created_at timestamptz default now()
);

create table procedures (
  id uuid primary key default gen_random_uuid(),
  name text not null,                -- 'CNIC Renewal'
  category text,
  description text,
  last_verified_at date not null,
  source_url text not null,          -- must be an official published source
  created_at timestamptz default now()
);

create table required_documents (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id),
  document_name text not null,
  notes text,
  is_mandatory boolean default true
);

create table authorities (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id),
  office_name text,
  address text,
  hours_text text,
  contact_info text,
  lat numeric,
  lng numeric
);

create table roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id),
  step_order int not null,
  description text not null,
  requires_witness boolean default false,
  estimated_duration text
);

-- ============ CITIZEN-GENERATED TABLES ============

create table reports (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  issue_type text,
  severity text,
  description text,
  photo_url text,
  lat numeric,
  lng numeric,
  area text,
  matched_authority_id uuid references authority_mandates(id),
  confirm_count int default 1,
  drafted_complaint text,
  status text default 'submitted',   -- submitted | drafted | sent | resolved_self_reported
  created_at timestamptz default now()
);
create index on reports using gist (lower(description) gist_trgm_ops);

create table bills (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique not null,
  provider text,
  tariff_category text,
  units_billed numeric,
  amount_billed numeric,
  amount_expected numeric,
  math_breakdown jsonb,
  verdict text,                      -- 'correct' | 'flagged'
  drafted_complaint text,
  photo_url text,
  created_at timestamptz default now()
);

create table exploitation_signals (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id),
  authority_id uuid references authorities(id),
  reported_amount numeric,
  note text,
  created_at timestamptz default now()
  -- intentionally has NO citizen identity field — aggregate-only by design, see §9 risk note
);

create table status_log (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,        -- 'reports' | 'bills'
  source_id uuid not null,
  old_status text,
  new_status text,
  changed_at timestamptz default now()
);
```

Enable **Realtime** on `reports` and `bills` in the Supabase dashboard (toggle per table, no code needed) — this is what powers the tracking page and the live dashboard update during the demo.

---

## 6. Frontend visual identity — "Public Ledger" direction

**Brief constraint:** professional and beautiful, explicitly *not* glassmorphism, and not the generic vibe-coded SaaS look.

**Grounding.** This product's whole pitch is trustworthy verification. The visual language should read like things that already carry institutional credibility here — a gazette register, a tariff table, a revenue stamp, an official letterhead — made clean and modern, not skeuomorphic pastiche. Call this the **Public Ledger** direction.

### Color
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#14213D` | Headlines, primary text — stamped-ink navy, not pure black |
| `--paper` | `#F6F5F0` | Background — cool paper white, not cream |
| `--verified` | `#2F6F4E` | Verified/confirmed states only |
| `--flag` | `#A6432B` | Flagged/overcharge/alert states only |
| `--line` | `#CFCABC` | Hairline rules and borders — replaces drop shadows entirely |
| `--muted` | `#5B6570` | Secondary text |

### Type
- **Headlines — Fraunces.** A serif with real weight and character, used for report titles, dashboard headline stats, section titles. Gives the civic mission gravity without reaching for the overused cream+terracotta serif pairing.
- **Body & UI — IBM Plex Sans.** Form labels, buttons, running copy. Functional, unglamorous, legible at small sizes.
- **Data & numerals — IBM Plex Mono, tabular figures.** Used *only* where exact column alignment actually matters: tracking IDs, bill amounts, the verification math breakdown. This is a functional choice, not a decorative "mono label" tell — the whole pitch is "math shown, not hand-waved," so the numbers need to visibly line up.

### Layout
Left-aligned throughout — a document/register feel, not a centered marketing-hero feel. Dashboard rows behave like entries in a public register: a hairline rule between rows, no card shadows, no rounded pill badges. Border radius stays small (2–4px) everywhere, evoking print rather than app-shell chrome.

```
──────────────────────────────────────────────────
KOR-0042    Solid waste · Korangi        ⊙ 4 confirmed
Reported 3 days ago · Site Municipal Committee   [open]
──────────────────────────────────────────────────
```

The one deliberate bold element in the whole system: a **stamp mark** — a small rotated (≈‑6°) circular mark in `--verified` ink — applied only to claims actually checked against a table (a sourced procedure, a matched authority, a recomputed bill). Nowhere else gets this treatment, so it stays meaningful instead of decorative.

### Principles specific to this brief
1. The stamp is earned, not decorative — it appears only where something was actually verified against a table.
2. Numbers are functional, never decorative — tabular mono only where alignment matters.
3. One motion moment only: when a tracked report's status changes via Realtime, that row does a single quiet highlight-and-settle. Nothing animates on page load.
4. No numbered 01/02/03 markers unless the content is a genuine sequence (procedure steps, roadmap — those qualify; feature lists do not).

### Explicit avoid-list
- No glassmorphism / frosted-blur panels.
- No cream-background-plus-terracotta-accent palette, no near-black-plus-neon-accent palette.
- No identical rounded SaaS cards with soft grey shadows, no gradient washes as decoration.
- No tracked-out ALL-CAPS eyebrow labels, no middle-dot-joined meta strings ("A · B · C"), no spaced-em-dash labels, no "→" suffix on buttons.
- No single-word bold/italic/color accent inside a headline.

---

## 7. Phase-wise plan

### Phase 0 — Setup & data curation (~2h)
- [ ] `authority_mandates` table populated (issue types × Karachi areas you'll demo)
- [ ] `tariff_rules` table populated (K-Electric and/or SSGC published slab structure)
- [ ] `procedures` + `required_documents` + `authorities` + `roadmap_steps` populated for **2–3 procedures** (e.g. CNIC renewal, domicile certificate) sourced from official published pages — record `source_url` and `last_verified_at` for every row
- [ ] Supabase project created, schema from §5 applied, Realtime enabled on `reports` and `bills`
- [ ] Repo scaffolding: FastAPI backend (`/backend`), Vite React frontend (`/frontend`)
- [ ] Confirm which vision-capable model(s) you'll call directly for extraction (no OCR library) — Groq's free-tier vision model, Gemini Flash vision, and/or Qwen-VL via Alibaba's trial tokens — and get free-tier keys for at least two, so a rate-limit hit mid-demo has a fallback

**Deliverable:** schema live in Supabase, lookup tables populated with sourced data, empty app skeleton running locally on both ends.

### Phase 1 — Core skeleton: orchestrator + intake (~1.5h)
- [ ] React intake page: three mode buttons (Report an Issue / Check My Bill / Find a Procedure), photo upload, text field, Leaflet map picker
- [ ] FastAPI `POST /api/reports` and `POST /api/bills`: write initial row to Supabase, return `tracking_id` immediately (before any agent work runs)
- [ ] LangGraph orchestrator: reads `mode` (set deterministically by the button, no LLM call needed here), routes to the correct subgraph

**Deliverable:** submitting either form creates a row in Supabase and returns a tracking ID.

### Phase 2 — Civic issue agent (~2h)
- [ ] Extract & classify node: photo + text → `issue_type`, `severity`
- [ ] Verify node: lookup `issue_type` + `area` in `authority_mandates`; fallback path if area not covered
- [ ] Dedup check: `pg_trgm` similarity match against open reports in the same area — a match increments `confirm_count` instead of creating a duplicate
- [ ] Draft node: formatted complaint (Urdu/English)
- [ ] Critique node (explicit second LLM call, not a hope): checks correct authority named, complete text, appropriate tone — bounce to draft, max 1–2 retries
- [ ] Write final complaint + authority + `status = drafted`

**Deliverable:** submitting a civic report returns a correctly routed, formatted complaint end-to-end.

### Phase 3 — Billing verify agent (~1.5h)
- [ ] Extract node: single multimodal-model call (Groq / Gemini / Qwen-VL, with a fallback provider on rate-limit) reads the bill photo and returns structured JSON — `units`, `tariff_category`, `amount_billed` — no separate OCR library; manual entry as fallback for low-confidence reads
- [ ] Verify node: recompute expected bill from `tariff_rules` — **deterministic Python function, never LLM arithmetic**
- [ ] Decision: within tolerance → `correct`; over tolerance → `flagged` with `math_breakdown` (jsonb, itemized)
- [ ] Draft node (flagged only): plain-language explanation + complaint template
- [ ] Critique node: confirm the math breakdown is actually populated, not asserted in prose
- [ ] Write verdict + breakdown

**Deliverable:** submitting a bill returns a verified verdict with visible math, and a drafted complaint if flagged.

### Phase 4 — Procedure guide agent (~1h) — *cut first if time runs short*
- [ ] Retrieve node: match query (dropdown or free text) against `procedures`
- [ ] Constraint gate: no match → explicit "not covered yet," never let the model invent a checklist
- [ ] Format node: LLM rephrases only fields present in the matched row + its `required_documents`/`authorities`/`roadmap_steps`
- [ ] Critique node: diff output against the source rows — anything not traceable gets stripped and regenerated
- [ ] Render checklist with the stamp mark, "verified as of [date]," and `source_url`
- [ ] Optional: one-tap exploitation-signal flag writing to `exploitation_signals` (aggregate only, see §9)

**Deliverable:** looking up a procedure returns a sourced, dated checklist that never contains an invented requirement.

### Phase 5 — Dashboard (~1.5h)
- [ ] Supabase SQL views: open-report count per authority, avg days unresolved, top issue types by area; flagged-discrepancy count and avg overcharge % by provider; exploitation-signal counts by area (aggregate only)
- [ ] React dashboard page (reads Supabase directly via `supabase-js`): register-style leaderboard (civic) + Recharts bar chart (billing)
- [ ] Tracking page: Supabase Realtime subscription so a citizen watches their own report's status update live

**Deliverable:** a live public page that updates as new reports/bills come in.

### Phase 6 — Integration, testing, polish (~1h)
- [ ] End-to-end test: submit 3–5 varied civic reports and bills, confirm correct routing/verdicts
- [ ] Self-reported "mark resolved" action on the tracking page — disclose clearly that it's self-reported, not authority-confirmed
- [ ] Apply the visual identity from §6 across all three flows
- [ ] Seed the dashboard with a handful of demo entries — label them as seed/demo data if a judge asks

**Deliverable:** stable, demo-ready app.

### Phase 7 — Demo prep & pitch (~1h)
- [ ] Script the live demo: one civic report + one flagged bill + one procedure lookup, dashboard updating in real time
- [ ] Pull up the LangGraph trace view to show the routing decision, verify step, and a critique/retry actually firing
- [ ] One slide: the USP (architecture over app, verification before generation, individual → public evidence)
- [ ] Rehearse the honest answer to "how many real users" and "how was this data verified" — see §9

**Deliverable:** a tight 3–5 minute demo + pitch.

---

## 8. FastAPI endpoint summary

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/reports` | Create civic report, kick off orchestrator, return `tracking_id` |
| POST | `/api/bills` | Create bill submission, kick off orchestrator, return `tracking_id` |
| POST | `/api/reports/{tracking_id}/mark-resolved` | Self-reported resolution |
| POST | `/api/exploitation-signal` | Write an aggregate-only signal |

Everything else (procedure lookups, dashboard views, tracking subscriptions) is read directly from Supabase by the frontend — no FastAPI route needed.

---

## 9. Cut list & honesty notes

**If time runs short, cut in this order:**
1. Procedure guide agent (Phase 4) entirely — the civic + billing agents are the proven core.
2. Billing photo extraction — drop the vision-model call, accept manual entry only.
3. Dedup matching — treat every report as new.
4. Dashboard chart — ship the leaderboard as a plain ranked list.
5. **Never cut:** the critique/revise loop and the orchestrator routing — cheapest pieces to keep, and what makes this agentic rather than a wrapper.

**Be ready for these honest answers, not deflections:**
- *"How many real users?"* — Zero on day one; the dashboard demonstrates the mechanism, seeded with labeled demo data.
- *"How was the procedure data verified?"* — Sourced from official published pages, with `source_url` and `last_verified_at` on every record — not field-verified by a human visit (that's CitizenBridge's slower, more rigorous model; this is the hackathon-speed version of the same idea).
- *"Isn't the exploitation-signal table a corruption accusation?"* — No individual complaint is drafted from it, no citizen identity is stored, and it's surfaced only as an aggregate count by area/office — a signal, not an allegation.

---

## 10. Role split (3-person team)

| Role | Owns |
|---|---|
| Backend/agents | FastAPI + LangGraph nodes (Phases 1–4) |
| Frontend | React intake, dashboard, tracking page + visual identity (Phases 1, 5, 6) |
| Data + demo | Lookup table curation (Phase 0), testing, pitch script (Phases 6–7) |

---

## 11. Definition of done

- [ ] A citizen can submit a civic report and receive a correctly routed, formatted complaint.
- [ ] A citizen can submit a bill and receive a verified verdict with visible math.
- [ ] A citizen can look up at least 2 procedures and receive a sourced, dated checklist (or this is cleanly cut per §9).
- [ ] A public dashboard reflects all of the above, live.
- [ ] The agent trace is visible and demonstrably multi-step.
- [ ] Nothing in the stack requires a paid subscription; every data source is a public online source.
