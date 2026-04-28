# Database Reference — Athens Pub Golf

This file is the source of truth for any AI/human writing SQL against the live Supabase DB.

> **Workflow**: User messages Claude with a problem → Claude reads this doc → Claude writes ready-to-paste SQL → User pastes into Supabase SQL Editor on phone → fixed.

---

## Connection

- **Project**: `dxzexvudbxkidhydwylw`
- **SQL Editor URL**: `https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new`
- **Bookmark this on your phone before the trip.**

---

## Tables

### `players`
Pre-seeded with 6 players. Don't add or remove rows — only fix names.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | primary key, auto-generated |
| `name` | TEXT | unique, displayed in app |
| `display_order` | INT | 1–6, controls button order on player select screen |

**Current players** (display_order):
1. Nico
2. Kris
3. Misse
4. Lukas
5. Rasmus
6. Rode

### `holes`
Pre-seeded with 12 holes. Reference data — don't modify during play.

| Column | Type | Notes |
|---|---|---|
| `id` | INT | 1–12, primary key |
| `name` | TEXT | display name |
| `address` | TEXT | for Google Maps link |
| `maps_url` | TEXT | full URL |
| `drink` | TEXT | display name of drink |
| `drink_emoji` | TEXT | single emoji |
| `max_sips` | INT | upper bound on stepper |
| `stop_type` | TEXT | category label |
| `fun_fact` | TEXT | shown in commit phase |
| `is_practice` | BOOLEAN | `true` only for hole 1 |

### `scores` ⭐ (most editing happens here)
One row per player per hole. Created when a player commits.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | primary key |
| `player_id` | UUID | FK → players.id |
| `hole_id` | INT | FK → holes.id, 1–12 |
| `committed_sips` | INT | what the player locked in (1 to max_sips) |
| `completed` | BOOLEAN | `null` = haven't drunk yet, `true` = ✅ klarede det, `false` = ❌ fejlede (+3 straf) |
| `penalty_shot` | BOOLEAN | true if committed=8 OR same as previous hole (auto) |
| `penalty_shot_reason` | TEXT | `'8'` or `'same_as_last'` |
| `created_at` | TIMESTAMPTZ | auto |

**Unique constraint**: `(player_id, hole_id)` — one score per player per hole.

### `game_state` (singleton, always id=1)
Tracks current hole and phase for the whole group.

| Column | Type | Notes |
|---|---|---|
| `id` | INT | always `1` |
| `current_hole` | INT | 1–12 |
| `phase` | TEXT | one of: `'committing'`, `'reveal'`, `'drinking'`, `'scoring'` |

---

## Phase state machine

```
committing → reveal → drinking → scoring → (next hole) → committing
```

- **`committing`**: players are submitting their slurke via the stepper. Auto-advances to `reveal` when all 6 have a row in `scores` for `current_hole` with `committed_sips IS NOT NULL`.
- **`reveal`**: shows everyone's numbers + average + penalty shots. Auto-advances to `drinking` when one player taps "fortsæt".
- **`drinking`**: ✅/❌ commitment-check buttons active. Auto-advances to `scoring` when all 6 scores have `completed IS NOT NULL`.
- **`scoring`**: shows hole scores + leaderboard. Manually advances to next hole (`current_hole += 1`, phase back to `committing`) when someone clicks "NÆSTE HUL".

After hole 12 scoring → final scoreboard renders client-side (no further DB transition).

---

## Diagnostic queries (always safe — read-only)

### What's the current game state?
```sql
SELECT
  gs.current_hole,
  h.name AS hole_name,
  gs.phase,
  h.is_practice
FROM game_state gs
JOIN holes h ON h.id = gs.current_hole
WHERE gs.id = 1;
```

### Who has committed on the current hole?
```sql
SELECT p.name, s.committed_sips, s.completed, s.penalty_shot, s.penalty_shot_reason
FROM scores s
JOIN players p ON p.id = s.player_id
WHERE s.hole_id = (SELECT current_hole FROM game_state WHERE id = 1)
ORDER BY p.display_order;
```

### Full game so far (all scores)
```sql
SELECT h.id, h.name, p.name AS player, s.committed_sips, s.completed, s.penalty_shot
FROM scores s
JOIN players p ON p.id = s.player_id
JOIN holes h ON h.id = s.hole_id
ORDER BY h.id, p.display_order;
```

### Live leaderboard (matches the app's calculation)
```sql
WITH hole_avg AS (
  SELECT hole_id, AVG(committed_sips)::numeric AS avg_sips, COUNT(*) AS n
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
    s.penalty_shot,
    ABS(s.committed_sips - ha.avg_sips) AS distance,
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
    AND h.is_practice = false  -- practice round doesn't count
)
SELECT
  p.name,
  COALESCE(SUM(committed_sips + distance_penalty + commitment_penalty), 0) AS total_score,
  COUNT(*) FILTER (WHERE penalty_shot) AS penalty_shots,
  COUNT(*) FILTER (WHERE completed = false) AS commitment_fails,
  COUNT(*) FILTER (WHERE distance_penalty = 0) AS spot_ons
FROM players p
LEFT JOIN scored ON scored.player_id = p.id
GROUP BY p.id, p.name
ORDER BY total_score ASC;
```

---

## Things to NEVER do

- ❌ Don't delete rows from `players` or `holes` (FK constraints + breaks app)
- ❌ Don't change `players.id` or `holes.id`
- ❌ Don't insert new rows in `game_state` — there's only ever `id=1`
- ❌ Don't set `phase` to a string outside `committing|reveal|drinking|scoring`
- ❌ Don't manually compute or insert score totals — the app computes on-the-fly from raw data

---

## Realtime

These tables broadcast changes to all connected clients:
- `scores` (INSERT, UPDATE)
- `game_state` (UPDATE)

Any change you make via SQL will instantly sync to all 6 phones. Be deliberate.
