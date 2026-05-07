create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text unique not null,
  wallet text,
  x_user_id text,
  x_username text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists tokens (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  mint text unique not null,
  symbol text,
  name text,
  creator_wallet text,
  admin_wallet text,
  creator_provider text,
  creator_username text,
  last_holder_sync_at timestamptz,
  last_social_sync_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists holders (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references tokens(id) on delete cascade,
  wallet text not null,
  token_account text,
  raw_balance numeric not null default 0,
  ui_balance numeric not null default 0,
  balance_rank int,
  balance_percent numeric,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  last_buy_at timestamptz,
  last_sell_at timestamptz,
  buy_count int default 0,
  sell_count int default 0,
  total_bought numeric default 0,
  total_sold numeric default 0,
  unique(token_id, wallet)
);

create table if not exists social_identities (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  provider text not null,
  username text not null,
  display_name text,
  avatar_url text,
  source text not null default 'bags',
  last_checked_at timestamptz default now(),
  unique(provider, username),
  unique(provider, wallet)
);

create table if not exists true_fan_scores (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references tokens(id) on delete cascade,
  wallet text not null,
  score int not null,
  amount_score int not null,
  duration_score int not null,
  loyalty_score int not null,
  social_score int not null,
  activity_score int not null,
  explanation jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  unique(token_id, wallet)
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references tokens(id) on delete cascade,
  wallet text not null,
  badge_type text not null,
  label text not null,
  metadata jsonb not null default '{}'::jsonb,
  earned_at timestamptz default now(),
  unique(token_id, wallet, badge_type)
);

create table if not exists holder_events (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references tokens(id) on delete cascade,
  wallet text not null,
  signature text not null,
  event_type text not null,
  delta_amount numeric not null default 0,
  slot bigint,
  event_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  unique(signature, wallet, event_type)
);

create table if not exists activations (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references tokens(id) on delete cascade,
  creator_id uuid references creators(id) on delete cascade,
  activation_type text not null,
  status text not null default 'draft',
  target_count int not null,
  target_wallets jsonb not null,
  claimers_array jsonb not null,
  basis_points_array jsonb not null,
  bags_transactions jsonb,
  signed_signatures jsonb,
  previous_config jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);
