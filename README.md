# Athens Pub Golf ⛳

12 stops · 6 spillere · 1 dag i Athen.

Real-time multiplayer pub-golf med hemmelige commits, distance-baseret scoring, og kulturelle stops mellem barerne.

---

## ⚡ Quick Reference (alt det du måske skal bruge på mobilen)

| Hvad | URL / ID |
|---|---|
| **Live app** (deles med spillere) | https://athens-pub-golf-app-prod.vercel.app |
| **Supabase SQL Editor** (paste-and-run) | https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new |
| **Supabase project ID** | `dxzexvudbxkidhydwylw` |
| **Vercel project** | `athens-pub-golf-app` (Hobby) |
| **GitHub** | `lukashoerup/athens-pub-golf` (public — claude.ai kan fetche docs direkte) |
| **Default branch** | `main` (auto-deploy til Vercel ved push) |

**Spillere (6):** Nico, Kris, Misse, Lukas (host), Rasmus, Rode  
**Stops (12):** se `docs/DATABASE.md` for den fulde rute

---

## Stack

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS
- **Database + Realtime:** Supabase (4 tables: `players`, `holes`, `waypoints`, `scores`, `game_state`)
- **Hosting:** Vercel (Hobby tier, auto-deploy fra GitHub)
- **Auth:** Ingen — anon-key bruges, FK + UNIQUE constraints sikrer integritet

---

## Under turen — fix ting via Claude på mobil

Hvis noget går galt under turen og du har brug for at fikse DB'en fra mobilen:

1. **Åbn [claude.ai](https://claude.ai)** på mobilen, ny chat.
2. **Første besked — copy/paste denne:**
   > Læs https://raw.githubusercontent.com/lukashoerup/athens-pub-golf/main/CLAUDE.md og hjælp mig med Athens Pub Golf-spillet.
3. Claude fetcher `CLAUDE.md`, ser Quick Reference og alle URLs, og fetcher `docs/ADMIN.md` ved behov.
4. **Beskriv problemet** på dansk: *"Misse trykkede ❌ ved en fejl på hul 6"*
5. **Claude returnerer ready-to-paste SQL** (eller eksekverer direkte hvis Supabase-MCP er aktiv på din claude.ai-konto).
6. **Åbn SQL Editor** (URL i Quick Reference) → paste → Run.

Se `docs/ADMIN.md` for alle 15+ recipes direkte. Repoet er public, så claude.ai kan læse alt uden auth.

### Bookmark inden afrejse

- 📋 **Supabase SQL Editor**: `https://supabase.com/dashboard/project/dxzexvudbxkidhydwylw/sql/new`
- 🌐 **Live app**: `https://athens-pub-golf-app-prod.vercel.app`
- 🤖 **claude.ai**: log ind på telefonen og opret en ny chat-tråd
- 📁 **GitHub repo**: `https://github.com/lukashoerup/athens-pub-golf`

---

## Lokal udvikling

```bash
cp .env.local.example .env.local
# Udfyld NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY
# Værdier ligger i Vercel project settings → Environment Variables
npm install
npm run dev
```

App'en kører på `localhost:3000`.

---

## Deploy

Hver push til `main` auto-deploys til Vercel.

**Commit author skal være `lukas@hoerup.dk`** — Vercel Hobby blocker deploys fra "external contributors" på private repos. Verificer med:
```bash
git config user.email
# Skal returnere: lukas@hoerup.dk
```

Hvis du rebaser/ændrer commits og forfatter er forkert: `git filter-branch --env-filter 'GIT_AUTHOR_EMAIL="lukas@hoerup.dk" GIT_COMMITTER_EMAIL="lukas@hoerup.dk"' HEAD` derefter `git push --force-with-lease`.

---

## Dokumentation (read in order)

| Fil | Indhold |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Entry-point primer for any Claude reading the repo |
| [`docs/ADMIN.md`](docs/ADMIN.md) ⭐ | SQL recipes for typiske in-game fixes |
| [`docs/DATABASE.md`](docs/DATABASE.md) | Schema reference + diagnostiske queries |
| [`docs/GAME_RULES.md`](docs/GAME_RULES.md) | Scoring formula, phase flow, penalty rules |
| [`supabase/schema.sql`](supabase/schema.sql) | Kanonisk DDL (kør for at recreate DB fra scratch) |
