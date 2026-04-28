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

| Trigger | Result |
|---|---|
| Player commits **8** sips | Penalty shot before next hole |
| Player commits **same number as their previous hole** | Penalty shot |

Exempt: hole 1 (practice) and hole 2 (no "previous hole" with real stakes). The "same as last" rule kicks in from hole 3 onward.

Penalty shots are **cosmetic on the scoreboard** (🥃 counter) and add no points. The pain is purely physical.

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
