import { createClient } from "@supabase/supabase-js";

function required(name: string, value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return trimmed;
}

export function supabaseServer() {
  const supabaseUrl = required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const serviceRoleKey = required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Legacy dashboard: JWT service_role (eyJ...). Naujas UI: Secret API key (sb_secret_...).
  if (serviceRoleKey.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY: čia turi būti Secret raktas (sb_secret_...), ne Publishable (sb_publishable_...)."
    );
  }
  if (
    !serviceRoleKey.startsWith("eyJ") &&
    !serviceRoleKey.startsWith("sb_secret_")
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY: tikėtinas legacy service_role JWT (eyJ...) arba Secret raktas (sb_secret_...)."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

