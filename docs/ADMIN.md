# Admin Recipes — Athens Pub Golf

Ready-to-paste SQL for fixing common in-game issues.

**If you have Supabase MCP**: run via `execute_sql` on project `dxzexvudbxkidhydwylw`.
**If not**: paste into Supabase SQL Editor → `https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new`

> **For Claude reading this**: When the user describes a problem, identify the closest recipe below, fill in the variables (player name, hole number, etc.), and either run it directly (MCP mode) or respond with the SQL block + one-sentence explanation (manual mode). Don't lecture. Lukas is drunk. Be terse.

---

## Player names (for variable substitution)

`Nico` `Kris` `Misse` `Lukas` `Rasmus` `Rode`

---

## RECIPE 1: Wrong commit value

> "Misse meant 4 sips, not 5, on hole 5"

```sql
UPDATE scores
SET committed_sips = 4  -- new value
WHERE player_id = (SELECT id FROM players WHERE name = 'Misse')
  AND hole_id = 5;
```

⚠️ Only do this BEFORE the reveal phase. After reveal, everyone has seen the number — fixing it now silently changes the average and everyone's score. Better to use Recipe 5 (reset hole) if it matters.

---

## RECIPE 2: Wrong commitment-check (clicked ❌ but actually drank it)

> "Frederik trykkede ❌ ved en fejl"

```sql
UPDATE scores
SET completed = true
WHERE player_id = (SELECT id FROM players WHERE name = 'Frederik')
  AND hole_id = 7;
```

Reverse direction (changing ✅ to ❌):
```sql
UPDATE scores SET completed = false
WHERE player_id = (SELECT id FROM players WHERE name = 'Frederik')
  AND hole_id = 7;
```

The app recalculates the +3 penalty automatically based on this flag — no need to touch any score column.

---

## RECIPE 3: Add a missing score (player never committed)

> "We forgot to log Lukas on hole 4 — he committed 3"

```sql
INSERT INTO scores (player_id, hole_id, committed_sips, completed, penalty_shot, penalty_shot_reason)
VALUES (
  (SELECT id FROM players WHERE name = 'Lukas'),
  4,                  -- hole_id
  3,                  -- committed_sips
  true,               -- completed (true=drank, false=fail+3, null=not yet)
  false,              -- penalty_shot (true if 8 OR same as previous hole, manual)
  null                -- '8' or 'same_as_last' or null
);
```

If you're inserting and the player already has a row (rare race condition), use `ON CONFLICT (player_id, hole_id) DO UPDATE SET ...`.

---

## RECIPE 4: Force advance the phase

> "Phase is stuck on 'reveal' — push to drinking"

```sql
UPDATE game_state
SET phase = 'drinking'  -- or 'reveal' / 'scoring' / 'committing'
WHERE id = 1;
```

Valid phases: `committing`, `reveal`, `drinking`, `scoring`.

---

## RECIPE 5: Reset a hole completely (replay it)

> "We messed up hole 8, let's redo it from scratch"

```sql
DELETE FROM scores WHERE hole_id = 8;
UPDATE game_state SET current_hole = 8, phase = 'committing' WHERE id = 1;
```

This wipes all 6 commits + completed flags + penalty_shots for that hole, and sends everyone back to the commit screen. Realtime will sync all phones instantly.

---

## RECIPE 6: Skip to a specific hole

> "We're skipping ahead to hole 11"

```sql
UPDATE game_state
SET current_hole = 11, phase = 'committing'
WHERE id = 1;
```

⚠️ Doesn't delete prior scores. If you need to leave a clean slate, also:
```sql
DELETE FROM scores WHERE hole_id IN (9, 10);  -- holes you're skipping
```

---

## RECIPE 7: DNF a player for the rest of the trip

> "Rasmus is throwing up — DNF him on remaining holes"

```sql
INSERT INTO scores (player_id, hole_id, committed_sips, completed, penalty_shot, penalty_shot_reason)
SELECT
  (SELECT id FROM players WHERE name = 'Rasmus'),
  h.id,
  h.max_sips,   -- max sips = expensive base score
  false,        -- failed commitment = +3 each hole
  false,
  null
FROM holes h
WHERE h.id >= (SELECT current_hole FROM game_state WHERE id = 1)
  AND h.is_practice = false
ON CONFLICT (player_id, hole_id) DO UPDATE
SET committed_sips = EXCLUDED.committed_sips,
    completed = EXCLUDED.completed;
```

This DNFs them for current and all future real holes. Their score takes a beating, which is fair — they dropped out.

---

## RECIPE 8: Undo "Next Hole" click

> "We accidentally advanced from hole 5 to hole 6, go back"

```sql
UPDATE game_state
SET current_hole = 5, phase = 'scoring'
WHERE id = 1;
```

Existing hole 5 scores are untouched. The app will display them again as if you'd just landed on the scoring screen.

---

## RECIPE 9: Manually mark/unmark a penalty shot

> "Misse should have a penalty shot but it didn't trigger"

```sql
UPDATE scores
SET penalty_shot = true, penalty_shot_reason = '8'  -- or 'same_as_last'
WHERE player_id = (SELECT id FROM players WHERE name = 'Misse')
  AND hole_id = 6;
```

The penalty_shot is purely cosmetic in scoring — it's tracked in the leaderboard's "🥃" counter but doesn't add points (the +3 only applies via `completed = false`).

---

## RECIPE 10: Nuke and restart the entire game

> "We've completely lost the plot, start over from hole 1"

```sql
DELETE FROM scores;
UPDATE game_state SET current_hole = 1, phase = 'committing' WHERE id = 1;
```

Clean slate. Players keep their accounts; all scores wiped.

---

## RECIPE 11: Change a player's name (typo, etc.)

```sql
UPDATE players SET name = 'Nicolai' WHERE name = 'Nico';
```

Be aware: the `name` column has a UNIQUE constraint. If you're swapping names between two players, do it via a temp value:
```sql
UPDATE players SET name = '__tmp' WHERE name = 'Nico';
UPDATE players SET name = 'Nico' WHERE name = 'Kris';
UPDATE players SET name = 'Kris' WHERE name = '__tmp';
```

---

## Diagnostic shortcuts

### "What's happening right now?"
```sql
SELECT current_hole, phase FROM game_state WHERE id = 1;

SELECT p.name, s.committed_sips, s.completed
FROM scores s JOIN players p ON p.id = s.player_id
WHERE s.hole_id = (SELECT current_hole FROM game_state WHERE id = 1)
ORDER BY p.display_order;
```

### "Show me the leaderboard"
See [DATABASE.md → Live leaderboard](./DATABASE.md#live-leaderboard-matches-the-apps-calculation).

---

## Notes for Claude

- **Always echo back the player name + hole + action** in plain English BEFORE the SQL block, e.g. "Setting Misse's hole 6 commitment-check to ✅:". This lets Lukas catch mistakes before pasting.
- **Don't combine recipes** unless the user clearly asks for it. Smaller queries = easier to verify what changed.
- **Realtime side-effects**: Any UPDATE to `scores` or `game_state` instantly pushes to all 6 phones. Mention this if it might surprise the user.
- **Practice round = hole 1**, `is_practice = true`. Scores there don't count toward leaderboard. The leaderboard query already excludes it.
- The DB has a UNIQUE constraint on `(player_id, hole_id)` — re-inserting a score for the same player/hole will fail unless you use ON CONFLICT.
