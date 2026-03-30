-- Add path to store Supabase Storage object key
ALTER TABLE "ActivityMedia" ADD COLUMN "path" TEXT;

-- Backfill path from existing imageUrl when possible (best-effort)
UPDATE "ActivityMedia"
SET "path" = regexp_replace("imageUrl", '^.*/object/public/activity-media/', '')
WHERE "path" IS NULL;

-- Make path required for new rows
ALTER TABLE "ActivityMedia" ALTER COLUMN "path" SET NOT NULL;

-- Index for faster deletes/lookup
CREATE INDEX IF NOT EXISTS "ActivityMedia_path_idx" ON "ActivityMedia"("path");

