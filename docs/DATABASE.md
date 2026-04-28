# Database Reference — Athens Pub Golf

This file is the source of truth for any AI/human writing SQL against the live Supabase DB.

> **Workflow**: User messages Claude with a problem → Claude reads this doc → Claude writes ready-to-paste SQL → User pastes into Supabase SQL Editor on phone (or Claude with Supabase MCP runs it directly) → fixed.

---

## Connection

- **Project**: `dxzexvudbxkidhydwylw` (name "AthenApp", region eu-west-1)
- **SQL Editor URL**: `https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new`
- **Bookmark this on your phone before the trip.**
- **Anon key** in `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vercel env var) is read/write — no auth on the app side.

---

## Tables (4 total)

### `players`
Pre-seeded with 6 players. Don't add or remove rows — only fix typos.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | primary key, auto-generated |
| `name` | TEXT | unique, displayed in app. **`Lukas` is the host** — UI shows host_notes only when this player is logged in |
| `display_order` | INT | 1–6, controls button order on player select screen |

**Current players** by display_order: Nico (1), Kris (2), Misse (3), Lukas (4), Rasmus (5), Rode (6).

---

### `holes` ⭐ Realtime-enabled
12 holes. UPDATEs propagate to all 6 phones instantly via Realtime — used for mid-trip route changes.

| Column | Type | Notes |
|---|---|---|
| `id` | INT | 1–12, primary key. **Don't change** — FK target in scores |
| `name` | TEXT | display name |
| `address` | TEXT | for Google Maps link |
| `maps_url` | TEXT | full URL |
| `drink` | TEXT | display name of drink |
| `drink_emoji` | TEXT | single emoji (default 🏺 amphora — replaces 🍺 beer) |
| `max_sips` | INT | upper bound on stepper. Triggers `'max'` penalty when committed |
| `stop_type` | TEXT | category label ("Frokost", "Cocktail", "Solnedgang"...) |
| `fun_fact` | TEXT | 2-4 sentence factual description shown to ALL players in commit phase |
| `is_practice` | BOOLEAN | `true` only for hole 1; excluded from leaderboard math |
| `district` | TEXT | small-caps eyebrow above hole name |
| `coords` | TEXT | coords string shown next to district, e.g. "37.97°N · 23.72°Ø" |
| `score_multiplier` | NUMERIC | default 1.0; **holes 10/11/12 use 1.5/2.0/2.5** to weight late-game scores |
| `host_notes` | TEXT | juicy historical anecdotes — **only shown to player named "Lukas"** |

**Current route** (after the May reshuffle):

| ID | Name | Drink | Max | Mult | District |
|---|---|---|---|---|---|
| 1 ★ | Gående øl → KARMINIO | Dåseøl (kiosk) | 8 | 1.0 | Koukaki → Veikou |
| 2 | KARMINIO | Freddo Espresso | 6 | 1.0 | Koukaki |
| 3 | Souvlaki Kostas | Mythos 330ml | 8 | 1.0 | Syntagma |
| 4 | Barley Cargo | Greek IPA (fadøl) | 8 | 1.0 | Kolokotroni |
| 5 | Hoocut | Alfa Draft | 8 | 1.0 | Agia Irini |
| 6 | I Stoa tou Psiri | Retsina (glas) | 6 | 1.0 | Psiri |
| 7 | Tapfield | Taster (lille glas) | 5 | 1.0 | Psiri |
| 8 | Areopagos-højen | Takeaway-dåse | 8 | 1.0 | Areopagos (sunset!) |
| 9 | Brettos Distillery | Mastiha | 5 | 1.0 | Plaka |
| 10 | Beer Time | Pint | 8 | **1.5** | Psiri · Iroon |
| 11 | Drupes | Bloody Mary | 6 | **2.0** | Psiri |
| 12 | BOO! Athens | Shot | 3 | **2.5** | Psiri (finale) |

---

### `waypoints` ⭐ Realtime-enabled
Cultural sights along the route — NOT drinking stops. Shown in route timeline between holes.

| Column | Type | Notes |
|---|---|---|
| `id` | INT | primary key |
| `name` | TEXT | sight name |
| `description` | TEXT | shown to all players |
| `district` | TEXT | location label |
| `coords` | TEXT | optional |
| `maps_url` | TEXT | direct link |
| `after_hole_id` | INT | FK → holes.id; rendered AFTER this hole in timeline |
| `display_order` | INT | tiebreaker if multiple waypoints share `after_hole_id` |
| `host_notes` | TEXT | juicy anecdotes — only shown to "Lukas" |

**Current waypoints:**

| ID | Name | After Stop |
|---|---|---|
| 1 | Hadrians Port + Olympieion | II |
| 2 | Den Ukendte Soldats Grav (Evzones) | III |
| 3 | Vindenes Tårn + Romersk Agora | V |
| 4 | Hephaistos-templet | VII |
| 5 | Anafiotika | VIII |

---

### `scores` ⭐ Realtime-enabled
One row per player per hole. Created when a player commits.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `player_id` | UUID | FK → players.id |
| `hole_id` | INT | FK → holes.id, 1–12 |
| `committed_sips` | INT | what the player locked in (1 to max_sips) |
| `completed` | BOOLEAN | `null` = haven't drunk yet, `true` = ✓ klarede det, `false` = ✗ fejlede (+3 strafpoint to total) |
| `penalty_shot` | BOOLEAN | **legacy** — true if any reason triggered. Use `penalty_shot_reasons` instead |
| `penalty_shot_reason` | TEXT | **legacy** — primary reason. Use `penalty_shot_reasons[0]` instead |
| `penalty_shot_reasons` | TEXT[] | **canonical** — array of ALL triggered reasons. `cardinality()` = number of straf-shots that hole. Reasons: `'max'`, `'min'`, `'same_as_last'`. Legacy `'8'` may exist in old rows |
| `created_at` | TIMESTAMPTZ | auto |

**Unique constraint**: `(player_id, hole_id)` — one score per player per hole.

**Stacking penalty rules**: a single commit can trigger multiple reasons. Examples:
- Commit `1` on a hole with max=8 → `['min']` = 1 shot
- Commit `1` on hole 4 after committing `1` on hole 3 → `['min', 'same_as_last']` = **2 shots**
- Commit `8` on hole 4 after committing `8` on hole 3 → `['max', 'same_as_last']` = **2 shots**
- Commit `4` on hole 4 after committing `4` on hole 3 → `['same_as_last']` = 1 shot

`same_as_last` only triggers from hole 3 onwards (currentHoleId > 2).

---

### `game_state` ⭐ Realtime-enabled (singleton, always id=1)
Tracks current hole and phase for the whole group.

| Column | Type | Notes |
|---|---|---|
| `id` | INT | always `1` |
| `current_hole` | INT | 1–12 (or beyond if extra stops added) |
| `phase` | TEXT | one of: `'committing'`, `'reveal'`, `'drinking'`, `'scoring'` |

---

## Phase state machine

```
committing → reveal → drinking → scoring → (next hole, current_hole++) → committing
```

- **`committing`**: players locking in slurke via stepper. Auto-advances to `reveal` when all 6 have a row in `scores` for `current_hole` with `committed_sips IS NOT NULL`.
- **`reveal`**: shows everyone's numbers + group average + penalty shots. Auto-advances to `drinking` when one player taps "fortsæt".
- **`drinking`**: ✓/✗ commitment-check buttons active. Auto-advances to `scoring` when all 6 scores have `completed IS NOT NULL`.
- **`scoring`**: shows hole scores + leaderboard. Manually advances to next hole when someone taps "NÆSTE STOP".

After the last hole's scoring → final scoreboard renders client-side (no further DB transition).

---

## Diagnostic queries (always safe — read-only)

### What's the current game state?
```sql
SELECT
  gs.current_hole,
  h.name AS hole_name,
  gs.phase,
  h.is_practice,
  h.score_multiplier
