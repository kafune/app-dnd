-- Schema do app-dnd
-- Rode esse SQL no SQL Editor do Supabase depois de criar o projeto.

create table if not exists characters (
  id text primary key,
  player_name text not null,
  character_name text not null,
  pin text,
  color text,
  sheet jsonb not null,
  hp_current int not null,
  hp_max int not null,
  hp_temp int not null default 0,
  spell_slots jsonb not null default '{}'::jsonb,
  resources jsonb not null default '[]'::jsonb,
  notes text default '',
  updated_at timestamptz default now()
);

create table if not exists dice_rolls (
  id uuid primary key default gen_random_uuid(),
  character_id text references characters(id) on delete cascade,
  character_name text,
  label text,
  expression text,
  result int,
  detail jsonb,
  created_at timestamptz default now()
);

-- Habilita Realtime
alter publication supabase_realtime add table characters;
alter publication supabase_realtime add table dice_rolls;

-- Policies abertas para o MVP (mesa pequena de amigos).
-- Em produção real, restrinja com auth.
alter table characters enable row level security;
alter table dice_rolls enable row level security;

drop policy if exists "characters_all" on characters;
create policy "characters_all" on characters for all using (true) with check (true);

drop policy if exists "dice_rolls_all" on dice_rolls;
create policy "dice_rolls_all" on dice_rolls for all using (true) with check (true);

-- Limpa rolagens antigas (>7 dias) periodicamente — opcional, rode manual ou cron.
-- delete from dice_rolls where created_at < now() - interval '7 days';
