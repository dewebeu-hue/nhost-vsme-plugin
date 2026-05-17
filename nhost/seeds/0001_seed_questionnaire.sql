insert into public.question_sections (code, title, description, sort_order)
values
  ('company_basics', 'Company Basics', 'Legal identity, ownership, operating footprint, and contact information.', 10),
  ('employees', 'Employees', 'Workforce size, structure, representation, and employee indicators.', 20),
  ('energy', 'Energy', 'Energy consumption, sources, intensity, and efficiency actions.', 30),
  ('fuel', 'Fuel', 'Fuel consumption and related operating data.', 40),
  ('waste', 'Waste', 'Waste streams, disposal routes, and reduction initiatives.', 50),
  ('environmental_policies', 'Environmental Policies', 'Policies, management systems, and environmental controls.', 60),
  ('health_safety', 'Health & Safety', 'Health, safety, training, incidents, and prevention practices.', 70),
  ('certifications', 'Certifications', 'Relevant management system and product certifications.', 80),
  ('governance', 'Governance', 'Ethics, conduct, procurement controls, and governance practices.', 90),
  ('supplier_information', 'Supplier Information', 'Buyer-facing supplier details and additional context.', 100)
on conflict (code) do update
set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order;

with energy_section as (
  select id
  from public.question_sections
  where code = 'energy'
)
insert into public.question_items (
  section_id,
  code,
  title,
  help_text,
  answer_type,
  unit,
  options,
  evidence_required,
  questionnaire_level,
  sort_order
)
select
  energy_section.id,
  item.code,
  item.title,
  item.help_text,
  item.answer_type,
  item.unit,
  item.options,
  item.evidence_required,
  item.questionnaire_level,
  item.sort_order
from energy_section
cross join (
  values
    (
      'energy_total_consumption',
      'What was your total energy consumption from all sources in the last 12 months?',
      'Include electricity, fuel, heating, cooling and other energy sources.',
      'number',
      'kWh',
      '{}'::jsonb,
      true,
      'basic',
      10
    ),
    (
      'energy_consumption_intensity',
      'What was your total energy consumption intensity?',
      'Report energy consumption per unit of revenue or per employee.',
      'number',
      'kWh / employee',
      '{}'::jsonb,
      false,
      'basic',
      20
    ),
    (
      'energy_primary_source',
      'What is your primary source of purchased energy?',
      'Select the primary source of purchased energy.',
      'select',
      null,
      '["Grid electricity", "Natural gas", "District heating", "Renewable electricity", "Other"]'::jsonb,
      false,
      'basic',
      30
    ),
    (
      'energy_onsite_renewable',
      'Do you use any on-site renewable energy?',
      'Consider solar, wind, biomass, geothermal, or other sources.',
      'boolean',
      null,
      '{}'::jsonb,
      false,
      'basic',
      40
    ),
    (
      'energy_renewable_percentage',
      'What percentage of your total energy comes from renewable sources?',
      'Enter 0 if you do not use renewable energy.',
      'number',
      '%',
      '{}'::jsonb,
      true,
      'basic',
      50
    ),
    (
      'energy_last_audit',
      'When was your last energy audit or review conducted?',
      'Provide the date of your most recent energy audit or assessment.',
      'date',
      null,
      '{}'::jsonb,
      true,
      'full',
      60
    ),
    (
      'energy_efficiency_measures',
      'What measures have you implemented to improve energy efficiency?',
      'Select all that apply.',
      'multi_select',
      null,
      '["LED lighting", "Efficient equipment", "Insulation improvement", "Energy monitoring", "Process optimization", "Other"]'::jsonb,
      false,
      'full',
      70
    ),
    (
      'energy_additional_notes',
      'Additional notes or context',
      'Add any relevant information about your energy use or initiatives.',
      'textarea',
      null,
      '{}'::jsonb,
      false,
      'full',
      80
    )
) as item(
  code,
  title,
  help_text,
  answer_type,
  unit,
  options,
  evidence_required,
  questionnaire_level,
  sort_order
)
on conflict (code) do update
set
  section_id = excluded.section_id,
  title = excluded.title,
  help_text = excluded.help_text,
  answer_type = excluded.answer_type,
  unit = excluded.unit,
  options = excluded.options,
  evidence_required = excluded.evidence_required,
  questionnaire_level = excluded.questionnaire_level,
  sort_order = excluded.sort_order;