FROM game_state gs
JOIN holes h ON h.id = gs.current_hole
WHERE gs.id = 1;
```

### Who has committed on the current hole?
```sql
SELECT p.name, s.committed_sips, s.completed,
  s.penalty_shot_reasons, cardinality(s.penalty_shot_reasons) AS shots
FROM scores s
JOIN players p ON p.id = s.player_id
WHERE s.hole_id = (SELECT current_hole FROM game_state WHERE id = 1)
ORDER BY p.display_order;
```

### Full game so far (all scores)
```sql
SELECT h.id, h.name, p.name AS player,
  s.committed_sips, s.completed, s.penalty_shot_reasons
FROM scores s
JOIN players p ON p.id = s.player_id
JOIN holes h ON h.id = s.hole_id
ORDER BY h.id, p.display_order;
```

### Live leaderboard (matches the app's calculation exactly)
```sql
WITH hole_avg AS (
  SELECT hole_id, AVG(committed_sips)::numeric AS avg_sips
  FROM scores
  WHERE committed_sips IS NOT NULL
  GROUP BY hole_id
),
scored AS (
  SELECT
    s.player_id,
    s.hole_id,
    s.committed_sips,
    s.completed,
    s.penalty_shot_reasons,
    h.score_multiplier,
    CASE
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 0.5 THEN 0
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 1.0 THEN 1
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 1.5 THEN 2
      WHEN ABS(s.committed_sips - ha.avg_sips) <= 2.0 THEN 3
      ELSE 4
    END AS distance_penalty,
    CASE WHEN s.completed = false THEN 3 ELSE 0 END AS commitment_penalty
  FROM scores s
  JOIN hole_avg ha ON ha.hole_id = s.hole_id
  JOIN holes h ON h.id = s.hole_id
  WHERE s.committed_sips IS NOT NULL
    AND h.is_practice = false
)
SELECT
  p.name,
  COALESCE(SUM(ROUND((committed_sips + distance_penalty + commitment_penalty) * score_multiplier))::int, 0) AS total_score,
  COALESCE(SUM(cardinality(penalty_shot_reasons))::int, 0) AS penalty_shots,
  COUNT(*) FILTER (WHERE completed = false) AS commitment_fails,
  COUNT(*) FILTER (WHERE distance_penalty = 0) AS spot_ons
