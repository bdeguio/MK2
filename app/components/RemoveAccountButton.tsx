'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  accountId: string;
  onSuccess: () => void;
}

export default function RemoveAccountButton({ accountId, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    const confirmed = confirm("Are you sure you want to unlink this account?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/plaid/remove-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove account');
      }

      toast.success('Account removed');
      onSuccess();
    } catch (err) {
      console.error('❌ Error removing account:', err);
      toast.error('Failed to remove account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-red-500 hover:underline disabled:opacity-50"
    >
      Remove
    </button>
  );
}
