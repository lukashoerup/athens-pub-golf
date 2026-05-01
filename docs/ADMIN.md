# Admin Recipes — Athens Pub Golf

Ready-to-paste SQL for fixing common in-game issues during the trip.

**Run via Supabase MCP** (`execute_sql` on project `dxzexvudbxkidhydwylw`) **OR** paste into SQL Editor:
`https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new`

> **For Claude reading this**: When the user describes a problem, identify the closest recipe below, fill in the variables (player name, hole number, etc.), and either run it directly (MCP mode) or respond with the SQL block + one-sentence explanation. Don't lecture. Lukas is on a phone, possibly drunk. Be terse.

---

## ⚡ Cheat sheet

| Player names | Hole IDs | Phase values | Penalty reasons (TEXT[]) |
|---|---|---|---|
| `Nico` `Kris` `Misse` `Lukas` `Rasmus` `Rode` | 1–12 | `'committing'` `'reveal'` `'drinking'` `'scoring'` | `'max'` `'min'` `'same_as_last'` (legacy: `'8'`) |

**Stop name → ID quick lookup:**
| ID | Name | Drink | Max | Mult |
|---|---|---|---|---|
| 1 ★ | Gående øl → KARMINIO | Dåseøl | 8 | 1.0 |
| 2 | KARMINIO | Freddo | 6 | 1.0 |
| 3 | Souvlaki Kostas | Mythos | 8 | 1.0 |
| 4 | Barley Cargo | Greek IPA | 8 | 1.0 |
| 5 | Hoocut | Alfa Draft | 8 | 1.0 |
| 6 | I Stoa tou Psiri | Retsina | 6 | 1.0 |
| 7 | Tapfield | Taster | 5 | 1.0 |
| 8 | Areopagos | Takeaway-dåse | 8 | 1.0 |
| 9 | Brettos Distillery | Mastiha | 5 | 1.0 |
| 10 | Beer Time | Pint | 8 | **1.5** |
| 11 | Drupes | Bloody Mary | 6 | **2.0** |
| 12 | BOO! Athens | Shot | 3 | **2.5** |

---

## R1: Wrong commit value

> "Misse meant 4 sips, not 5, on hole 5"

```sql
UPDATE scores
SET committed_sips = 4
WHERE player_id = (SELECT id FROM players WHERE name = 'Misse')
  AND hole_id = 5;
```

⚠️ Only do this BEFORE the reveal phase. After reveal, fixing it now silently changes the average and everyone's score. Better to use **R5** (reset hole) if it matters.

---

## R2: Wrong commitment-check (clicked ✗ by mistake)

> "Frederik trykkede ❌ ved en fejl"

```sql
UPDATE scores
SET completed = true
WHERE player_id = (SELECT id FROM players WHERE name = 'Frederik')
  AND hole_id = 7;
```

Reverse direction (changing ✓ to ✗):
```sql
UPDATE scores SET completed = false
WHERE player_id = (SELECT id FROM players WHERE name = 'Frederik')
  AND hole_id = 7;
```

The +3 commitment penalty is calculated on-the-fly from this flag — no need to touch any score column.

---

## R3: Add a missing score (player never committed)

> "We forgot to log Lukas on hole 4 — he committed 3"

```sql
INSERT INTO scores (player_id, hole_id, committed_sips, completed, penalty_shot, penalty_shot_reason, penalty_shot_reasons)
VALUES (
  (SELECT id FROM players WHERE name = 'Lukas'),
  4,                       -- hole_id
  3,                       -- committed_sips
  true,                    -- completed (true=drank, false=fail+3, null=not yet)
  false,                   -- penalty_shot (legacy bool)
  null,                    -- penalty_shot_reason (legacy primary)
  ARRAY[]::text[]          -- penalty_shot_reasons (canonical)
);
```

If the player triggered penalty rules manually (e.g. they did commit max), set the array:
```sql
penalty_shot_reasons = ARRAY['max']::text[]
penalty_shot = true
penalty_shot_reason = 'max'
```

---

## R4: Force advance the phase

> "Phase is stuck on 'reveal' — push to drinking"

