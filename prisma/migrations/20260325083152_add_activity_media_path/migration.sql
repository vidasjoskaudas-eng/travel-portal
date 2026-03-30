-- DropIndex (may run before index exists depending on migration history — must be idempotent)
DROP INDEX IF EXISTS "ActivityMedia_path_idx";
