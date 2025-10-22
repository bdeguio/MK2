'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import RemoveAccountButton from './RemoveAccountButton';

type ConnectedAccount = {
  id: string;
  account_id: string;
  account_name: string;
  institution_name: string;
  mask?: string | null;
};

export default function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingAccounts(true);
      try {
        const res = await fetch('/api/plaid/accounts');
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to load accounts');
        setAccounts(data.accounts || []);
      } catch (err) {
        console.error('❌ Error fetching accounts:', err);
        toast.error('Failed to load accounts');
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleRemoveSuccess = (accountId: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.account_id !== accountId));
  };

  return (
    <div className="space-y-4">
      {isLoadingAccounts ? (
        <>
          <div className="h-16 bg-gray-200 animate-pulse rounded-md" />
          <div className="h-16 bg-gray-200 animate-pulse rounded-md" />
        </>
      ) : accounts.length === 0 ? (
        <p className="text-gray-500">No connected accounts yet.</p>
      ) : (
        accounts.map((acc) => (
          <div
            key={acc.account_id}
            className="flex items-center justify-between rounded-lg border p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold">
                {acc.institution_name} • {acc.account_name} {acc.mask && `****${acc.mask}`}
              </p>
            </div>
            <RemoveAccountButton
              accountId={acc.account_id}
              onSuccess={() => handleRemoveSuccess(acc.account_id)}
            />
          </div>
        ))
      )}
    </div>
  );
}
