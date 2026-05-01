-- ============================================================================
-- JP Rentals — Vehicle Seed Data
-- Synced from src/data/fleet.ts
-- Run after 001_schema.sql in Supabase SQL Editor
-- ============================================================================

INSERT INTO vehicles (slug, name, category, fuel_type, year, price_per_day) VALUES
  ('thar-roxx-4x4-diesel-2025',    'Thar Roxx 4x4',  'SUV',       'Diesel', 2025, 5500),
  ('scorpio-2023-diesel',          'Scorpio',         'SUV',       'Diesel', 2023, 5000),
  ('thar-4x4-2022-diesel',        'Thar 4x4',        'SUV',       'Diesel', 2022, 5000),
  ('thar-4x2-2024-diesel',        'Thar 4x2',        'SUV',       'Diesel', 2024, 4500),
  ('honda-city-2025-petrol-ivtec', 'Honda City',      'Sedan',     'Petrol', 2025, 3500),
  ('verna-2020-diesel',            'Verna',           'Sedan',     'Diesel', 2020, 3300),
  ('brezza-2017-vxi',             'Brezza',          'SUV',       'Petrol', 2017, 3200),
  ('ciaz-alpha-2021-petrol',       'Ciaz Alpha',      'Sedan',     'Petrol', 2021, 3000),
  ('venue-2021-petrol',            'Venue',           'SUV',       'Petrol', 2021, 3000),
  ('ciaz-delta-2016-petrol',       'Ciaz Delta',      'Sedan',     'Petrol', 2016, 2700),
  ('i20-sportz-2021-petrol',       'i20 Sportz',      'Hatchback', 'Petrol', 2021, 2700),
  ('baleno-delta-2018-diesel',     'Baleno Delta',    'Hatchback', 'Diesel', 2018, 2200),
  ('baleno-zeta-2019-petrol',      'Baleno Zeta',     'Hatchback', 'Petrol', 2019, 2200)
ON CONFLICT (slug) DO UPDATE SET
  name          = EXCLUDED.name,
  category      = EXCLUDED.category,
  fuel_type     = EXCLUDED.fuel_type,
  year          = EXCLUDED.year,
  price_per_day = EXCLUDED.price_per_day,
  is_active     = TRUE,
  updated_at    = NOW();
