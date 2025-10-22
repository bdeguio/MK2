import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) throw new Error("Not authenticated");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  );
};
