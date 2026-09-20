-- =============================================================================
-- 002_customer_anonymous_and_settings.sql
--
-- Run this ONLY if you already ran the original sql/schema.sql before this
-- update. If you're setting up Supabase fresh, just run the current
-- sql/schema.sql instead — it already includes everything below.
--
-- What this does:
--   1. Makes print_orders.user_id nullable and switches its FK from
--      ON DELETE RESTRICT to ON DELETE SET NULL — customers no longer need
--      an account to place an order.
--   2. Adds customer_name / customer_phone as optional, unauthenticated
--      stand-ins for identifying who an order belongs to.
--   3. Creates shop_settings, a single-row config table holding the shop's
--      UPI ID (used to build the "upi://pay?..." link on the payment page).
-- =============================================================================

alter table public.print_orders
  drop constraint if exists print_orders_user_id_fkey;

alter table public.print_orders
  alter column user_id drop not null;

alter table public.print_orders
  add constraint print_orders_user_id_fkey
    foreign key (user_id) references public.users (id) on delete set null;

alter table public.print_orders
  add column if not exists customer_name text;

alter table public.print_orders
  add column if not exists customer_phone text;

create table if not exists public.shop_settings (
  id              integer primary key default 1 check (id = 1),
  business_name   text not null default 'PrintEase',
  upi_id          text,
  updated_at      timestamptz not null default now()
);

insert into public.shop_settings (id, business_name, upi_id)
values (1, 'PrintEase', null)
on conflict (id) do nothing;

drop trigger if exists set_updated_at on public.shop_settings;
create trigger set_updated_at before update on public.shop_settings
  for each row execute function public.set_updated_at();

alter table public.shop_settings enable row level security;
-- No policies added — same "service role only" posture as every other
-- table in this schema; see the note at the bottom of schema.sql.
