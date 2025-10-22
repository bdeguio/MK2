import { NextRequest, NextResponse } from 'next/server';
import { plaidClient, CountryCode } from '@/lib/plaid';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type ExchangeBody = { public_token: string };
type ItemGetInstitution = { institution_id: string | null };

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const body = (await req.json()) as ExchangeBody;
    if (!body?.public_token) {
      return NextResponse.json({ error: 'public_token required' }, { status: 400 });
    }

    // 1) Exchange short-lived token
    const exchange = await plaidClient.itemPublicTokenExchange({ public_token: body.public_token });
    const access_token = exchange.data.access_token;
    const item_id = exchange.data.item_id;

    // 2) Institution name (optional)
    let institution_name = 'UNKNOWN';
    try {
      const itemResp = await plaidClient.itemGet({ access_token });
      const instId = (itemResp.data.item as ItemGetInstitution).institution_id;
      if (instId) {
        const inst = await plaidClient.institutionsGetById({
          institution_id: instId,
          country_codes: [CountryCode.Us],
        });
        institution_name = inst.data.institution.name;
      }
    } catch {
      /* non-fatal */
    }

    // 3) Save item
    const { error: itemErr } = await supabase
      .from('plaid_items')
      .insert([{ access_token, item_id, institution_name }]);
    if (itemErr) {
      return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
    }

    // 4) Upsert accounts
    const accountsRes = await plaidClient.accountsGet({ access_token });
    const accounts = accountsRes.data.accounts ?? [];

    const { data: itemRow, error: selectErr } = await supabase
      .from('plaid_items')
      .select('id')
      .eq('item_id', item_id)
      .single();
    if (selectErr || !itemRow) {
      return NextResponse.json({ error: 'Failed to link item to accounts' }, { status: 500 });
    }

    type AccountRow = {
      item_id: string; // uuid
      account_id: string;
      account_name: string;
      institution_name: string | null;
      mask: string | null;
    };

    const accountRows: AccountRow[] = accounts.map((a) => ({
      item_id: itemRow.id,
      account_id: a.account_id,
      account_name: a.name ?? a.official_name ?? 'Account',
      institution_name,
      mask: a.mask ?? null,
    }));

    if (accountRows.length) {
      const { error: accErr } = await supabase
        .from('accounts')
        .upsert(accountRows, { onConflict: 'user_id,account_id' });
      if (accErr) {
        return NextResponse.json({ error: 'Failed to save accounts' }, { status: 500 });
      }
    }

    // 5) Seed holdings once
    const hRes = await plaidClient.investmentsHoldingsGet({ access_token });
    const holdings = hRes.data.holdings ?? [];
    const securities = hRes.data.securities ?? [];

    type SecurityInfo = {
      name: string | null;
      ticker_symbol: string | null;
      cusip: string | null;
      type: string | null;
      iso_currency_code: string | null;
    };

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
      as_of_date: string; // YYYY-MM-DD
    };

    const today = new Date().toISOString().slice(0, 10);

    const holdingRows: HoldingInsert[] = holdings.map((h) => {
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

    if (holdingRows.length) {
      const { error: holdErr } = await supabase.from('holdings').insert(holdingRows);
      if (holdErr) {
        // not fatal to linking
        console.warn('holdings insert warning:', holdErr.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