```sql
UPDATE game_state
SET phase = 'drinking'
WHERE id = 1;
```

Valid phases: `committing`, `reveal`, `drinking`, `scoring`. Realtime will sync to all phones immediately.

---

## R5: Reset a hole completely (replay it)

> "We messed up hole 8, let's redo it from scratch"

```sql
DELETE FROM scores WHERE hole_id = 8;
UPDATE game_state SET current_hole = 8, phase = 'committing' WHERE id = 1;
```

Wipes all 6 commits + completed flags + penalty_shots for that hole, sends everyone back to commit screen. Realtime syncs all phones instantly.

---

## R6: Skip to a specific hole

> "We're skipping ahead to hole 11"

```sql
UPDATE game_state
SET current_hole = 11, phase = 'committing'
WHERE id = 1;
```

Doesn't delete prior scores. If you need a clean slate for skipped holes:
```sql
DELETE FROM scores WHERE hole_id IN (9, 10);
```

---

## R7: DNF a player for the rest of the trip

> "Rasmus is throwing up — DNF him on remaining holes"

```sql
INSERT INTO scores (player_id, hole_id, committed_sips, completed, penalty_shot, penalty_shot_reason, penalty_shot_reasons)
SELECT
  (SELECT id FROM players WHERE name = 'Rasmus'),
  h.id,
  h.max_sips,            -- max sips = expensive base score
  false,                 -- failed commitment = +3 each hole
  false,
  null,
  ARRAY[]::text[]
FROM holes h
WHERE h.id >= (SELECT current_hole FROM game_state WHERE id = 1)
  AND h.is_practice = false
ON CONFLICT (player_id, hole_id) DO UPDATE
SET committed_sips = EXCLUDED.committed_sips,
    completed = EXCLUDED.completed;
```

DNFs them on current and all future real holes. Score takes a beating, which is fair.

---

## R8: Undo "Next Stop" click

> "We accidentally advanced from hole 5 to hole 6, go back"

```sql
UPDATE game_state
SET current_hole = 5, phase = 'scoring'
WHERE id = 1;
```

Existing hole 5 scores are untouched. The app will redisplay them.

---

## R9: Manually mark/unmark a penalty shot

> "Misse should have a penalty shot but it didn't trigger"

Reason codes: `'max'` (committed max sips for hole), `'min'` (committed 1), `'same_as_last'` (same as previous hole).

**Add a single penalty:**
```sql
UPDATE scores
SET penalty_shot = true,
    penalty_shot_reason = 'max',
    penalty_shot_reasons = ARRAY['max']::text[]
WHERE player_id = (SELECT id FROM players WHERE name = 'Misse')
  AND hole_id = 6;
```

**Stack multiple penalties (e.g. min + same_as_last = 2 shots):**
```sql
UPDATE scores
SET penalty_shot = true,
    penalty_shot_reason = 'min',
    penalty_shot_reasons = ARRAY['min', 'same_as_last']::text[]
WHERE player_id = (SELECT id FROM players WHERE name = 'Misse')
  AND hole_id = 6;
```

**Remove all penalties:**
```sql
UPDATE scores
SET penalty_shot = false,
    penalty_shot_reason = null,
    penalty_shot_reasons = ARRAY[]::text[]
WHERE player_id = (SELECT id FROM players WHERE name = 'Misse')
  AND hole_id = 6;
```

---

## R9b: Drink timer fixes

The drinking phase has a 2-min deadline that starts when the first player marks ✓. Anyone still pending when it expires auto-fails (+3).

**Give everyone more time** (extend by N minutes):
```sql
UPDATE game_state
SET drink_deadline_at = drink_deadline_at + INTERVAL '2 minutes'
WHERE id = 1;
```

**Cancel the timer** (no auto-fail):
```sql
UPDATE game_state SET drink_deadline_at = NULL WHERE id = 1;
```

**Restart the timer fresh from now**:
```sql
UPDATE game_state SET drink_deadline_at = NOW() + INTERVAL '2 minutes' WHERE id = 1;
```

---

## R10: Nuke and restart the entire game

> "We've completely lost the plot, start over from hole 1"

