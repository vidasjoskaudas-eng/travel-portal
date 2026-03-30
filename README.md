# Travel Portal

Privatus kelionių portalas draugams. Planuokite keliones, dalinkitės idėjomis ir kurkite prisiminimus kartu.

## Technologijos

- **Next.js 16** (App Router, TypeScript)
- **Prisma ORM** + SQLite (development) / PostgreSQL (production)
- **NextAuth.js** - autentifikacija
- **Tailwind CSS** - stiliai

## Pradžia

### 1. Įdiekite priklausomybes

```bash
npm install
```

### 2. Sukonfigūruokite aplinkos kintamuosius

Sukurkite `.env` failą projekto šaknyje:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sugeneruokite-atsitiktinį-slaptažodį"
NEXTAUTH_URL="http://localhost:3000"
```

**Pastaba:** Production aplinkoje pakeiskite `NEXTAUTH_SECRET` į tikrą atsitiktinį slaptažodį.
**Pastaba:** Supabase nuotraukų upload'ui nukopijuokite `.env.local.example` į `.env.local` ir užpildykite reikšmes.

### 3. Sukurkite duomenų bazę

```bash
npx prisma migrate dev
```

### 4. Paleiskite development serverį

```bash
npm run dev
```

Atsidarykite [http://localhost:3000](http://localhost:3000) naršyklėje.

## Funkcijos

- **Vartotojų registracija ir prisijungimas**
- **Kelionių kūrimas** - nustatykite pavadinimą, tikslą, datas
- **Dalyvių kvietimas** - pakvieskite draugus el. paštu
- **Veiklų planavimas** - pridėkite veiklas su vieta, laiku ir kaina
- **Statistika** - matykite dalyvių skaičių ir bendrą kainą

## Projekto struktūra

```
src/
├── app/                    # Next.js App Router puslapiai
│   ├── api/               # API routes
│   ├── dashboard/         # Pagrindinis dashboard
│   ├── login/             # Prisijungimo puslapis
│   ├── register/          # Registracijos puslapis
│   └── trips/             # Kelionių puslapiai
├── components/            # React komponentai
│   ├── layout/           # Layout komponentai (Navbar)
│   ├── providers/        # Context providers
│   └── ui/               # UI komponentai (Button, Card, Input)
├── lib/                   # Utility funkcijos
│   ├── auth.ts           # NextAuth konfigūracija
│   └── db.ts             # Prisma klientas
└── types/                 # TypeScript tipai
```

## Duomenų bazės modeliai

- **User** - vartotojai
- **Trip** - kelionės
- **TripParticipant** - kelionės dalyviai (organizatorius ir dalyviai)
- **Activity** - kelionės veiklos

## Production deployment

### PostgreSQL konfigūracija

1. Pakeiskite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Atnaujinkite `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

3. Production DB migracijos: `npm run build` jau paleidžia **`prisma migrate deploy`** prieš `next build` (Vercelyje būtina nustatyti `DATABASE_URL` build aplinkai). Rankiniu būdu: `npm run db:deploy`.

4. Production’e nustatykite **NEXTAUTH_URL** (pvz. `https://travel-portal-mu.vercel.app`) ir **NEXTAUTH_SECRET**.

**Kvietimo dalyvio funkcija production’e:** jei prod grąžina „Vartotojas su šiuo el. paštu nerastas“, o local veikia – žr. [docs/PRODUCTION-INVITE-SETUP.md](docs/PRODUCTION-INVITE-SETUP.md) (DB, migracijos, vartotojai prod DB, NEXTAUTH_URL, RLS).

## Supabase setup (Activity nuotraukoms)

1. Supabase Dashboard → **Project Settings** → **API**.
2. Nukopijuokite **Project URL**, **anon/publishable key** ir **service_role key**.
3. Nukopijuokite `.env.local.example` į `.env.local` ir įrašykite:

```env
NEXT_PUBLIC_SUPABASE_URL=<cia mano URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cia mano publishable key>
SUPABASE_SERVICE_ROLE_KEY=<cia mano service role key>
```

4. Perkraukite `npm run dev` ir patikrinkite Activity nuotraukų upload'ą.

### Production (Vercel / hostingas)

Hostinge nustatykite šiuos Environment Variables (Production):

- `DATABASE_URL` (ta pati Supabase Postgres kaip local arba atskira prod DB)
- `NEXTAUTH_URL` — pilnas tavo domenas, pvz. `https://tavo-projektas.vercel.app` (be slash pabaigoje)
- `NEXTAUTH_SECRET` — tas pats slaptas kaip local arba naujas, bet stabilus
- `AUTH_TRUST_HOST=true` — rekomenduojama Vercel / custom domenui (kad NextAuth priimtų viešą hostą)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Publishable / `sb_publishable_...`)
- `SUPABASE_SERVICE_ROLE_KEY` (Secret / `sb_secret_...` arba legacy `service_role` JWT)

Po suvedimo padarykite **Redeploy**.

Jei viešame URL upload neveikia: atsidarykite `https://<jūsų-domenas>/api/health/deployment` — skiltyje `env` visi laukai turi būti `true`. Jei `hasNextAuthUrl` arba `hasSupabaseServiceRole` yra `false`, sutvarkykite kintamuosius hostinge.

### Test plan (dev/prod)

- **Upload**: atsidarykite kelionę → veiklą → įkelkite nuotrauką + komentarą.
- **Delete**: paspauskite **Šalinti** ant nuotraukos.
- **Refresh**: perkraukite puslapį ir patikrinkite, kad sąrašas teisingas.

## Licencija

Privatus projektas.
