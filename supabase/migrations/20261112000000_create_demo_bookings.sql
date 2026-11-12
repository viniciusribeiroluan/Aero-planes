create table if not exists public.reservas_demo (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    offer_id text not null,
    origin_code text not null check (origin_code ~ '^[A-Z]{3}$'),
    destination_code text not null check (destination_code ~ '^[A-Z]{3}$'),
    departure_date date not null,
    price numeric(12, 2) not null check (price >= 0),
    currency text not null check (currency ~ '^[A-Z]{3}$'),
    payment_method text not null check (payment_method in ('pix-demo', 'cartao-demo')),
    created_at timestamptz not null default now()
);

create index if not exists reservas_demo_user_created_at_idx
    on public.reservas_demo (user_id, created_at desc);

alter table public.reservas_demo enable row level security;

create policy "Users can view their own demo bookings"
    on public.reservas_demo
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

create policy "Users can create their own demo bookings"
    on public.reservas_demo
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);
