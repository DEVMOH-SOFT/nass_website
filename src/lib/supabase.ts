import { createClient } from "@supabase/supabase-js";

// Supabase Project Credentials for NASS LASUSTECH
// Project: https://supabase.com/dashboard/project/tugqslciljchnchtkbht
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tugqslciljchnchtkbht.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_ANON_KEY !== "your-anon-key-here" &&
  !SUPABASE_ANON_KEY.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy")
);

// Client instance
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy-anon-key"
);

export default supabase;
