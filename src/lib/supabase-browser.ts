"use client";

import { createClient } from "@supabase/supabase-js";

let supabaseClient: ReturnType<typeof createClient> | null = null;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseBrowserEnv =
  Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("SUPABASE_ENV", supabaseUrl, supabaseAnonKey);
  }

  if (!hasSupabaseBrowserEnv) {
    throw new Error("Trūksta Supabase aplinkos kintamųjų.");
  }

  supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
  return supabaseClient;
}
