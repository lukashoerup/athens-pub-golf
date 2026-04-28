# Athens Pub Golf — Claude context primer

> **You are reading this because Lukas has asked you to help fix something in the Athens Pub Golf app, probably from his phone, probably mildly drunk, in Athens. Be terse and helpful. Don't lecture.**

---

## ⚡ QUICK REFERENCE — all the URLs and IDs you'll need

| What | Where |
|---|---|
| **Live app** (share with players) | https://athens-pub-golf-app-prod.vercel.app |
| **Supabase SQL Editor** (paste-and-run) | https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new |
| **Supabase project ID** | `dxzexvudbxkidhydwylw` (region eu-west-1, name "AthenApp") |
| **Vercel project name** | `athens-pub-golf-app` (Lukas's personal Hobby team) |
| **GitHub repo** | `lukashoerup/athens-pub-golf` (**public** — fetch docs directly) |
| **Raw doc URLs** | `https://raw.githubusercontent.com/lukashoerup/athens-pub-golf/main/<file>` |
| **Default branch** | `main` (auto-deploys to Vercel on push) |

If you have **Supabase MCP** connected (tool name pattern `mcp__*__execute_sql`), run SQL directly against project `dxzexvudbxkidhydwylw`. If not, output ready-to-paste SQL that Lukas pastes into the SQL Editor on his phone.

---

## What this app is

A real-time multiplayer pub-golf scoring webapp for **6 players** (Nico, Kris, Misse, **Lukas (host)**, Rasmus, Rode) playing **12 stops** across Athens over 1 day. Stop 1 is a practice round — points don't count.

- **Stack**: Next.js 15 (App Router) + Supabase (Postgres + Realtime, 4 tables) + Tailwind, hosted on Vercel
- **Anon-key auth** — the app uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel env vars; no user-level auth. The anon role has full read/write access by design.
- **Realtime tables**: `scores`, `game_state`, `holes`, `waypoints` — UPDATEs broadcast to all 6 phones instantly.

---

## How you help during the trip

### Mode A — Supabase MCP available
You can run SQL directly. Project ID: `dxzexvudbxkidhydwylw`.

1. Lukas describes a problem ("Misse trykkede ❌ ved en fejl på hul 6")
2. Read [`docs/ADMIN.md`](docs/ADMIN.md) for the closest recipe
3. **Run the SQL via `execute_sql`** against project `dxzexvudbxkidhydwylw`
4. **Echo back what you did** in plain English so Lukas can verify
5. Don't ask permission for routine fixes — Lukas wants autonomous behavior. Do confirm before destructive ops on multiple holes (e.g. "this will reset 3 holes — proceed?").

### Mode B — No Supabase MCP

1. Read [`docs/ADMIN.md`](docs/ADMIN.md) for the closest recipe
2. Respond with **ready-to-paste SQL** + a one-line description
3. Lukas pastes into the SQL Editor URL above on his phone

---

## Read these in order

1. **[`docs/ADMIN.md`](docs/ADMIN.md)** ⭐ — copy-paste SQL recipes for in-game fixes (player wrongly clicked, replace a stop, reset a hole, etc.)
2. **[`docs/DATABASE.md`](docs/DATABASE.md)** — full schema (4 tables), diagnostic queries, leaderboard SQL
3. **[`docs/GAME_RULES.md`](docs/GAME_RULES.md)** — scoring math, phase flow, penalty rules, multipliers, waypoints

If a problem doesn't match a recipe in ADMIN.md, fall back to DATABASE.md to write custom SQL.

---

## Critical rules for any SQL you generate

- ✅ Always reference players by **name** via subquery: `(SELECT id FROM players WHERE name = 'Misse')` — never UUIDs
- ✅ Always echo the action in plain English **before** the SQL block, e.g. "Setting Misse's hole 6 ✓:"
- ✅ Mention if the change will broadcast to all 6 phones (any UPDATE on `scores`, `game_state`, `holes`, `waypoints` will)
- ✅ For penalty shot reasons, use the array column: `penalty_shot_reasons TEXT[]`. Valid values: `'max'`, `'min'`, `'same_as_last'`. Legacy `'8'` may exist.
- ❌ Don't combine multiple recipes into one query unless explicitly asked
- ❌ Don't compute or insert score totals — the app calculates them on-the-fly from raw data via `lib/scoring.ts`
- ❌ Don't touch `players.id` or `holes.id`, or insert new rows in `game_state`
- ❌ Don't suggest building admin UIs, Telegram bots, etc. — Lukas chose the SQL-recipe workflow deliberately

---

## State machine cheat sheet

```
committing → reveal → drinking → scoring → (next hole, current_hole++) → committing
```

- `committing`: players locking in sips. Auto-advances to `reveal` when all 6 commit.
- `reveal`: numbers shown, average computed. Manual advance to `drinking`.
- `drinking`: ✓/✗ commitment-check active. Auto-advances to `scoring` when all 6 answer.
- `scoring`: shows hole results + leaderboard. Manual advance to next hole.

A phase is "stuck" if Realtime didn't fire — fix with `UPDATE game_state SET phase = '...' WHERE id = 1`.

---

## Key features (so you don't suggest things that already exist)

- **Score multipliers**: holes 10/11/12 have ×1.5/×2.0/×2.5 (column `holes.score_multiplier`)
- **Stacking penalty shots**: `scores.penalty_shot_reasons TEXT[]` — multiple rules can trigger per commit. E.g. committing 1 twice = `['min','same_as_last']` = 2 shots.
- **Cultural waypoints**: `waypoints` table for sights between drinking stops; rendered in route timeline
- **Host notes**: `holes.host_notes` and `waypoints.host_notes` contain anecdotes shown ONLY when player.name = 'Lukas'
- **Dynamic hole count**: app reads count from DB; adding a 13th stop "just works" via INSERT
- **Route timeline reveal logic**: future stops show name + district but DRINK is hidden until arrival
- **History tab secret-protection**: pending commits on the current hole are masked with 🔒 from other players until reveal

---

## Tone

Lukas is on a phone. Possibly drunk. He needs:
- Short response
- SQL block at the top (or confirmation that you ran it)
- One sentence of context if needed
- No "I'd be happy to help! Let me first..." preamble
