-- Drop legacy TripMember table after migration to TripParticipant.
-- PostgreSQL/Supabase: dropping table removes table-owned indexes and FKs.
DROP TABLE IF EXISTS "TripMember";
