-- POS (Place of Service) configuration table
create table if not exists public.place_of_service_codes (
  id uuid primary key default gen_random_uuid(),
  code varchar(10) not null unique,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed common POS codes (adjust to your needs)
insert into public.place_of_service_codes (code, description)
values
  ('11', 'Office'),
  ('12', 'Home'),
  ('19', 'Off Campus-Outpatient Hospital'),
  ('20', 'Urgent Care Facility'),
  ('21', 'Inpatient Hospital'),
  ('22', 'On Campus-Outpatient Hospital'),
  ('23', 'Emergency Room - Hospital'),
  ('24', 'Ambulatory Surgical Center'),
  ('31', 'Skilled Nursing Facility'),
  ('32', 'Nursing Facility'),
  ('50', 'Federally Qualified Health Center'),
  ('72', 'Rural Health Clinic')
on conflict (code) do nothing;

-- TOS (Type of Service) configuration table
create table if not exists public.type_of_service_codes (
  id uuid primary key default gen_random_uuid(),
  code varchar(10) not null unique,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed common TOS codes (adjust to your needs)
insert into public.type_of_service_codes (code, description)
values
  ('1', 'Medical Care'),
  ('2', 'Surgery'),
  ('3', 'Consultation'),
  ('4', 'Diagnostic Radiology'),
  ('5', 'Diagnostic Laboratory'),
  ('6', 'Therapeutic Radiology'),
  ('7', 'Anesthesia'),
  ('8', 'Assistant at Surgery'),
  ('9', 'Other Medical Service'),
  ('D', 'Ambulance'),
  ('E', 'Enteral/Parenteral Nutrients and Supplies'),
  ('F', 'Ambulatory Surgical Center'),
  ('H', 'Hospice'),
  ('Q', 'Vision Items or Services')
on conflict (code) do nothing;


