-- CreateEnum
CREATE TYPE "TripParticipantRole" AS ENUM ('ORGANIZER', 'PARTICIPANT');

-- AlterTable
ALTER TABLE "Trip"
ADD COLUMN "organizerId" TEXT;

-- Backfill organizer from existing creator
UPDATE "Trip"
SET "organizerId" = "creatorId"
WHERE "organizerId" IS NULL;

-- Make organizer required
ALTER TABLE "Trip"
ALTER COLUMN "organizerId" SET NOT NULL;

-- CreateTable
CREATE TABLE "TripParticipant" (
    "id" TEXT NOT NULL,
    "tripId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TripParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',

    CONSTRAINT "TripParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TripParticipant_tripId_userId_key" ON "TripParticipant"("tripId", "userId");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripParticipant" ADD CONSTRAINT "TripParticipant_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripParticipant" ADD CONSTRAINT "TripParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed organizer participant rows for existing trips
INSERT INTO "TripParticipant" ("id", "tripId", "userId", "role")
SELECT gen_random_uuid()::text, t."id", t."organizerId", 'ORGANIZER'::"TripParticipantRole"
FROM "Trip" t
WHERE NOT EXISTS (
  SELECT 1
  FROM "TripParticipant" tp
  WHERE tp."tripId" = t."id" AND tp."userId" = t."organizerId"
);
