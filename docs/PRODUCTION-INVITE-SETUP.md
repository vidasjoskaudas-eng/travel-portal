# Production: kvietimo dalyvio sutvarkymas

Kad **production** (pvz. Vercel) elgtųsi taip pat kaip **local** (kvietimas pagal el. paštą, 200 / 409 / 400), reikia sutvarkyti DB, env ir auth. Šiame faile – tikslus checklist ir žingsniai.

---

## 1. DB ir migracijos

### 1.1 Ar local ir prod naudoja tą pačią DB?

- **Jei local** `.env` turi `DATABASE_URL` į **Supabase** (PostgreSQL), o **Vercel** env turi **kitą** `DATABASE_URL` (kitą projektą ar kitą DB) – tada **production** mato **kitą** duomenų bazę.
- Kvietimas „veikia“ local, nes vartotojas X yra **local DB** (arba tavo local nurodo į tą pačią Supabase kaip prod, bet tada problema būtų kitur).

**Ką padaryti:**

- Nuspręsk, kuri DB yra **production**:
  - **A variantas:** Production = ta pati Supabase DB, į kurią rodai ir local (tada vartotojai vieni ir tie patys).
  - **B variantas:** Production = atskira Supabase DB (tada **prod kvietimai veikia tik su vartotojais, užregistruotais production** – t.y. per https://travel-portal-mu.vercel.app/register).

### 1.2 Vercel env: DATABASE_URL

- **Vercel** → Project → **Settings** → **Environment Variables**.
- Įsitikink, kad **Production** (ir Preview, jei naudoji) turi:
  - **`DATABASE_URL`** = connection string į **tą** Supabase Postgres DB, kurią naudoji production’ui.

Prisma naudoja tik `DATABASE_URL` (schema neturi `directUrl`). Supabase dashboard:

- **Project Settings** → **Database** → **Connection string** → **URI**.
- Naudok **Session mode** arba **Transaction mode** URI (portas dažniausiai 6543 su pooleriu). Rolė turi būti tokia, kuri **apeina RLS** (žr. skyrių 4).

### 1.3 Paleisti migracijas prieš production DB

Kad production schema būtų tokia pati kaip local (User, Trip, TripParticipant ir t.t.):

**Variantas A – iš savo kompiuterio (su prod URL):**

1. Lokaliai sukurk `.env.production` arba laikinai nustatyk `DATABASE_URL` į **production** Supabase URL.
2. Paleisk:
   ```bash
   npx prisma migrate deploy
   ```
   (Arba `npm run db:deploy`, jei naudoji scriptą iš šio projekto.)
3. Tai pritaiko visas `prisma/migrations/*` prie tos DB, į kurią rodo `DATABASE_URL`.

**Variantas B – Vercel build:**

- Įsitikink, kad `package.json` build arba postinstall **nepaleidžia** `prisma migrate deploy` automatiškai (dažniausiai deploy daromas rankiniu būdu arba per CI). Jei nori migracijas paleisti tik prieš prod DB, naudok **Variantą A** su prod `DATABASE_URL`.

**Rezultatas:** Production DB turi lenteles `User`, `Trip`, `TripParticipant` ir t.t., kaip po `prisma migrate dev` local.

> Pastaba: `prisma/migrations_sqlite_backup/*` yra istorinės SQLite atsarginės migracijos (legacy) ir production'e nenaudojamos. Jos paliktos tik istorijai.

---

## 2. User duomenys production DB

Klaida *„Vartotojas su šiuo el. paštu nerastas. Jis turi būti registruotas sistemoje.“* production’e dažniausiai reiškia:

- **Tas el. paštas nėra `User` lentelėje production DB.**

Jei vartotoją X sukūrei tik **local** (arba kitoje DB), production to vartotojo nemato.

**Ką padaryti:**

1. **Patikrinti production DB:**  
   Supabase → **Table Editor** → **User** – ar yra eilutė su tavo testiniu el. paštu.

2. **Jei nėra – vartotoją sukurti production’e:**
   - Eik į **https://travel-portal-mu.vercel.app/register**
   - Užsiregistruok su tuo pačiu el. paštu, kurį testuosi kvietime.
   - Po to tas vartotojas atsiranda **production** `User` lentelėje.

3. **Dokumentuoti:** Kvietimai production’e veikia tik su vartotojais, kurie yra **production** DB (t.y. užsiregistravo production’e arba buvo įkelti į prod DB).

---

## 3. Auth / NEXTAUTH_URL / sesijos

Kvietimo route naudoja **session** (organizatoriaus `session.user.id`) ir **request body** (el. paštas kviestinam). Kad prod elgtųsi kaip local:

### 3.1 NEXTAUTH_URL

- **Vercel** → Environment Variables.
- **Production** turi turėti:
  ```env
  NEXTAUTH_URL=https://travel-portal-mu.vercel.app
  ```
- Be **trailing slash**. Jei būtų `http://...` arba kitas domenas, sesijos / callback gali sulūžti.

### 3.2 NEXTAUTH_SECRET

- Turi būti nustatytas production’e (tas pats slaptažodis, kurį naudoji NextAuth).
- Jei keiti domeną ar secret, vartotojai gali būti atjungti.

### 3.3 Prisijungimas / registracija production’e

- Eik į https://travel-portal-mu.vercel.app/login ir https://travel-portal-mu.vercel.app/register.
- Įsitikink, kad prisijungus sesija veikia (pvz. matai dashboard, keliones).
- Registruoti vartotojai turi atsirasti **toje pačioje** DB, kuri nurodyta production `DATABASE_URL` (žr. skyrių 1 ir 2).

Tada kvietimo route production’e mato `session.user.id` ir `session.user.email` taip pat kaip local (tik duomenys skaitomi iš production DB).

---

## 4. RLS / DB rolė

- Aplikacija į DB eina **tik per Prisma** ir **DATABASE_URL**. Supabase JS klientas nenaudojamas.
- RLS „deny all“ veikia **tik tada**, kai užklausas vykdo rolė, kuriai RLS taikomas. Jei `DATABASE_URL` jungiasi kaip **postgres** (arba kita rolė su BYPASSRLS), Prisma užklausos **apeina** RLS.

**Ką patikrinti:**

- Supabase **Database** → **Connection string** – naudok **URI**, kuri naudoja **postgres** user (standartinis Supabase connection string).
- **Nenaudok** anon / authenticated key kaip DB user slaptažodžio connection string’e – tai skirta Supabase JS client, ne Prisma.

Jei production’e matytum 500 arba „permission denied“ (žinutės ar loguose), būtų įtarta, kad connection eina su role, kurią veikia RLS. Tada reikėtų pakeisti `DATABASE_URL` į connection string su **postgres** role iš Supabase dashboard.

---

## 5. Galutinis patikrinimas

Kai viskas nustatyta:

1. **Deploy** (Vercel) su atnaujintais env (jei ką keitei).
2. **Testavimas:**

| Vieta   | Veiksmas | Laukiamas rezultatas |
|--------|----------|------------------------|
| Local  | `/trips/1/invite` → el. paštas X (egzistuoja, nėra dalyvis) | 200, „Kvietimas išsiųstas“ |
| Prod   | `/trips/1/invite` → tas pats X (X yra prod DB)              | 200, „Kvietimas išsiųstas“ |
| Prod   | Tą patį X pakviesti antrą kartą                             | 409, „Šis vartotojas jau yra dalyvis.“ |
| Prod   | El. paštas, kurio prod DB nėra                              | 400, „Vartotojas su šiuo el. paštu nerastas. Jis turi būti registruotas sistemoje.“ |

Jei local ir prod naudoja **skirtingas** DB, „tas pats X“ production’e reiškia: X užregistruotas **production** (per prod /register arba įrašas prod `User` lentelėje).

---

## Santrauka: ką tikrinti ir pataisyti

| Punktas | Kas gali būti ne taip | Ką padaryti |
|--------|------------------------|-------------|
| **Local vs prod DB** | Skirtingos DB – prod nemato local user’ių | Nustatyti prod `DATABASE_URL` į tą DB, kuri laikoma prod; arba užregistruoti testinius user’ius production’e |
| **Migracijos** | Prod DB neturi naujausios schemos | `npx prisma migrate deploy` su prod `DATABASE_URL` |
| **User prod DB** | Testinis el. paštas nėra prod `User` lentelėje | Užsiregistruoti per prod /register arba įkelti user’į į prod DB |
| **NEXTAUTH_URL** | Neteisingas arba http | Nustatyti `NEXTAUTH_URL=https://travel-portal-mu.vercel.app` production’e |
| **RLS** | 500 / permission denied | Naudoti connection string su **postgres** role (Supabase Database → Connection string) |

Kvietimo route ir UI logikos keisti nereikia – pakanka sutvarkyti aplinką, DB ir env, kad prod atitiktų local.

---

## 6. Supabase setup (Activity nuotraukoms local)

1. Supabase Dashboard → **Project Settings** → **API**.
2. Nukopijuokite `Project URL` ir `anon/publishable key`.
3. Projekto šaknyje nukopijuokite `.env.local.example` į `.env.local` ir užpildykite:

```env
NEXT_PUBLIC_SUPABASE_URL=<cia mano URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<cia mano publishable key>
```

4. Perkraukite `npm run dev` ir patikrinkite Activity nuotraukų upload'ą.
