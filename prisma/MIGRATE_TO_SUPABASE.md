# Perėjimas į Supabase Postgres – komandos

Vykdyk **projekto šaknyje** (`c:\Users\Eridas\Desktop\travel-portal`).

## 1. Senų SQLite migracijų tvarkymas (būtina)

Dabartinės migracijos parašytos SQLite sintaksei. Supabase Postgres jų negalės vykdyti. Todėl pradedame „nuo nulio“ su viena nauja Postgres migracija.

**Variantas A – perkelti senas migracijas (saugiau):**
```powershell
Rename-Item -Path "prisma\migrations" -NewName "migrations_sqlite_backup"
```

**Variantas B – ištrinti senas migracijas:**
```powershell
Remove-Item -Recurse -Force prisma\migrations
```

Po to Prisma sukurs naują `prisma/migrations` su viena Postgres migracija.

---

## 2. Prisma kliento generavimas

Sugeneruoja Postgres-kompatibilų klientą pagal atnaujintą schemą:

```powershell
npx prisma generate
```

**Ką daro:** atnaujina `node_modules/.prisma/client` – jūsų kodas (`db` iš `@/lib/db`) naudos šį klientą.

---

## 3. Pirmoji migracija į Supabase (sukuria lenteles)

Sukuria migracijos failą ir pritaiko schemą prie Supabase Postgres:

```powershell
npx prisma migrate dev --name init_supabase
```

**Ką daro:**
- Skaito `prisma/schema.prisma` ir lygina su Supabase DB (dabar tuščia).
- Sukuria `prisma/migrations/<timestamp>_init_supabase/migration.sql` su PostgreSQL komandomis (CREATE TABLE, indeksai ir t. t.).
- Vykdo tą SQL Supabase duomenų bazėje.
- Sukuria/atnaujina lentelę `_prisma_migrations` migracijų istorijai.

Po šios komandos Supabase turėsite visas reikalingas lenteles.

---

## 4. (Nebūtina) Jei migracijos kiltų problemų – „push“ be istorijos

Jei dėl priežasčių nenorite naudoti `migrate` (pvz. bandote tik greitai suderinti schemą):

```powershell
npx prisma db push
```

**Ką daro:** tiesiog pritaiko dabartinę schemą prie DB be migracijų failų. Nerekomenduojama kaip pagrindinis būdas, bet tinka išbandomiems dalykams.

---

## Santrauka – minimalus variantas

Jei renkatės **Variantą A** (backup senų migracijų), paleiskite eilės tvarka:

```powershell
cd c:\Users\Eridas\Desktop\travel-portal

Rename-Item -Path "prisma\migrations" -NewName "migrations_sqlite_backup"

npx prisma generate

npx prisma migrate dev --name init_supabase
```

Įveskite „y“ arba Enter, kai Prisma paklaus ar sukurti naują migraciją. Po to paleiskite `npm run dev` ir patikrinkite, ar prisijungimas ir kelionės veikia su Supabase.
