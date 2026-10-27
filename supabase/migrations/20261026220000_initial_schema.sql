create extension if not exists pgcrypto;

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  company_name text not null,
  company_size text not null check (company_size in ('1-10', '11-50', '51-100', '101-150', '150+')),
  services text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (admin_id, id)
);

create unique index if not exists departments_admin_name_unique
  on public.departments (admin_id, lower(name));

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.admins(id) on delete cascade,
  department_id uuid not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  role text not null default 'Employé',
  risk_score integer not null default 50 check (risk_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (admin_id, department_id)
    references public.departments(admin_id, id)
    on delete restrict
);

create unique index if not exists employees_admin_email_unique
  on public.employees (admin_id, lower(email));

create index if not exists employees_admin_department_idx
  on public.employees (admin_id, department_id);

create table if not exists public.campaigns (
  id text not null,
  admin_id uuid not null references public.admins(id) on delete cascade,
  name text not null,
  status text not null check (status in ('brouillon', 'planifiée', 'en_cours', 'terminée')),
  targeted integer not null default 0 check (targeted >= 0),
  delivered integer not null default 0 check (delivered >= 0),
  opened integer not null default 0 check (opened >= 0),
  clicked integer not null default 0 check (clicked >= 0),
  reported integer not null default 0 check (reported >= 0),
  campaign_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (admin_id, id)
);

create index if not exists campaigns_admin_updated_idx
  on public.campaigns (admin_id, updated_at desc);

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  campaign_id text not null,
  event_type text not null check (event_type in ('delivered', 'opened', 'clicked', 'reported', 'training_completed')),
  participant_ref text,
  occurred_at timestamptz not null default now(),
  foreign key (admin_id, campaign_id)
    references public.campaigns(admin_id, id)
    on delete cascade
);

create index if not exists campaign_events_campaign_time_idx
  on public.campaign_events (admin_id, campaign_id, occurred_at desc);

create table if not exists public.training_modules (
  id text not null,
  admin_id uuid not null references public.admins(id) on delete cascade,
  title text not null,
  module_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (admin_id, id)
);

create table if not exists public.training_invitations (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  module_id text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (admin_id, module_id)
    references public.training_modules(admin_id, id)
    on delete cascade
);

create index if not exists training_invitations_admin_created_idx
  on public.training_invitations (admin_id, created_at desc);

alter table public.admins enable row level security;
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_events enable row level security;
alter table public.training_modules enable row level security;
alter table public.training_invitations enable row level security;

revoke all on public.admins, public.departments, public.employees,
  public.campaigns, public.campaign_events, public.training_modules,
  public.training_invitations
  from anon, authenticated;

grant all on public.admins, public.departments, public.employees,
  public.campaigns, public.campaign_events, public.training_modules,
  public.training_invitations
  to service_role;
