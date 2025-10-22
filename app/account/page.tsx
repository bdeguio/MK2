// app/account/page.tsx
import { createClient } from '@supabase/supabase-js';

export default async function AccountPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  // get your userId from auth; for MVP, .env MOCK_USER_ID
  const userId = process.env.MOCK_USER_ID!;

  const { data, error } = await supabase
    .from('holdings_latest')
    .select('ticker,name,quantity,value,iso_currency_code,account_id,as_of_date,created_at')
    .eq('user_id', userId)
    .order('ticker', { ascending: true });

  const last = data?.[0]?.as_of_date ?? null;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Your Account</h1>
      <div className="flex gap-4 items-center">
        {/* @ts-expect-error Client component */}
        <PlaidLinkButton />
        {/* @ts-expect-error Client component */}
        <CsvUpload />
      </div>
      <div className="text-sm opacity-70">Last updated: {last ?? '—'}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Ticker</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Qty</th>
              <th className="py-2 pr-4">Value</th>
              <th className="py-2 pr-4">Currency</th>
              <th className="py-2 pr-4">Account</th>
              <th className="py-2 pr-4">As of</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr><td colSpan={7} className="py-3 text-red-600">{error.message}</td></tr>
            )}
            {data?.map((r, i) => (
              <tr key={i} className="border-b">
                <td className="py-2 pr-4">{r.ticker ?? '—'}</td>
                <td className="py-2 pr-4">{r.name ?? '—'}</td>
                <td className="py-2 pr-4">{r.quantity ?? 0}</td>
                <td className="py-2 pr-4">{r.value ?? 0}</td>
                <td className="py-2 pr-4">{r.iso_currency_code ?? '—'}</td>
                <td className="py-2 pr-4">{r.account_id}</td>
                <td className="py-2 pr-4">{r.as_of_date}</td>
              </tr>
            ))}
            {!error && !data?.length && (
              <tr><td colSpan={7} className="py-6 opacity-70">No holdings yet. Connect a brokerage or upload a CSV.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

import { PlaidLinkButton } from '@/components/PlaidLinkButton';
import { CsvUpload } from '@/components/CsvUpload';
