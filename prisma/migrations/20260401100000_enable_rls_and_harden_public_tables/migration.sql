-- Harden public schema tables for Supabase Security Advisor.
-- Keep compatibility with Prisma migrate deploy on Vercel.

-- 1) Helper function to resolve current JWT user id as text.
-- Works with Supabase JWT (`auth.jwt()->>'sub'`) and PostgREST claim setting.
CREATE OR REPLACE FUNCTION public.request_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'sub', ''),
    NULLIF(current_setting('request.jwt.claim.sub', true), '')
  )::text;
$$;

-- 2) Enable RLS on critical app tables.
ALTER TABLE public."TripParticipant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ActivityMedia" ENABLE ROW LEVEL SECURITY;

-- 3) TripParticipant policies.
DROP POLICY IF EXISTS "trip_participant_select_self_or_organizer" ON public."TripParticipant";
CREATE POLICY "trip_participant_select_self_or_organizer"
ON public."TripParticipant"
FOR SELECT
USING (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Trip" t
    WHERE t."id" = "TripParticipant"."tripId"
      AND t."organizerId" = public.request_user_id()
  )
);

DROP POLICY IF EXISTS "trip_participant_insert_self_or_organizer" ON public."TripParticipant";
CREATE POLICY "trip_participant_insert_self_or_organizer"
ON public."TripParticipant"
FOR INSERT
WITH CHECK (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Trip" t
    WHERE t."id" = "TripParticipant"."tripId"
      AND t."organizerId" = public.request_user_id()
  )
);

DROP POLICY IF EXISTS "trip_participant_update_self_or_organizer" ON public."TripParticipant";
CREATE POLICY "trip_participant_update_self_or_organizer"
ON public."TripParticipant"
FOR UPDATE
USING (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Trip" t
    WHERE t."id" = "TripParticipant"."tripId"
      AND t."organizerId" = public.request_user_id()
  )
)
WITH CHECK (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Trip" t
    WHERE t."id" = "TripParticipant"."tripId"
      AND t."organizerId" = public.request_user_id()
  )
);

DROP POLICY IF EXISTS "trip_participant_delete_self_or_organizer" ON public."TripParticipant";
CREATE POLICY "trip_participant_delete_self_or_organizer"
ON public."TripParticipant"
FOR DELETE
USING (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Trip" t
    WHERE t."id" = "TripParticipant"."tripId"
      AND t."organizerId" = public.request_user_id()
  )
);

-- 4) ActivityMedia policies.
-- Access is granted to users who belong to the same trip.
DROP POLICY IF EXISTS "activity_media_select_trip_member" ON public."ActivityMedia";
CREATE POLICY "activity_media_select_trip_member"
ON public."ActivityMedia"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public."Activity" a
    JOIN public."TripParticipant" tp
      ON tp."tripId" = a."tripId"
     AND tp."userId" = public.request_user_id()
    WHERE a."id" = "ActivityMedia"."activityId"
  )
);

DROP POLICY IF EXISTS "activity_media_insert_trip_member_owner" ON public."ActivityMedia";
CREATE POLICY "activity_media_insert_trip_member_owner"
ON public."ActivityMedia"
FOR INSERT
WITH CHECK (
  "userId" = public.request_user_id()
  AND EXISTS (
    SELECT 1
    FROM public."Activity" a
    JOIN public."TripParticipant" tp
      ON tp."tripId" = a."tripId"
     AND tp."userId" = public.request_user_id()
    WHERE a."id" = "ActivityMedia"."activityId"
  )
);

DROP POLICY IF EXISTS "activity_media_update_owner_or_organizer" ON public."ActivityMedia";
CREATE POLICY "activity_media_update_owner_or_organizer"
ON public."ActivityMedia"
FOR UPDATE
USING (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Activity" a
    JOIN public."Trip" t ON t."id" = a."tripId"
    WHERE a."id" = "ActivityMedia"."activityId"
      AND t."organizerId" = public.request_user_id()
  )
)
WITH CHECK (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Activity" a
    JOIN public."Trip" t ON t."id" = a."tripId"
    WHERE a."id" = "ActivityMedia"."activityId"
      AND t."organizerId" = public.request_user_id()
  )
);

DROP POLICY IF EXISTS "activity_media_delete_owner_or_organizer" ON public."ActivityMedia";
CREATE POLICY "activity_media_delete_owner_or_organizer"
ON public."ActivityMedia"
FOR DELETE
USING (
  "userId" = public.request_user_id()
  OR EXISTS (
    SELECT 1
    FROM public."Activity" a
    JOIN public."Trip" t ON t."id" = a."tripId"
    WHERE a."id" = "ActivityMedia"."activityId"
      AND t."organizerId" = public.request_user_id()
  )
);

-- 5) Harden Prisma migration metadata table in public schema.
-- Keep it for Prisma engine, but remove API access from anon/authenticated roles.
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon;
REVOKE ALL ON TABLE public."_prisma_migrations" FROM authenticated;

DROP POLICY IF EXISTS "prisma_migrations_service_role_read" ON public."_prisma_migrations";
CREATE POLICY "prisma_migrations_service_role_read"
ON public."_prisma_migrations"
FOR SELECT
USING (auth.role() = 'service_role');