```sql
DELETE FROM scores;
UPDATE game_state SET current_hole = 1, phase = 'committing' WHERE id = 1;
```

Clean slate. Players keep their accounts; all scores wiped.

---

## R11: Replace a stop venue mid-game (we can't get in!)

> "Vi kan ikke komme ind på Beer Time, vi går til Brew Bar i stedet"

```sql
UPDATE holes
SET name = 'Brew Bar',
    address = 'Sokratous 36, Psiri',
    maps_url = 'https://maps.google.com/?q=Brew+Bar+Athens',
    drink = 'IPA Pint',
    drink_emoji = '🏺',
    max_sips = 8,
    stop_type = 'Happy Hour',
    fun_fact = 'Sidste øjebliks-omvej. Brew Bar har 30+ haner og er Athens nørd-paradis for craft beer.',
    district = 'Psiri',
    coords = '37.97°N · 23.72°Ø'
WHERE id = 10;
```

⚡ **Realtime:** All 6 phones receive the new venue info instantly. No app refresh needed.

If you only need to change ONE field:
```sql
UPDATE holes SET drink = 'Mythos Red' WHERE id = 10;
UPDATE holes SET max_sips = 6 WHERE id = 10;
UPDATE holes SET score_multiplier = 1.5 WHERE id = 10;  -- multiplier still applies after change
```

---

## R11b: Add a brand-new stop mid-trip

> "Vi opdagede et fedt sted, lad os tilføje det som hul 13"

The app dynamically reads total hole count from the DB.

```sql
INSERT INTO holes (id, name, address, maps_url, drink, drink_emoji, max_sips, stop_type, fun_fact, is_practice, district, coords, score_multiplier)
VALUES (
  13,
  'Six d.o.g.s',
  'Avramiotou 6-8',
  'https://maps.google.com/?q=Six+d.o.g.s+Athens',
  'Spritz',
  '🍸',
  5,
  'Bonus',
  'Avant-garde art bar med koncerter — fundet ved et tilfælde.',
  false,
  'Monastiraki',
  '37.97°N · 23.72°Ø',
  1.0
);
```

⚡ All 6 phones see the new stop count immediately. The "next stop" button on scoring screen will lead to it.

---

## R11c: Skip a stop without deleting it

> "Vi springer hul 9 over — der er for langt at gå"

**Don't DELETE the hole** — that would cascade-delete any scores from it. Just advance past it:

```sql
-- If currently on hole 8 scoring, jump straight to hole 10 committing
UPDATE game_state SET current_hole = 10, phase = 'committing' WHERE id = 1;
```

The hole still exists in the DB; no scores are written for it. The leaderboard ignores holes with no scores.

---

## R12: Update host_notes (Lukas-only anecdotes)

> "Tilføj en sjov fact til Brettos Distillery"

```sql
UPDATE holes
SET host_notes = 'Bag baren står ejeren ofte selv — fjerde generation Brettos. ' ||
                 'Mastiha fra Chios var i 1500-tallet så værdifuld at sultanens harem ' ||
                 'fik den som luksus-tyggesteller mod dårlig ånde.'
WHERE id = 9;
```

Shown only when player.name = 'Lukas'. Other players see nothing different.

---

## R13: Edit a waypoint (cultural sight)

> "Skift Vindenes Tårn-beskrivelsen, jeg vil tilføje noget"

```sql
UPDATE waypoints
SET description = 'Ny beskrivelse...',
    host_notes = 'Ny anekdote til Lukas...'
WHERE id = 3;  -- Vindenes Tårn
```

**Add a new waypoint:**
```sql
INSERT INTO waypoints (id, name, description, district, coords, maps_url, after_hole_id, display_order, host_notes)
VALUES (6, 'Plaka tavernaer', '...', 'Plaka', '37.97°N · 23.73°Ø',
  'https://maps.google.com/?q=Plaka+Athens', 9, 1, '...');
```

**Remove a waypoint:**
```sql
DELETE FROM waypoints WHERE id = 5;
```

**Move a waypoint to a different position in the route:**
```sql
UPDATE waypoints SET after_hole_id = 6 WHERE id = 1;  -- now shows after stop VI
```

