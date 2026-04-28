-- Athens Pub Golf — Supabase Schema (canonical)
--
-- This file describes the FULL current database structure. To rebuild from
-- scratch, run this whole file in Supabase SQL Editor. Long content fields
-- (fun_fact, host_notes, waypoint descriptions) are stored as inserts at the
-- bottom — abbreviated here; see docs/ADMIN.md for the live recipes.
--
-- Project: dxzexvudbxkidhydwylw
-- SQL Editor: https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL
);

CREATE TABLE IF NOT EXISTS holes (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  maps_url TEXT,
  drink TEXT NOT NULL,
  drink_emoji TEXT DEFAULT '🏺',
  max_sips INT NOT NULL,
  stop_type TEXT,
  fun_fact TEXT,
  is_practice BOOLEAN DEFAULT FALSE,
  district TEXT,                          -- small-caps eyebrow above name
  coords TEXT,                            -- coordinate string, e.g. "37.97°N · 23.72°Ø"
  score_multiplier NUMERIC NOT NULL DEFAULT 1.0,  -- late-game weighting (1.5 / 2.0 / 2.5 on holes 10/11/12)
  host_notes TEXT                         -- juicy historical anecdotes — only shown to player named "Lukas"
);

CREATE TABLE IF NOT EXISTS waypoints (
  id INT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  district TEXT,
  coords TEXT,
  maps_url TEXT,
  after_hole_id INT REFERENCES holes(id) ON DELETE CASCADE,  -- shown in route timeline AFTER this stop
  display_order INT NOT NULL DEFAULT 0,
  host_notes TEXT                         -- only shown to player named "Lukas"
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  hole_id INT REFERENCES holes(id),
  committed_sips INT,
  completed BOOLEAN,                      -- null = not yet, true = drank ✓, false = failed ✗ (+3 points)
  penalty_shot BOOLEAN DEFAULT FALSE,     -- legacy: TRUE if any penalty triggered
  penalty_shot_reason TEXT,               -- legacy: primary reason ('max'|'min'|'same_as_last'|'8' legacy)
  penalty_shot_reasons TEXT[] NOT NULL DEFAULT '{}',  -- ALL triggered reasons; cardinality = number of straf-shots
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, hole_id)
);

CREATE TABLE IF NOT EXISTS game_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_hole INT NOT NULL DEFAULT 1,
  phase TEXT NOT NULL DEFAULT 'committing'
  -- valid phases: 'committing' → 'reveal' → 'drinking' → 'scoring'
);

-- ============================================================
-- PERMISSIONS — anon role used by the app's NEXT_PUBLIC_SUPABASE_ANON_KEY
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON holes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON waypoints TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scores TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_state TO anon, authenticated;

-- ============================================================
-- REALTIME — all 4 tables broadcast UPDATEs to every connected phone
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE holes;
ALTER PUBLICATION supabase_realtime ADD TABLE waypoints;

-- ============================================================
-- SEED: Players (6 — names confirmed for the trip)
-- ============================================================

INSERT INTO players (name, display_order) VALUES
  ('Nico', 1),
  ('Kris', 2),
  ('Misse', 3),
  ('Lukas', 4),       -- "Lukas" is the host — receives host_notes
  ('Rasmus', 5),
  ('Rode', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Holes (12 — current route as of trip date)
-- IDs are stable; do NOT change them (FK in scores).
-- ============================================================
-- I  ★ practice  Gående øl → KARMINIO   Dåseøl       max=8  (Koukaki → Veikou)
-- II            KARMINIO                Freddo       max=6  (Koukaki, brunch)
-- III           Souvlaki Kostas         Mythos 330   max=8  (Syntagma, lunch)
-- IV            Barley Cargo            Greek IPA    max=8  (Kolokotroni)
-- V             Hoocut                  Alfa Draft   max=8  (Agia Irini, souvlaki)
-- VI            I Stoa tou Psiri        Retsina      max=6  (Psiri, meze)
-- VII           Tapfield                Taster       max=5  (Psiri)
-- VIII          Areopagos-højen         Takeaway-dåse max=8  (sunset! ~20:10)
-- IX            Brettos Distillery      Mastiha      max=5  (Plaka)
-- X    ×1.5    Beer Time                Pint         max=8  (Psiri · Iroon, happy hour)
-- XI   ×2.0    Drupes                   Bloody Mary  max=6  (Psiri, cocktail)
-- XII  ×2.5    BOO! Athens              Shot         max=3  (Psiri, finale)
--
-- Full content (fun_fact, host_notes, addresses, maps_url) is in the database.
-- To re-seed from scratch, see docs/ADMIN.md "Recipe: re-seed holes".

-- ============================================================
-- SEED: Waypoints (5 cultural sights, only on day-time route)
-- ============================================================
-- 1: Hadrians Port + Olympieion        after stop II   (Plaka)
-- 2: Den Ukendte Soldats Grav (Evzones) after stop III (Syntagma)
-- 3: Vindenes Tårn + Romersk Agora     after stop V    (Plaka)
-- 4: Hephaistos-templet                after stop VII  (Ancient Agora)
-- 5: Anafiotika                        after stop VIII (Plaka)

-- ============================================================
-- SEED: Initial game state
-- ============================================================

INSERT INTO game_state (id, current_hole, phase)
VALUES (1, 1, 'committing')
ON CONFLICT (id) DO NOTHING;
