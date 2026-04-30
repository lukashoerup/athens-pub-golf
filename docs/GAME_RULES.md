# Game Rules & Scoring — Athens Pub Golf

Reference for understanding *why* a score is what it is, and explaining mechanics to the group.

---

## The core game

- **6 players, 12 stops** (stop 1 = practice walk, doesn't count)
- All players drink the **same drink** at each stop
- Each player **secretly commits** to a number of sips before drinking
- After all commit, numbers are **revealed simultaneously**, group average is computed
- Players are scored **only** on the **distance penalty from the average** + commitment penalty, then **multiplied by the stop's `score_multiplier`** (1.0 for most stops, 1.5/2.0/2.5 for the last three). The number of sips itself contributes **zero points**.

**Lowest total after stop XII wins** (like real golf).

---

## Scoring formula

```
hole_total = ROUND( (distance_penalty + commitment_penalty) × score_multiplier )
```

The committed sips number has **no direct point value** — it's only used to compute the group average and the distance penalty.

### Distance penalty table

| `|committed - average|` | Penalty |
|---|---|
| ≤ 0.5 | +0 (spot on) |
| > 0.5, ≤ 1.0 | +1 |
| > 1.0, ≤ 1.5 | +2 |
| > 1.5, ≤ 2.0 | +3 |
| > 2.0 | +4 |

### Commitment penalty

| What you tap | Penalty |
|---|---|
| ✓ "Klarede det" | +0 |
| ✗ "Fejlede" | **+3** |

### Strategic implication

- Sips don't score — only the **distance from the group average** does
- The sweet spot is **exactly the average** (distance ≤ 0.5 → 0 penalty)
- Volume only matters via straf-shots (drinking penalties at extremes), not points

### Example (group avg = 4.0, no multiplier)

| Committed | Distance | Penalty | **Total** |
|---|---|---|---|
| 1 | 3.0 | +4 | 4 + straf-shot! |
| 2 | 2.0 | +3 | 3 |
| 3 | 1.0 | +1 | **1** |
| 4 | 0.0 | +0 | **0** ← winner |
| 5 | 1.0 | +1 | **1** |
| 6 | 2.0 | +3 | 3 |
| 8 | 4.0 | +4 | 4 + straf-shot! |

---

## Late-game score multiplier

The last three stops have weighted scoring — late-game mistakes hurt more.

| Stop | Multiplier | Example (raw 4 → final) |
|---|---|---|
| 10 (Beer Time) | × 1.5 | 4 → 6 |
| 11 (Drupes) | × 2.0 | 4 → 8 |
| 12 (BOO! Athens) | × 2.5 | 4 → 10 |

(Raw 4 = max distance penalty for being well off the average. Best possible per-hole score is still 0.)

Stored as `holes.score_multiplier` (NUMERIC). Default 1.0 for all other holes. Practice round (hole 1) ignores the multiplier since `is_practice = true` excludes it from the leaderboard regardless.

---

## Penalty shots (extra physical drinks, ZERO points)

Triggered automatically by the app at **commit time**. **Multiple rules can stack** — each triggered rule = one extra physical shot before the group moves on.

| Trigger | Reason code |
|---|---|
| Player commits **max sips** (per-hole, e.g. 8 on beer, 3 on shot, 6 on cocktail) | `'max'` |
| Player commits **1** (just nipping) | `'min'` |
| Player commits **same number as their previous hole** | `'same_as_last'` |

All triggered reasons are stored in `scores.penalty_shot_reasons` as a TEXT[]. The number of physical shots = `cardinality(penalty_shot_reasons)`.

**Stacking examples:**

| Scenario | Reasons | Shots |
|---|---|---|
| Commit 1 on hole 3 | `['min']` | 1 |
| Commit 1 on hole 4 (after 1 on hole 3) | `['min','same_as_last']` | **2** |
| Commit 8 on hole 4 (after 8 on hole 3, max=8) | `['max','same_as_last']` | **2** |
| Commit 4 on hole 4 (after 4 on hole 3) | `['same_as_last']` | 1 |
| Commit 4 on hole 2 (no prior) | `[]` | 0 |

**Exceptions**:
- `'same_as_last'` only triggers from hole 3 onwards (`currentHoleId > 2`)
- `'max'` and `'min'` apply on every hole including practice (hole 1)
- Penalty shots are **cosmetic on the scoreboard** (🥃 counter); the pain is purely physical

**Legacy reason code**: old data may have `'8'` (replaced by `'max'`). UI handles both.

---

## Cultural waypoints

In addition to the 12 drinking stops, the route includes **5 cultural sights** along the day-time path. They're informational only — not drinking stops, not scored. Stored in `waypoints` table; rendered in route timeline between holes via `after_hole_id`.

| ID | Name | After Stop | Why |
|---|---|---|---|
| 1 | Hadrians Port + Olympieion | II | Roman gate (132 AD) + Zeus temple (took 638 years to build) |
| 2 | Den Ukendte Soldats Grav (Evzones) | III | Vagtskifte hver hele time, fustanella med 400 plisseringer |
| 3 | Vindenes Tårn + Romersk Agora | V | 8-vejrsguder, hydraulisk vandur fra ~50 f.Kr. |
| 4 | Hephaistos-templet | VII | Bedst bevarede antikke græske tempel |
| 5 | Anafiotika | VIII | Cyclades-landsby midt i Plaka |

---

## Commitment check (the +3 lever)

After drinking, each player gets **two buttons**:
- ✓ "Klarede det" — no penalty
- ✗ "Fejlede (+III)" — 3 points added to this hole's score (before multiplier)

Honor system. The group polices each other.

---

## Practice round (stop 1)

- A walking beer (canned, from a kiosk) on the way from accommodation (Geor. Lachouri 3) to KARMINIO (Veikou 86)
- Players go through the full flow (commit, reveal, drink, ✓/✗) to learn the mechanics
- **Points DO NOT count** — `is_practice = true` excludes hole 1 from leaderboard sums
- Penalty shot rules: `'max'`/`'min'` still trigger; `'same_as_last'` does NOT (from hole 3 onwards only)

---

## Final scoreboard awards (after stop XII)

Computed client-side from raw scores:

| Award | Criterion |
|---|---|
| 🥇🥈🥉 Top 3 | Lowest total scores |
| 🎯 Sniper | Most spot-ons (distance ≤ 0.5) |
| 💀 Bunderen | Most commitment-fails (✗) |
| 🥃 Shame Champion | Most penalty shots (sum of array lengths) |
| 📐 Mr. Consistent | Lowest variance in committed sips |

Only "Top 3" affects winning. The rest are roast material.

---

## App phase flow per stop

```
COMMIT → REVEAL → DRINK → SCORE → (next stop)
```

1. **COMMIT**: Stepper screen, lock in. Other players show as "X af Y har committed" (no names — to prevent strategic waiting). Live preview of penalty rules that would trigger.
2. **REVEAL**: All numbers shown simultaneously with stagger animation. Average + per-player penalty shot list with reason breakdown.
3. **DRINK**: ✓/✗ commitment-check buttons. Status of who's answered shown.
4. **SCORE**: Hole breakdown (base + distance + commit penalty × multiplier), then live leaderboard (Stilling tab).
5. **Next**: Any player can click "FORTSÆT · STOP X+1" to advance.

After stop 12 → final scoreboard with awards.

---

## History tab visibility (secret commit protection)

A hole's commits are only visible to others **after** its committing phase ends:
- Past holes: all commits visible
- Current hole during `committing` phase: only your own commit visible to you; others see 🔒
- Current hole at `reveal` phase or later: all commits visible

This prevents the History tab from spoiling secret commits in progress. Same logic excludes pending commits from the live leaderboard.

---

## Host notes (Lukas-only)

Both `holes.host_notes` and `waypoints.host_notes` contain juicy historical anecdotes meant for telling the boys at the bar. They render in a gold-bordered "Til Lukas — værts-noter" box only when the logged-in player's name is `Lukas`. Other players see nothing different.

This is purely a UI gating — the data is in the public anon-readable tables. The "secret" is by convention only.
