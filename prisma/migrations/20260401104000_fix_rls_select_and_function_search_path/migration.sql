-- Supabase Advisor fixes:
-- 1) Avoid per-row auth function evaluation in RLS predicates
-- 2) Set immutable/safe search_path for helper function used by RLS

-- Recreate helper with explicit search_path to satisfy lint 0011.
CREATE OR REPLACE FUNCTION public.request_user_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() ->> 'sub', ''),
    NULLIF(current_setting('request.jwt.claim.sub', true), '')
  )::text;
$$;

-- Keep same authorization semantics, only switch to SELECT-wrapped auth call.
DROP POLICY IF EXISTS "prisma_migrations_service_role_read" ON public."_prisma_migrations";
CREATE POLICY "prisma_migrations_service_role_read"
ON public."_prisma_migrations"
FOR SELECT
USING ((select auth.role()) = 'service_role');
