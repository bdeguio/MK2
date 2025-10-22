import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient(); // ✅ await it

    const { data, error } = await supabase
      .from("holdings")
      .select("*");

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: "Supabase fetch error" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient(); // ✅ await it
    const newHolding = await req.json();

    const { error } = await supabase.from("holdings").insert([
      {
        ticker: newHolding.ticker,
        // ⚠️ No need to include user_id — Supabase gets it via RLS `auth.uid()`
      },
    ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 401 });
  }
}
