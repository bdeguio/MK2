import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type AccountRow = {
  id: string;
  account_id: string;
  account_name: string | null;
  institution_name: string | null;
  mask: string | null;
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('accounts')
      .select('account_id, account_name, institution_name, mask, id')
      .order('institution_name', { ascending: true });

    if (error) throw new Error(error.message);
    return NextResponse.json({ accounts: (data ?? []) as AccountRow[] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load accounts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
