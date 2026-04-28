# Game Rules & Scoring — Athens Pub Golf

Reference for understanding *why* a score is what it is, and explaining mechanics to the group.

---

## The core game

- **6 players, 12 holes** (hole 1 = practice, doesn't count)
- All players drink the **same drink** at each stop
- Each player **secretly commits** to a number of sips before drinking
- After all commit, numbers are **revealed simultaneously**, group average is computed
- Players are scored on **committed sips + distance penalty from the average**

**Lowest total after 12 holes wins** (like real golf).

---

## Scoring formula

```
hole_score = committed_sips
           + distance_penalty (based on |committed - group_avg|)
           + commitment_penalty (3 if you failed to drink it, else 0)
```

### Distance penalty table

| `|committed - average|` | Penalty |
|---|---|
| ≤ 0.5 | +0 |
| > 0.5, ≤ 1.0 | +1 |
| > 1.0, ≤ 1.5 | +2 |
| > 1.5, ≤ 2.0 | +3 |
| > 2.0 | +4 |

### Strategic implication

- Fewer sips = lower base, but higher risk of being far from average
- More sips = safer (close to crowd) but expensive base
- The sweet spot is **just below average** — typically same total score as hitting the average exactly, but bolder

### Example (group avg = 4.0)

| Committed | Base | Distance | Penalty | **Total** |
|---|---|---|---|---|
| 1 | 1 | 3.0 | +4 | 5 |
| 2 | 2 | 2.0 | +3 | 5 |
| 3 | 3 | 1.0 | +1 | **4** ← winner |
| 4 | 4 | 0.0 | +0 | **4** ← winner |
| 5 | 5 | 1.0 | +1 | 6 |
| 6 | 6 | 2.0 | +3 | 9 |
| 8 | 8 | 4.0 | +4 | 12 |

---

## Penalty shots (extra physical drinks, ZERO points)

Triggered automatically by the app at **commit time**:

| Trigger | Reason code | Result |
|---|---|---|
| Player commits **max sips** (per-hole, e.g. 8 on beer, 3 on shot) | `'max'` | Penalty shot before next hole |
| Player commits **1** (just nipping) | `'min'` | Penalty shot |
| Player commits **same number as their previous hole** | `'same_as_last'` | Penalty shot |

Exempt: hole 1 (practice) and hole 2 (no "previous hole" with real stakes). The "same as last" rule kicks in from hole 3 onward. The `max` and `min` rules apply on every hole including practice.

Note: max varies per hole (8 for beer, 6 for cocktail/coffee, 5 for taster, 3 for shot). The penalty scales — committing 3 on a shot triggers `'max'` just like committing 8 on a beer.

Penalty shots are **cosmetic on the scoreboard** (🥃 counter) and add no points. The pain is purely physical.

Legacy reason code: `'8'` (replaced by `'max'`). Old rows from before this change may still use `'8'`; the UI handles both.

---

## Commitment check (the +3 lever)

After drinking, each player gets **two buttons**:
- ✅ "Klarede det" — no penalty
- ❌ "Fejlede (+3)" — 3 points added to this hole's score

Honor system. The group polices each other.

---

## Practice round (hole 1)

- A walking beer (canned, from a kiosk) on the way from accommodation to KARMINIO
- Players go through the full flow (commit, reveal, drink, ✅/❌) to learn the mechanics
- **Points DO NOT count** — `is_practice = true` excludes hole 1 from leaderboard sums
- Penalty shot rules don't apply on hole 1 → 2 transition (the "same as last" check starts from hole 3)

---

## Late-game score multiplier

The last three real holes have weighted scoring — late-game mistakes hurt more.

| Stop | Multiplier | Example |
|---|---|---|
| 10 (Barley Cargo R2) | × 1.5 | Score 4 → counts as 6 |
| 11 (STOA Athens) | × 2.0 | Score 4 → counts as 8 |
| 12 (BOO! Athens) | × 2.5 | Score 4 → counts as 10 |

Stored as `holes.score_multiplier` (NUMERIC). Default 1.0 for all other holes. Practice round (hole 1) ignores the multiplier since it doesn't count anyway.

The leaderboard formula multiplies the raw hole score (`base + distance + commitment`) by `holes.score_multiplier` then rounds to integer:

```
hole_total = ROUND( (committed_sips + distance_penalty + commitment_penalty) * score_multiplier )
```

## Final scoreboard awards (after hole 12)

Computed client-side from raw scores:

| Award | Criterion |
|---|---|
| 🥇🥈🥉 Top 3 | Lowest total scores |
| 🎯 Sniper | Most spot-ons (distance ≤ 0.5) |
| 💀 Bunderen | Most commitment-fails (❌) |
| 🥃 Shame Champion | Most penalty shots |
| 📐 Mr. Consistent | Lowest variance in committed sips |

Only "Top 3" affects winning. The rest are roast material.

---

## App phase flow per hole

```
COMMIT → REVEAL → DRINK → SCORE → (next hole)
```

1. **COMMIT**: Stepper screen, lock in. Other players show as "X/6 har committed" (no names — to prevent strategic waiting).
2. **REVEAL**: All numbers shown simultaneously with stagger animation. Average + penalty shot warnings displayed.
3. **DRINK**: ✅/❌ commitment-check buttons. Status of who's answered shown.
4. **SCORE**: Hole breakdown (base + distance + commit penalty), then live leaderboard.
5. **Next**: Any player can click "NÆSTE HUL" to advance.

After hole 12 → final scoreboard with awards.
