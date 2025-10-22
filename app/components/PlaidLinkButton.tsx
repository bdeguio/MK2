'use client';
import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

export function PlaidLinkButton() {
  const [linkToken, setLinkToken] = useState<string>();

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/plaid/create-link-token', { method: 'POST' });
      const j = await r.json();
      setLinkToken(j.link_token);
    })();
  }, []);

  const onSuccess = async (public_token: string, metadata: any) => {
    await fetch('/api/plaid/exchange-public-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ public_token, institution_name: metadata.institution?.name }),
    });
    await fetch('/api/plaid/fetch-holdings', { method: 'POST' });
    // optionally revalidate or refresh the page
  };

  const { open, ready } = usePlaidLink({ token: linkToken!, onSuccess });

  return (
    <button onClick={() => open()} disabled={!ready} className="rounded-xl px-4 py-2 border">
      Connect Brokerage
    </button>
  );
}
