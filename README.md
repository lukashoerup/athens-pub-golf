# Athens Pub Golf ⛳

12 huller · 6 spillere · 1 dag i Athen

## Setup

### 1. Supabase

1. Gå til [supabase.com](https://supabase.com) og opret et gratis projekt
2. Gå til **SQL Editor** og kør hele `supabase/schema.sql`
3. Gå til **Database → Replication** og aktivér realtime for `scores` og `game_state`
4. Kopiér **Project URL** og **anon public key** fra **Settings → API**

### 2. Opdater spillernavne

Ret direkte i `supabase/schema.sql` under `SEED: Players`, eller kør i SQL Editor:

```sql
UPDATE players SET name = 'Rigtig Navn' WHERE name = 'Spiller 5';
UPDATE players SET name = 'Andet Navn' WHERE name = 'Spiller 6';
```

### 3. Lokalt udviklingsmiljø

```bash
cp .env.local.example .env.local
# Udfyld NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

### 4. Deploy til Vercel

1. Push til GitHub
2. Opret projekt på [vercel.com](https://vercel.com) og connect til repo
3. Tilføj environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — del URL med gutterne

---

## Admin (under turen)

Bogmærk Supabase SQL Editor på din telefon:
`https://supabase.com/dashboard/project/[DIT-PROJEKT-ID]/sql`

Alle nyttige SQL-kommandoer er i bunden af `supabase/schema.sql`.

---

## Stack

- **Frontend:** Next.js 15 (App Router)
- **Database + Realtime:** Supabase (gratis tier)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (gratis tier)
