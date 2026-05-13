-- =============================================
-- Схема базы данных для системы управления локерами
-- Выполнить в Supabase SQL Editor
-- =============================================

-- Таблица локеров (основная)
create table if not exists public.lockers (
  id           uuid primary key default gen_random_uuid(),
  locker_number integer not null unique,
  owner_name   text,
  status       text not null default 'available' check (status in ('available', 'occupied')),
  updated_at   timestamptz not null default now()
);

-- Таблица администраторов (вайтлист email-адресов)
create table if not exists public.admins (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- Автоматически обновляем updated_at при каждом изменении записи локера
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_lockers_updated_at on public.lockers;
create trigger set_lockers_updated_at
  before update on public.lockers
  for each row execute function public.handle_updated_at();

-- RLS: включаем Row Level Security (доступ только через service-role ключ)
alter table public.lockers enable row level security;
alter table public.admins  enable row level security;

-- Политика: service-role обходит RLS автоматически,
-- поэтому дополнительных политик для серверного кода не нужно.
-- Если нужен прямой публичный доступ — добавьте явную политику.

-- =============================================
-- Начальные тестовые данные
-- =============================================
insert into public.lockers (locker_number, owner_name, status)
values
  (101, null,          'available'),
  (102, 'Alex Johnson','occupied'),
  (103, null,          'available'),
  (104, 'Maria Garcia','occupied'),
  (105, null,          'available'),
  (106, 'David Kim',   'occupied'),
  (107, null,          'available'),
  (108, 'Sarah Lee',   'occupied'),
  (109, null,          'available'),
  (110, null,          'available')
on conflict (locker_number) do nothing;
