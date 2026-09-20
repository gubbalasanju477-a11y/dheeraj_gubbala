-- =============================================================================
-- Automated Printing — Postgres schema for Supabase
--
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste this whole file → Run).
--
-- Replaces the old MongoDB/Mongoose models. Column names are snake_case
-- (Postgres convention); the Express controllers map them back to the
-- same camelCase JSON shape the frontend already expects.
-- =============================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null unique,
  password      text not null, -- bcrypt hash, set by the Express backend — never plaintext
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists users_email_idx on public.users (lower(email));

-- -----------------------------------------------------------------------------
-- printers
-- -----------------------------------------------------------------------------
create table if not exists public.printers (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  location                text,
  status                  text not null default 'offline' check (status in ('online', 'offline', 'busy')),
  supported_paper_sizes   text[] not null default array['A4'],
  supported_color_modes   text[] not null default array['black-white'],
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- print_orders
-- -----------------------------------------------------------------------------
create table if not exists public.print_orders (
  id                uuid primary key default gen_random_uuid(),
  -- Nullable: customers no longer need an account to print. When absent,
  -- this is an anonymous walk-up order — see customer_name/customer_phone
  -- below for the shop's own reference instead of a real user record.
  user_id           uuid references public.users (id) on delete set null,
  customer_name     text,
  customer_phone    text,
  file              text not null, -- filename returned by POST /api/upload
  printer_id        uuid not null references public.printers (id) on delete restrict,
  pages             integer not null check (pages > 0),
  copies            integer not null default 1 check (copies > 0),
  color_mode        text not null check (color_mode in ('black-white', 'color')),
  paper_size        text not null check (paper_size in ('A4', 'A3', 'Letter')),
  price             numeric(10, 2) not null check (price >= 0), -- always computed server-side
  status            text not null default 'pending'
                      check (status in ('pending', 'paid', 'printing', 'completed', 'cancelled', 'failed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists print_orders_user_id_idx on public.print_orders (user_id);
create index if not exists print_orders_printer_id_idx on public.print_orders (printer_id);
create index if not exists print_orders_status_idx on public.print_orders (status);
create index if not exists print_orders_created_at_idx on public.print_orders (created_at desc);

-- -----------------------------------------------------------------------------
-- shop_settings
-- Singleton config row (id is always 1 — the check constraint plus primary
-- key guarantees there can only ever be one). Holds the UPI ID the
-- payment page builds its "upi://pay?..." deep link from.
-- -----------------------------------------------------------------------------
create table if not exists public.shop_settings (
  id              integer primary key default 1 check (id = 1),
  business_name   text not null default 'PrintEase',
  upi_id          text, -- e.g. "shopname@okhdfcbank" — null until the owner sets it
  updated_at      timestamptz not null default now()
);

insert into public.shop_settings (id, business_name, upi_id)
values (1, 'PrintEase', null)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- updated_at auto-maintenance
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.users;
create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.printers;
create trigger set_updated_at before update on public.printers
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.print_orders;
create trigger set_updated_at before update on public.print_orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.shop_settings;
create trigger set_updated_at before update on public.shop_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
--
-- The Express backend talks to Postgres using the SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS entirely — so these policies do NOT enforce anything
-- for the backend itself; all authorization (who can see/cancel which
-- order, who can hit admin routes) continues to happen in Express, exactly
-- as before. This is enabled purely as a safety net: if the anon/public
-- key is ever used directly from a browser or any other client, these
-- tables default to fully locked down rather than fully open.
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.printers enable row level security;
alter table public.print_orders enable row level security;
alter table public.shop_settings enable row level security;

-- No policies are created, which means: zero access via the anon key.
-- Only the service role (used exclusively by this Express backend) can
-- read or write these tables.
