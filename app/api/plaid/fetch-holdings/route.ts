import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type ItemRow = { id: string; access_token: string; institution_name: string | null };

type SecurityInfo = {
  name: string | null;
  ticker_symbol: string | null;
  cusip: string | null;
  type: string | null;
  iso_currency_code: string | null;
};

type HoldingInsert = {
  account_id: string;
  security_id: string | null;
  name: string | null;
  ticker: string | null;
  cusip: string | null;
  type: string | null;
  quantity: number | null;
  value: number | null;
  iso_currency_code: string | null;
  as_of_date: string;
};

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: items, error: itemsErr } = await supabase
      .from('plaid_items')
      .select('id, access_token, institution_name');
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

    const today = new Date().toISOString().slice(0, 10);

    for (const item of (items ?? []) as ItemRow[]) {
      // refresh accounts
      const accountsRes = await plaidClient.accountsGet({ access_token: item.access_token });
      const accounts = accountsRes.data.accounts ?? [];
      const accountRows = accounts.map((a) => ({
        item_id: item.id,
        account_id: a.account_id,
        account_name: a.name ?? a.official_name ?? 'Account',
        institution_name: item.institution_name ?? null,
        mask: a.mask ?? null,
      }));
      if (accountRows.length) {
        await supabase.from('accounts').upsert(accountRows, { onConflict: 'user_id,account_id' });
      }

      // holdings snapshot
      const hRes = await plaidClient.investmentsHoldingsGet({ access_token: item.access_token });
      const holdings = hRes.data.holdings ?? [];
      const securities = hRes.data.securities ?? [];

      const secMap = new Map<string, SecurityInfo>(
        securities
          .filter((s): s is typeof s & { security_id: string } => Boolean(s.security_id))
          .map((s) => [
            s.security_id as string,
            {
              name: s.name ?? null,
              ticker_symbol: s.ticker_symbol ?? null,
              cusip: s.cusip ?? null,
              type: s.type ?? null,
              iso_currency_code: s.iso_currency_code ?? null,
            },
          ]),
      );

      const rows: HoldingInsert[] = holdings.map((h) => {
        const s = h.security_id ? secMap.get(h.security_id) : undefined;
        return {
          account_id: h.account_id ?? 'UNKNOWN',
          security_id: h.security_id ?? null,
          name: s?.name ?? null,
          ticker: s?.ticker_symbol ?? null,
          cusip: s?.cusip ?? null,
          type: s?.type ?? null,
          quantity: typeof h.quantity === 'number' ? h.quantity : null,
          value: typeof h.institution_value === 'number' ? h.institution_value : null,
          iso_currency_code: h.iso_currency_code ?? s?.iso_currency_code ?? null,
          as_of_date: today,
        };
      });

      if (rows.length) await supabase.from('holdings').insert(rows);
    }

    return NextResponse.json({ ok: true, date: today });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
