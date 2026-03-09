create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.point_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint point_sites_name_key unique (name)
);

create table if not exists public.purchase_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint purchase_sources_name_key unique (name)
);

create table if not exists public.sales_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sales_channels_name_key unique (name)
);

create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint carriers_name_key unique (name)
);

create table if not exists public.point_activities (
  id uuid primary key default gen_random_uuid(),
  activity_date date not null,
  point_site_id uuid not null references public.point_sites(id),
  title text not null,
  reward_amount numeric(12,2) not null default 0 check (reward_amount >= 0),
  is_completed boolean not null default false,
  completed_date date null,
  condition_note text null,
  inquiry_url text null,
  memo text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.resale_transactions (
  id uuid primary key default gen_random_uuid(),
  purchase_date date not null,
  item_name text not null,
  purchase_source_id uuid not null references public.purchase_sources(id),
  purchase_source_note text null,
  sales_channel_id uuid not null references public.sales_channels(id),
  sales_channel_note text null,
  purchase_amount numeric(12,2) not null default 0 check (purchase_amount >= 0),
  sale_amount numeric(12,2) null check (sale_amount is null or sale_amount >= 0),
  sale_date date null,
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  fee_amount numeric(12,2) not null default 0 check (fee_amount >= 0),
  other_expense numeric(12,2) not null default 0 check (other_expense >= 0),
  is_completed boolean not null default false,
  memo text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mobile_lines (
  id uuid primary key default gen_random_uuid(),
  contract_date date not null,
  line_type text not null check (line_type in ('campaign', 'normal')),
  carrier_id uuid not null references public.carriers(id),
  phone_number text not null,
  registered_email text null,
  management_id text null,
  title text not null,
  reward_amount numeric(12,2) null check (reward_amount is null or reward_amount >= 0),
  initial_cost numeric(12,2) not null default 0 check (initial_cost >= 0),
  cancellation_cost numeric(12,2) not null default 0 check (cancellation_cost >= 0),
  cancellation_date date null,
  completed_date date null,
  contract_status text not null default 'active' check (contract_status in ('active', 'cancelled')),
  device_name text null,
  return_due_date date null,
  returned_date date null,
  is_completed boolean not null default false,
  memo text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.mobile_line_monthly_costs (
  id uuid primary key default gen_random_uuid(),
  mobile_line_id uuid not null references public.mobile_lines(id) on delete cascade,
  start_date date not null,
  end_date date null,
  monthly_fee numeric(12,2) not null default 0 check (monthly_fee >= 0),
  memo text null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_point_activities_activity_date on public.point_activities(activity_date desc);
create index if not exists idx_point_activities_completed_date on public.point_activities(completed_date desc);
create index if not exists idx_resale_transactions_purchase_date on public.resale_transactions(purchase_date desc);
create index if not exists idx_resale_transactions_sale_date on public.resale_transactions(sale_date desc);
create index if not exists idx_mobile_lines_contract_date on public.mobile_lines(contract_date desc);
create index if not exists idx_mobile_lines_completed_date on public.mobile_lines(completed_date desc);
create index if not exists idx_mobile_line_monthly_costs_mobile_line_id on public.mobile_line_monthly_costs(mobile_line_id);

create or replace trigger point_sites_set_updated_at
before update on public.point_sites
for each row
execute function public.set_updated_at();

create or replace trigger purchase_sources_set_updated_at
before update on public.purchase_sources
for each row
execute function public.set_updated_at();

create or replace trigger sales_channels_set_updated_at
before update on public.sales_channels
for each row
execute function public.set_updated_at();

create or replace trigger carriers_set_updated_at
before update on public.carriers
for each row
execute function public.set_updated_at();

create or replace trigger point_activities_set_updated_at
before update on public.point_activities
for each row
execute function public.set_updated_at();

create or replace trigger resale_transactions_set_updated_at
before update on public.resale_transactions
for each row
execute function public.set_updated_at();

create or replace trigger mobile_lines_set_updated_at
before update on public.mobile_lines
for each row
execute function public.set_updated_at();

create or replace trigger mobile_line_monthly_costs_set_updated_at
before update on public.mobile_line_monthly_costs
for each row
execute function public.set_updated_at();

create or replace view public.resale_transactions_with_profit as
select
  rt.*,
  coalesce(rt.sale_amount, 0) - rt.purchase_amount - rt.shipping_fee - rt.fee_amount - rt.other_expense + rt.discount_amount as profit,
  coalesce(rt.sale_date, rt.purchase_date) as aggregation_date
from public.resale_transactions rt;

create or replace view public.mobile_lines_with_costs as
select
  ml.*,
  coalesce(costs.monthly_cost_total, 0::numeric) as monthly_cost_total,
  ml.initial_cost + ml.cancellation_cost + coalesce(costs.monthly_cost_total, 0::numeric) as total_cost,
  coalesce(ml.reward_amount, 0::numeric) - (ml.initial_cost + ml.cancellation_cost + coalesce(costs.monthly_cost_total, 0::numeric)) as profit,
  coalesce(ml.completed_date, ml.cancellation_date, ml.contract_date) as aggregation_date
from public.mobile_lines ml
left join (
  select mobile_line_id, sum(monthly_fee) as monthly_cost_total
  from public.mobile_line_monthly_costs
  group by mobile_line_id
) costs on costs.mobile_line_id = ml.id;