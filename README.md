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
- **TripMember** - kelionės dalyviai (su kvietimo statusu)
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

3. Paleiskite migraciją (prieš DB, į kurią rodo `DATABASE_URL`):

```bash
npm run db:deploy
```
arba `npx prisma migrate deploy`

4. Production’e nustatykite **NEXTAUTH_URL** (pvz. `https://travel-portal-mu.vercel.app`) ir **NEXTAUTH_SECRET**.

**Kvietimo dalyvio funkcija production’e:** jei prod grąžina „Vartotojas su šiuo el. paštu nerastas“, o local veikia – žr. [docs/PRODUCTION-INVITE-SETUP.md](docs/PRODUCTION-INVITE-SETUP.md) (DB, migracijos, vartotojai prod DB, NEXTAUTH_URL, RLS).

## Licencija

Privatus projektas.
