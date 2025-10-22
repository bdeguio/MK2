import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
const getUserId = async () => process.env.MOCK_USER_ID!;

export async function POST(req: Request) {
  const user_id = await getUserId();
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const text = await file.text();

  // Tiny CSV parser (no deps). Expect first line headers.
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());

  const idx = (k: string) => headers.indexOf(k);
  const reqCols = ['ticker','name','quantity','value'];
  for (const c of reqCols) if (idx(c) === -1) {
    return NextResponse.json({ error: `Missing column: ${c}` }, { status: 400 });
  }

  const rows = lines.map(line => {
    const cols = line.split(',').map(s=>s.trim());
    return {
      user_id,
      account_id: cols[idx('account_id')] || 'CSV Upload',
      security_id: null,
      name: cols[idx('name')],
      ticker: cols[idx('ticker')],
      cusip: null,
      type: null,
      quantity: Number(cols[idx('quantity')] || 0),
      value: Number(cols[idx('value')] || 0),
      iso_currency_code: headers.includes('iso_currency_code') ? cols[idx('iso_currency_code')] : 'USD',
      as_of_date: headers.includes('as_of_date') ? cols[idx('as_of_date')] : new Date().toISOString().slice(0,10)
    };
  });

  if (!rows.length) return NextResponse.json({ error: 'Empty CSV' }, { status: 400 });

  const { error } = await supabaseAdmin.from('holdings').insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, inserted: rows.length });
}
