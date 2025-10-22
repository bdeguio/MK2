import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { plaidClient } from '@/lib/plaid';

type RemoveBody = { account_id: string };

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = (await req.json()) as RemoveBody;
    if (!body?.account_id) {
      return NextResponse.json({ error: 'account_id required' }, { status: 400 });
    }

    const { data: acc, error: accErr } = await supabase
      .from('accounts')
      .select('id, item_id')
      .eq('account_id', body.account_id)
      .single();
    if (accErr || !acc) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    await supabase.from('holdings').delete().eq('account_id', body.account_id);
    await supabase.from('accounts').delete().eq('account_id', body.account_id);

    const { data: remaining } = await supabase
      .from('accounts')
      .select('id')
      .eq('item_id', acc.item_id)
      .limit(1);

    if (!remaining || remaining.length === 0) {
      const { data: itemRow } = await supabase
        .from('plaid_items')
        .select('access_token, id')
        .eq('id', acc.item_id)
        .single();

      if (itemRow?.access_token) {
        try {
          await plaidClient.itemRemove({ access_token: itemRow.access_token });
        } catch {
          /* non-fatal */
        }
      }
      await supabase.from('plaid_items').delete().eq('id', acc.item_id);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to remove account';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
