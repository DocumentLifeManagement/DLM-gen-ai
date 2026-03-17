import { createClient } from "@supabase/supabase-js";

// Supabase project credentials
// The URL and anon key come from the Supabase project that backs the DLM DB.
// Project ref: oomvhsiltdnonkbidhee  (from DATABASE_URL in backend/.env)
const SUPABASE_URL = "https://oomvhsiltdnonkbidhee.supabase.co";

// The anon public key is safe to expose in frontend code.
// Replace this with your actual anon key from Supabase → Project Settings → API
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
