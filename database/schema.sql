-- ============================================================================
-- Nigraan (نگران) — Civic Intelligence Copilot (CWA Ship Karachi 2026)
-- §5 Database Schema (Supabase / Postgres) — Fixed Source of Truth
-- ============================================================================

-- extensions
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ============ CURATED LOOKUP TABLES (Phase 0) ============

create table if not exists authority_mandates (
  id uuid primary key default gen_random_uuid(),
  issue_type text not null,          -- 'garbage' | 'pothole' | 'water' | 'electricity' | 'streetlight' | 'sewage'
  area text not null,                -- e.g. 'Korangi', 'Clifton'
  authority_name text not null,
  contact_info text,
  complaint_template text,
  created_at timestamptz default now()
);

create table if not exists tariff_rules (
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

create table if not exists procedures (
  id uuid primary key default gen_random_uuid(),
  name text not null,                -- 'CNIC Renewal'
  category text,
  description text,
  last_verified_at date not null,
  source_url text not null,          -- must be an official published source
  created_at timestamptz default now()
);

create table if not exists required_documents (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id) on delete cascade,
  document_name text not null,
  notes text,
  is_mandatory boolean default true
);

create table if not exists authorities (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id) on delete cascade,
  office_name text,
  address text,
  hours_text text,
  contact_info text,
  lat numeric,
  lng numeric
);

create table if not exists roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id) on delete cascade,
  step_order int not null,
  description text not null,
  requires_witness boolean default false,
  estimated_duration text
);

-- ============ CITIZEN-GENERATED TABLES ============

create table if not exists reports (
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

create index if not exists reports_desc_trgm_idx on reports using gist (lower(description) gist_trgm_ops);

create table if not exists bills (
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

create table if not exists exploitation_signals (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid references procedures(id) on delete cascade,
  authority_id uuid references authorities(id) on delete set null,
  reported_amount numeric,
  note text,
  created_at timestamptz default now()
  -- intentionally has NO citizen identity field — aggregate-only by design, see §9 risk note
);

create table if not exists status_log (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,        -- 'reports' | 'bills'
  source_id uuid not null,
  old_status text,
  new_status text,
  changed_at timestamptz default now()
);

-- Realtime Publication Enablement (for Supabase replication)
alter publication supabase_realtime add table reports;
alter publication supabase_realtime add table bills;