---

## R14: Change a player's name (typo)

```sql
UPDATE players SET name = 'Nicolai' WHERE name = 'Nico';
```

The `name` column has a UNIQUE constraint. Swapping names between two players requires a temp value:
```sql
UPDATE players SET name = '__tmp' WHERE name = 'Nico';
UPDATE players SET name = 'Nico' WHERE name = 'Kris';
UPDATE players SET name = 'Kris' WHERE name = '__tmp';
```

⚠️ If you change `Lukas` to anything else, the host_notes UI gating breaks (it's hardcoded to check for the literal string `'Lukas'`).

---

## R15: Adjust late-game multipliers

> "Vi vil have hul 10 til at tælle dobbelt i stedet for 1.5×"

```sql
UPDATE holes SET score_multiplier = 2.0 WHERE id = 10;
UPDATE holes SET score_multiplier = 1.0 WHERE id = 11;  -- remove multiplier
```

Default is 1.0 (no multiplier). Currently: hole 10 = 1.5, hole 11 = 2.0, hole 12 = 2.5. Decimal values OK.

---

## Diagnostic queries

### "Hvad er stillingen lige nu?"
```sql
WITH hole_avg AS (
  SELECT hole_id, AVG(committed_sips)::numeric AS avg_sips
  FROM scores WHERE committed_sips IS NOT NULL GROUP BY hole_id
),
scored AS (
  SELECT s.player_id, s.committed_sips, s.completed, s.penalty_shot_reasons,
    h.score_multiplier,
    CASE
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 0.5 THEN 0
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 1.0 THEN 1
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 1.5 THEN 2
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 2.0 THEN 3
      ELSE 4
    END AS dp,
    CASE WHEN s.completed = false THEN 3 ELSE 0 END AS cp
  FROM scores s
  JOIN hole_avg ha ON ha.hole_id = s.hole_id
  JOIN holes h ON h.id = s.hole_id
  WHERE s.committed_sips IS NOT NULL AND h.is_practice = false
)
SELECT p.name,
  COALESCE(SUM(ROUND((dp + cp) * score_multiplier))::int, 0) AS total,
  COALESCE(SUM(cardinality(penalty_shot_reasons))::int, 0) AS shots,
  COUNT(*) FILTER (WHERE completed = false) AS fails
FROM players p LEFT JOIN scored s ON s.player_id = p.id
GROUP BY p.id, p.name ORDER BY total ASC;
```

### "Hvad har folk committed på det aktuelle hul?"
```sql
SELECT p.name, s.committed_sips, s.completed,
  s.penalty_shot_reasons, cardinality(s.penalty_shot_reasons) AS shots
FROM scores s
JOIN players p ON p.id = s.player_id
WHERE s.hole_id = (SELECT current_hole FROM game_state WHERE id = 1)
ORDER BY p.display_order;
```

### "Vis hele ruten"
```sql
SELECT id, name, drink, max_sips, score_multiplier, district FROM holes ORDER BY id;
```

### "Vis alle waypoints"
```sql
SELECT id, name, after_hole_id, district FROM waypoints ORDER BY after_hole_id, display_order;
```

---

## Notes for Claude

- **Always echo back the player name + hole + action** in plain English BEFORE the SQL block, e.g. "Setting Misse's hole 6 ✓:". This lets Lukas catch mistakes before pasting.
- **Don't combine recipes** unless the user clearly asks for it. Smaller queries = easier to verify what changed.
- **Realtime side-effects**: Any UPDATE/INSERT to `scores`, `game_state`, `holes`, `waypoints` instantly pushes to all 6 phones. Mention this if it might surprise the user.
- **Practice round = hole 1**, `is_practice = true`. Scores there don't count toward leaderboard. The leaderboard query already excludes it.
- The DB has a UNIQUE constraint on `(player_id, hole_id)` — re-inserting a score for the same player/hole will fail unless you use `ON CONFLICT`.
- **Penalty shot stacking**: ALWAYS write the canonical `penalty_shot_reasons` array. The legacy `penalty_shot_reason` (single string) is kept for backward compat but the array is the source of truth.
