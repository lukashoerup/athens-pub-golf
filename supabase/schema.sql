-- Athens Pub Golf — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

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
  drink_emoji TEXT DEFAULT '🍺',
  max_sips INT NOT NULL,
  stop_type TEXT,
  fun_fact TEXT,
  is_practice BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  hole_id INT REFERENCES holes(id),
  committed_sips INT,
  completed BOOLEAN,
  penalty_shot BOOLEAN DEFAULT FALSE,
  penalty_shot_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, hole_id)
);

CREATE TABLE IF NOT EXISTS game_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_hole INT NOT NULL DEFAULT 1,
  phase TEXT NOT NULL DEFAULT 'committing'
  -- phases: committing → reveal → drinking → scoring
);

-- ============================================================
-- PERMISSIONS (allow anon read/write — no auth needed)
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON holes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scores TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON game_state TO anon, authenticated;

-- ============================================================
-- REALTIME
-- Enable realtime for scores and game_state
-- (Also enable via Dashboard → Database → Replication → supabase_realtime)
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;

-- ============================================================
-- SEED: Players
-- Update names here before deploying!
-- ============================================================

INSERT INTO players (name, display_order) VALUES
  ('Nico', 1),
  ('Kris', 2),
  ('Misse', 3),
  ('Lukas', 4),
  ('Rasmus', 5),
  ('Rode', 6)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED: Holes
-- ============================================================

INSERT INTO holes (id, name, address, maps_url, drink, drink_emoji, max_sips, stop_type, fun_fact, is_practice) VALUES
  (1, 'Gående øl → KARMINIO', 'Fra Geor. Lachouri 3 mod Veikou 86', 'https://maps.google.com/?q=KARMINIO+Veikou+86+Athens', 'Dåseøl (kiosk)', '🏺', 8, 'PRØVERUNDE', 'Velkommen til Athens Pub Golf! Dette er en prøverunde — point tæller ikke. Køb en dåse fra kiosken, åbn appen, og lær reglerne mens I går mod brunch. Koukaki-kvarteret er opkaldt efter en excentrisk lokal i det 19. århundrede, der spillede på et lille instrument kaldet koukaki.', true),
  (2, 'KARMINIO', 'Veikou 86, Koukaki', 'https://maps.google.com/?q=KARMINIO+Veikou+86+Athens', 'Freddo Espresso', '☕', 6, 'Brunch', 'Freddo espresso er Grækenlands nationalkaffe — opfundet i Thessaloniki. Første rigtige hul. Nu tæller det.', false),
  (3, 'Souvlaki Kostas', 'Filellinon 7, Syntagma', 'https://maps.google.com/?q=Souvlaki+Kostas+Athens', 'Mythos 330ml', '🏺', 8, 'Frokost', 'Tredje generation. Åbnet i 1950. Ingen pommes, ingen extras. Ren old-school souvlaki.', false),
  (4, 'Barley Cargo', 'Kolokotroni 6', 'https://maps.google.com/?q=Barley+Cargo+Athens', 'Greek IPA (fadøl)', '🏺', 8, 'Craft beer', 'Grækerne opfandt vin, men det var tyskeren Karl Fuchs der startede det første bryggeri i Athen i 1854. Craft beer-scenen eksploderede først omkring 2012.', false),
  (5, 'Hoocut', 'Agias Irinis 9', 'https://maps.google.com/?q=Hoocut+Athens', 'Alfa Draft', '🏺', 8, 'Souvlaki', 'I sidder på Agia Irini-pladsen — opkaldt efter Hellige Irene-kirken fra det 5. århundrede som ligger lige bag jer.', false),
  (6, 'Areopagos-højen', 'Areopagus Hill', 'https://maps.google.com/?q=Areopagus+Hill+Athens', 'Takeaway-dåse', '🏺', 8, 'Udsigt + øl', 'Areopagos var Athens øverste domstol i over 1.000 år. Krigsguden Ares blev stillet for retten her for mord. Apostlen Paulus prædikede her i år 51 e.Kr.', false),
  (7, 'I Stoa tou Psiri', 'Ag. Dimitriou 19, Psiri', 'https://maps.google.com/?q=I+Stoa+tou+Psiri+Athens', 'Retsina (glas)', '🍷', 6, 'Meze', 'Retsina — vin tilsat harpiks — går 2.000 år tilbage. Grækerne forseglede amforaerne med fyrretræsharpiks, og smagen hang ved. De beholdt den med vilje.', false),
  (8, 'Beer Time', 'Iroon Square, Psiri', 'https://maps.google.com/?q=Beer+Time+Athens+Psiri', 'Pint', '🏺', 8, 'Happy Hour', 'Psiri var Athens mest berygtede kvarter i det 19. og 20. århundrede — kriminelle, smuglere, rebetiko-musik. Nu er det craft beer og gallerier.', false),
  (9, 'Tapfield', 'Naparchou Apostoli 4', 'https://maps.google.com/?q=Tapfield+Athens', 'Taster (lille glas)', '🏺', 5, 'Craft beer', 'Grækenland har over 120 craft-bryggerier nu. Før 2010 var der stort set kun Fix, Mythos og Alfa.', false),
  (10, 'Barley Cargo (Runde 2)', 'Kolokotroni 6', 'https://maps.google.com/?q=Barley+Cargo+Athens', 'Belgian Strong', '🏺', 8, 'Aften', 'Belgisk øl-tradition er UNESCO-kulturarv siden 2016. Det er kulturdrikning, gutter.', false),
  (11, 'STOA Athens', 'Karagiorgi Servias 10', 'https://maps.google.com/?q=STOA+Athens+Karagiorgi+Servias', 'Cocktail', '🍸', 6, 'Natbar', 'En stoa i det gamle Grækenland var en overdækket søjlegang brugt til handel, diskussion og filosofi. Stoicismen er opkaldt efter Stoa Poikile i Athen.', false),
  (12, 'BOO! Athens', 'Lepeniotou 22, Psiri', 'https://maps.google.com/?q=BOO+Athens+Lepeniotou+22', 'Shot', '🥃', 3, 'Klub / Final', 'Sidste hul. I det gamle Grækenland drak man en kottabos-runde til sidst — man kastede vinrester mod et mål. Vores version er mere civiliseret. Marginalt.', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: Initial game state
-- ============================================================

INSERT INTO game_state (id, current_hole, phase)
VALUES (1, 1, 'committing')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- USEFUL ADMIN QUERIES (save these for the trip!)
-- ============================================================

-- Ret en spillers commitment (f.eks. Hans på hul 5 fra 3 til 4):
-- UPDATE scores SET committed_sips = 4
-- WHERE player_id = (SELECT id FROM players WHERE name = 'Hans') AND hole_id = 5;

-- Ret en commitment-check (fejltrykket ❌ → ✅):
-- UPDATE scores SET completed = true
-- WHERE player_id = (SELECT id FROM players WHERE name = 'Frederik') AND hole_id = 7;

-- Reset et helt hul:
-- DELETE FROM scores WHERE hole_id = 8;
-- UPDATE game_state SET current_hole = 8, phase = 'committing';

-- Se alle scores for aktuelle hul:
-- SELECT p.name, s.committed_sips, s.completed, s.penalty_shot
-- FROM scores s JOIN players p ON p.id = s.player_id
-- WHERE s.hole_id = (SELECT current_hole FROM game_state WHERE id = 1);
