'use client';

import { useState } from 'react';
import { settleInvoice } from '@/app/actions';
import { settleInvoiceOnChain } from '@/lib/stellar';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/wallet-provider';

export function SettleButton({ 
  invoiceId, 
  tokenId 
}: { 
  invoiceId: string; 
  tokenId: string; 
}) {
  const { walletId } = useWallet();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) {
      setError('Please connect your wallet');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Settle on Stellar Testnet Soroban Contract
      await settleInvoiceOnChain(tokenId, walletId);

      // 2. Call server action to update DB
      await settleInvoice(invoiceId);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Transaction failed or rejected');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSettle} className="inline-block space-y-1">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? 'Settling...' : 'Mark Settled'}
      </Button>
    </form>
  );
}
