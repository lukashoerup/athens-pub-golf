# Athens Pub Golf — Claude context primer

> **You are reading this because Lukas has asked you to help fix something in the Athens Pub Golf app, probably from his phone, probably mildly drunk, in Athens. Be terse and helpful. Don't lecture.**

## What this app is

A real-time multiplayer pub-golf scoring webapp for 6 players (Nico, Kris, Misse, Lukas, Rasmus, Rode) playing 12 holes across Athens over 1 day. Hole 1 is a practice round — points don't count.

- **Stack**: Next.js 15 (App Router) + Supabase (Postgres + Realtime) + Tailwind, hosted on Vercel
- **Live URL**: see Vercel dashboard
- **Repo**: `lukashoerup/athens-pub-golf`

## How you help during the trip

**There are two modes depending on what tools you have:**

### Mode A — You have Supabase MCP (`mcp__*__execute_sql` available)
You can run SQL directly against the DB. Project ID: `dxzexvudbxkidhydwylw`.

1. Lukas describes a problem ("Misse trykkede ❌ ved en fejl på hul 6")
2. You read [`docs/ADMIN.md`](docs/ADMIN.md) for the right recipe
3. **Run the SQL directly** via `execute_sql` against project `dxzexvudbxkidhydwylw`
4. **Echo back what you did** in plain English so Lukas can verify
5. Don't ask permission for routine fixes — Lukas wants autonomous behavior. Do confirm before destructive ops on multiple holes (e.g. "this will reset 3 holes — proceed?").

### Mode B — No Supabase MCP available (fallback)

1. Read [`docs/ADMIN.md`](docs/ADMIN.md) for the right recipe
2. Respond with **ready-to-paste SQL** + a one-line description
3. Lukas pastes it into Supabase SQL Editor on his phone:
   `https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new`

## Read these in order when helping

1. **[`docs/ADMIN.md`](docs/ADMIN.md)** ⭐ — copy-paste SQL recipes for the 11 most common fixes
2. **[`docs/DATABASE.md`](docs/DATABASE.md)** — full schema, diagnostic queries, leaderboard SQL
3. **[`docs/GAME_RULES.md`](docs/GAME_RULES.md)** — scoring math, phase flow, penalty rules

If a problem doesn't match a recipe in ADMIN.md, fall back to DATABASE.md to write custom SQL.

## Critical rules for any SQL you generate

- ✅ Always reference players by **name** via subquery: `(SELECT id FROM players WHERE name = 'Misse')` — never UUIDs
- ✅ Always echo the action in plain English **before** the SQL block, e.g. "Setting Misse's hole 6 ✅:"
- ✅ Mention if the change will broadcast to all 6 phones (any UPDATE on `scores` or `game_state` will)
- ❌ Don't combine multiple recipes into one query unless explicitly asked
- ❌ Don't compute or insert score totals — the app calculates them on-the-fly from raw data
- ❌ Don't touch `players.id`, `holes.id`, or insert new rows in `game_state`
- ❌ Don't suggest building admin UIs, Telegram bots, etc. — Lukas chose the SQL-recipe workflow deliberately

## State machine cheat sheet

```
committing → reveal → drinking → scoring → (next hole) → committing
```

- `committing`: players locking in sips
- `reveal`: numbers shown, average computed
- `drinking`: ✅/❌ commitment-check active
- `scoring`: hole results + leaderboard

A phase is "stuck" if Realtime didn't fire — fix with `UPDATE game_state SET phase = '...' WHERE id = 1`.

## Tone

Lukas is on a phone. Possibly drunk. He needs:
- Short response
- SQL block at the top
- One sentence of context if needed
- No "I'd be happy to help! Let me first..." preamble
