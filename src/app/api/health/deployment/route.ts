import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Quick check which env vars are present on the server (no secret values).
 * Open GET /api/health/deployment on production if uploads fail — all should be true.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET?.trim()),
      hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL?.trim()),
      authTrustHost: process.env.AUTH_TRUST_HOST === "true",
      hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      hasSupabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()),
      hasSupabaseServiceRole: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
      ),
    },
  });
}
