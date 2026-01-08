-- Create visit_types table for dropdown configuration
create table if not exists public.visit_types (
  id uuid default gen_random_uuid() primary key,
  name varchar(100) not null unique,
  description text,
  requires_prior_auth boolean default false not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table public.visit_types enable row level security;

-- Allow all authenticated users to read visit types
create policy "Allow authenticated users to read visit types"
  on public.visit_types
  for select
  to authenticated
  using (is_active = true);

-- Allow admins to manage visit types (you can adjust this based on your auth setup)
create policy "Allow admins to manage visit types"
  on public.visit_types
  for all
  to authenticated
  using (true)
  with check (true);

-- Add comments for documentation
comment on table public.visit_types is 'Configurable visit types for eligibility verification';
comment on column public.visit_types.name is 'Name of the visit type (e.g., Consultation, Surgery, Emergency)';
comment on column public.visit_types.requires_prior_auth is 'Flag indicating if this visit type requires prior authorization';
comment on column public.visit_types.is_active is 'Active status for filtering in dropdowns';

-- Insert standard visit types based on medical billing best practices
insert into public.visit_types (name, description, requires_prior_auth) values
  ('Consultation', 'Standard consultation visit', false),
  ('Follow-Up', 'Follow-up appointment for existing condition', false),
  ('New Patient', 'Initial visit for new patient', false),
  ('Annual Physical', 'Routine annual physical examination', false),
  ('Preventive Care', 'Preventive health screening', false),
  ('Urgent Care', 'Urgent but non-emergency care', false),
  ('Emergency', 'Emergency medical care', false),
  ('Surgery - Inpatient', 'Surgical procedure requiring hospital admission', true),
  ('Surgery - Outpatient', 'Ambulatory surgical procedure', true),
  ('Surgery - Same Day', 'Same-day surgical procedure', true),
  ('Procedure - Diagnostic', 'Diagnostic procedure (e.g., endoscopy, biopsy)', false),
  ('Procedure - Therapeutic', 'Therapeutic procedure requiring authorization', true),
  ('Imaging - Advanced', 'Advanced imaging (MRI, CT, PET scan)', true),
  ('Imaging - Standard', 'Standard imaging (X-ray, ultrasound)', false),
  ('Lab Work', 'Laboratory tests and analysis', false),
  ('Therapy - Physical', 'Physical therapy session', false),
  ('Therapy - Occupational', 'Occupational therapy session', false),
  ('Injection/Infusion', 'Injectable medication or infusion therapy', false),
  ('Mental Health', 'Mental health counseling session', false),
  ('Telemedicine', 'Virtual/telehealth visit', false),
  ('Home Health', 'Home health care visit', false),
  ('Observation', 'Hospital observation status', false),
  ('Inpatient Stay', 'Hospital inpatient admission', true),
  ('Skilled Nursing', 'Skilled nursing facility care', true),
  ('Durable Medical Equipment', 'DME provision or fitting', false)
on conflict (name) do nothing;

-- Create updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_visit_types_updated_at
  before update on public.visit_types
  for each row
  execute function public.update_updated_at_column();
