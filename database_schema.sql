-- EXTENSIONES
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- Para full-text search

-- MARCAS
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null unique,
  accent_color varchar(7) default '#888888',
  logo_url text,
  created_at timestamptz default now()
);

-- CATEGORÍAS
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null unique,
  created_at timestamptz default now()
);

-- PRODUCTOS / CATÁLOGO
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  model varchar(100) not null unique,
  max_pixel_capacity bigint,
  max_width_limit integer,
  max_height_limit integer,
  rack_units integer not null default 1,
  power_consumption_watts integer not null default 0,
  software_compatibility varchar(100),
  datasheet_url text,
  technical_specs jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- PUERTOS POR PRODUCTO
create table public.product_ports (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  port_type varchar(50) not null,
  direction varchar(10) not null check (direction in ('INPUT','OUTPUT')),
  quantity integer not null default 1,
  max_res_width integer,
  max_res_height integer,
  hz_support integer default 60,
  bandwidth_gbps numeric(4,1)
);

-- PERFILES DE USUARIO
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role varchar(20) not null default 'TÉCNICO_JUNIOR'
    check (role in ('TÉCNICO_JUNIOR','TÉCNICO_SENIOR','COMERCIAL','ADMIN')),
  full_name varchar(255),
  department varchar(100),
  avatar_url text,
  created_at timestamptz default now()
);

-- PROYECTOS
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  name varchar(255) not null,
  client_name varchar(255),
  location varchar(255),
  event_date date,
  status varchar(20) default 'PRESUPUESTO'
    check (status in ('PRESUPUESTO','CONFIRMADO','EN_CAMPO','CERRADO')),
  total_width_px integer not null default 1920,
  total_height_px integer not null default 1080,
  led_pitch numeric(4,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ÍTEMS DEL PROYECTO (BOM)
create table public.project_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) default 0,
  rack_position_index integer,
  custom_notes text
);

-- CONEXIONES DE SEÑAL
create table public.project_connections (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  source_item_id uuid references public.project_items(id) on delete cascade not null,
  source_port_id uuid references public.product_ports(id) on delete cascade not null,
  target_item_id uuid references public.project_items(id) on delete cascade not null,
  target_port_id uuid references public.product_ports(id) on delete cascade not null,
  cable_type varchar(50),
  cable_length_m integer,
  connection_tag varchar(100)
);

-- TICKETS DE SOPORTE
create table public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  title varchar(255) not null,
  brand_affected varchar(50),
  model_affected varchar(100),
  fault_category varchar(30) default 'GENERAL'
    check (fault_category in ('RED','SYNC','EDID','FIRMWARE','HARDWARE',
                              'SOFTWARE_VMP','SOFTWARE_PIXELFLOW','GENERAL')),
  issue_description text not null,
  root_cause text,
  solution_steps text,
  status varchar(20) default 'OPEN'
    check (status in ('OPEN','IN_PROGRESS','RESOLVED','KNOWLEDGE_BASE')),
  kb_published boolean default false,
  kb_view_count integer default 0,
  created_by uuid not null references auth.users(id),
  resolved_by uuid references auth.users(id),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(title,'') || ' ' ||
    coalesce(issue_description,'') || ' ' ||
    coalesce(solution_steps,''))
  ) stored
);
create index tickets_search_idx on public.support_tickets using gin(search_vector);

-- INVENTARIO
create table public.inventory_units (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete restrict not null,
  serial_number varchar(100) unique,
  status varchar(20) default 'STOCK'
    check (status in ('STOCK','RESERVADO','EN_CAMPO','EN_REPARACIÓN','BAJA')),
  firmware_version varchar(50),
  purchase_date date,
  warranty_expires date,
  last_service_date date,
  assigned_project_id uuid references public.projects(id),
  location_label varchar(100),
  notes text,
  created_at timestamptz default now()
);

-- VERSIONES DE FIRMWARE
create table public.firmware_versions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  version_string varchar(50) not null,
  is_certified boolean default false,
  release_date date,
  vmp_min_version varchar(50),
  pixelflow_min_version varchar(50),
  release_notes text,
  known_issues text,
  charmex_field_notes text,
  download_url text,
  checksum_sha256 varchar(64),
  created_at timestamptz default now()
);

-- CHECKLISTS DE DESPLIEGUE
create table public.deployment_checklists (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  phase varchar(20) not null
    check (phase in ('PREPARACION','TRANSPORTE','IN_SITU','POST_EVENTO')),
  completed_by uuid references auth.users(id),
  phase_completed_at timestamptz,
  created_at timestamptz default now()
);

create table public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  checklist_id uuid references public.deployment_checklists(id) on delete cascade not null,
  description text not null,
  is_completed boolean default false,
  completed_by uuid references auth.users(id),
  completed_at timestamptz,
  sort_order integer default 0
);

-- SESIONES COPILOT IA
create table public.copilot_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  project_id uuid references public.projects(id),
  briefing_input jsonb not null,
  ai_response text not null,
  recommended_model varchar(100),
  created_at timestamptz default now()
);

-- DATOS SEMILLA
insert into public.brands (name, accent_color) values
  ('NovaStar', '#dc2626'),
  ('Pixelhue', '#2563eb');

insert into public.categories (name) values
  ('Procesador LED'),
  ('Matriz de Conmutación'),
  ('Consola de Control'),
  ('Accesorio');

-- RLS
alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.support_tickets enable row level security;
alter table public.inventory_units enable row level security;
alter table public.firmware_versions enable row level security;
alter table public.copilot_sessions enable row level security;
alter table public.user_profiles enable row level security;

create policy "productos lectura publica" on public.products for select using (true);
create policy "proyectos propietario" on public.projects for all using (auth.uid() = user_id);
create policy "tickets autenticados" on public.support_tickets for all using (auth.role() = 'authenticated');
create policy "inventario autenticados" on public.inventory_units for select using (auth.role() = 'authenticated');
create policy "firmware lectura publica" on public.firmware_versions for select using (true);
create policy "copilot propio usuario" on public.copilot_sessions for all using (auth.uid() = user_id);
create policy "perfil propio" on public.user_profiles for all using (auth.uid() = id);
