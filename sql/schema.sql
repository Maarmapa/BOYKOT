-- Boykot — Supabase schema
-- Tables: users, carts, stock_reservations, abandoned_cart_emails, bsale_webhook_events
--
-- Conventions:
--   - timestamps are timestamptz (UTC)
--   - BSale IDs (variant_id, product_id, client_id) are integers
--   - cart items live in jsonb on carts.items so we can ship without joins
--   - all RLS policies assume Supabase Auth (auth.uid())
--
-- Apply via: psql $SUPABASE_DB_URL -f sql/schema.sql
-- Or paste into Supabase SQL editor.

create extension if not exists "pgcrypto";

-- =========================================================================
-- USERS
-- =========================================================================

create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  full_name       text,
  phone           text,
  rut             text unique,
  is_b2b          boolean not null default false,
  bsale_client_id integer,
  price_list_id   integer not null default 19,  -- 19 = "Lista de Precios Base"
  shipping_address jsonb,
  marketing_consent boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists users_rut_idx on public.users(rut) where rut is not null;
create index if not exists users_bsale_client_idx on public.users(bsale_client_id) where bsale_client_id is not null;

-- =========================================================================
-- CARTS
-- =========================================================================
-- One active cart per (user_id) OR per (session_id) for anonymous visitors.
-- Items live in jsonb to avoid a join on every render:
--   [{ variant_id: int, product_id: int, qty: int, unit_price_clp: int,
--      name: text, image_url: text, color_code: text? }]

create table if not exists public.carts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.users(id) on delete set null,
  session_id        text,
  status            text not null default 'active'
                      check (status in ('active', 'abandoned', 'converted', 'expired')),
  items             jsonb not null default '[]'::jsonb,
  subtotal_clp      integer not null default 0,
  shipping_clp      integer not null default 0,
  total_clp         integer not null default 0,
  currency          text not null default 'CLP',
  email             text,
  customer_name     text,
  customer_phone    text,
  last_activity_at  timestamptz not null default now(),
  abandoned_at      timestamptz,
  converted_at      timestamptz,
  bsale_document_id integer,                                  -- set when checkout succeeds
  created_at        timestamptz not null default now(),
  constraint carts_user_or_session check (user_id is not null or session_id is not null)
);

create index if not exists carts_status_activity_idx
  on public.carts(status, last_activity_at);
create unique index if not exists carts_one_active_per_user
  on public.carts(user_id) where status = 'active' and user_id is not null;
create unique index if not exists carts_one_active_per_session
  on public.carts(session_id) where status = 'active' and session_id is not null;

-- =========================================================================
-- STOCK RESERVATIONS  (soft holds; do NOT touch BSale)
-- =========================================================================
-- When a user adds to cart, we insert a row with expires_at = now() + 15min.
-- "Available" stock to render is: BSale.stock - sum(active reservations).
-- Reservations are cleaned by the abandoned-carts cron and on cart conversion.

create table if not exists public.stock_reservations (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  variant_id  integer not null,
  quantity    integer not null check (quantity > 0),
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists reservations_variant_active_idx
  on public.stock_reservations(variant_id) where expires_at > now();
create index if not exists reservations_cart_idx
  on public.stock_reservations(cart_id);
create index if not exists reservations_expires_idx
  on public.stock_reservations(expires_at);

-- Helper: total reserved quantity per variant (live).
create or replace view public.reserved_stock as
  select variant_id, coalesce(sum(quantity), 0)::int as reserved
  from public.stock_reservations
  where expires_at > now()
  group by variant_id;

-- =========================================================================
-- ABANDONED CART EMAIL TRACKING
-- =========================================================================
-- Sent by the cron job; one row per (cart, email_type).

create table if not exists public.abandoned_cart_emails (
  id          uuid primary key default gen_random_uuid(),
  cart_id     uuid not null references public.carts(id) on delete cascade,
  email_type  text not null check (email_type in ('1h', '24h', '72h')),
  sent_at     timestamptz not null default now(),
  opened_at   timestamptz,
  clicked_at  timestamptz,
  resend_id   text,
  unique(cart_id, email_type)
);

create index if not exists abandoned_emails_cart_idx
  on public.abandoned_cart_emails(cart_id);

-- =========================================================================
-- BSALE WEBHOOK EVENTS  (audit log + idempotency)
-- =========================================================================
-- BSale POSTs a payload per change: { cpnID, resource, resourceID, Topic, action, send }.
-- Topics: documents | products | variants | stock | prices

create table if not exists public.bsale_webhook_events (
  id            uuid primary key default gen_random_uuid(),
  cpn_id        integer,
  topic         text not null,
  action        text not null,
  resource      text,
  resource_id   integer,
  payload       jsonb,
  sent_at       timestamptz,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  error         text
);

create index if not exists bsale_events_topic_idx
  on public.bsale_webhook_events(topic, received_at desc);
create index if not exists bsale_events_resource_idx
  on public.bsale_webhook_events(resource, resource_id);
create unique index if not exists bsale_events_idempotency
  on public.bsale_webhook_events(topic, action, resource_id, sent_at)
  where sent_at is not null;

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.users                  enable row level security;
alter table public.carts                  enable row level security;
alter table public.stock_reservations     enable row level security;
alter table public.abandoned_cart_emails  enable row level security;
alter table public.bsale_webhook_events   enable row level security;

-- Users can read & update their own row.
create policy "users self select" on public.users
  for select using (auth.uid() = id);
create policy "users self update" on public.users
  for update using (auth.uid() = id);

-- Carts: users see their own; anonymous carts are accessed via service role.
create policy "carts self select" on public.carts
  for select using (auth.uid() = user_id);
create policy "carts self update" on public.carts
  for update using (auth.uid() = user_id);

-- Reservations & abandoned emails: only service role (server-side only).
-- BSale webhook events: service role only.
-- (No public policies = blocked for anon/authenticated clients.)

-- =========================================================================
-- TRIGGERS
-- =========================================================================

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_touch on public.users;
create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();

create or replace function public.touch_cart_activity() returns trigger as $$
begin
  if new.items is distinct from old.items then
    new.last_activity_at := now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists carts_touch on public.carts;
create trigger carts_touch before update on public.carts
  for each row execute function public.touch_cart_activity();
