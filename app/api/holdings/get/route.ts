import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

export async function GET(
  req: NextRequest,
  context: unknown
) {
  const { short_id } = (context as { params: { short_id: string } }).params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // ✅ Use anon key — but only for public data
  );

  // Get profile by short_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("short_id", short_id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get holdings belonging to that user
  const { data: holdings, error } = await supabase
    .from("holdings")
    .select("ticker, name, value")
    .eq("user_id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ holdings });
}