FROM players p
LEFT JOIN scored ON scored.player_id = p.id
GROUP BY p.id, p.name
ORDER BY total_score ASC;
```

---

## Scoring formula (must match `lib/scoring.ts`)

```
hole_total = ROUND( (committed_sips + distance_penalty + commitment_penalty) * score_multiplier )

distance_penalty:
  ABS(sips - avg) <= 0.5 → 0
  ABS(sips - avg) <= 1.0 → 1
  ABS(sips - avg) <= 1.5 → 2
  ABS(sips - avg) <= 2.0 → 3
  else                   → 4

commitment_penalty:
  completed = false → 3
  else              → 0

penalty_shots (drinks, NOT points):
  one per element in penalty_shot_reasons array
```

Practice round (hole 1) is excluded from leaderboard sums.

---

## Things to NEVER do

- ❌ Don't delete rows from `players` or `holes` (FK constraints + breaks app)
- ❌ Don't change `players.id` or `holes.id`
- ❌ Don't insert new rows in `game_state` — there's only ever `id=1`
- ❌ Don't set `phase` to a string outside `committing|reveal|drinking|scoring`
- ❌ Don't manually compute or insert score totals — the app computes on-the-fly from raw data
- ❌ Don't write `penalty_shot_reasons` as anything other than a TEXT[] (use `ARRAY['min','same_as_last']` syntax)
