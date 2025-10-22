// app/api/plaid/create-link-token/route.ts
import { NextResponse } from 'next/server';
import { plaidClient, CountryCode } from '@/lib/plaid';
import { Products } from 'plaid';

export async function POST() {
  try {
    const { data } = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'session-user' }, // or your real user id if you pass it
      client_name: 'Arena',
      products: [Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    return NextResponse.json({ link_token: data.link_token });
  } catch (error) {
    console.error('Plaid Link Token Error:', error);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
