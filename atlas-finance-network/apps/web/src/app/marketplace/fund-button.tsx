'use client';

import { useState } from 'react';
import { fundInvoice } from '@/app/actions';
import { fundInvoiceOnChain } from '@/lib/stellar';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/components/wallet-provider';

export function FundButton({ 
  invoiceId, 
  tokenId, 
  walletId: serverWalletId 
}: { 
  invoiceId: string; 
  tokenId: string; 
  walletId: string; 
}) {
  const { walletId: clientWalletId, connectWallet } = useWallet();
  const walletId = clientWalletId || serverWalletId;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!walletId) {
    return (
      <Button className="w-full" variant="outline" onClick={connectWallet}>
        Connect Wallet to Fund
      </Button>
    );
  }

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Call fund_invoice on Soroban Smart Contract
      await fundInvoiceOnChain(tokenId, walletId);

      // 2. Call server action to update DB
      await fundInvoice(invoiceId, walletId);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Transaction failed or rejected');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFund} className="w-full space-y-2">
      {error && <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded text-center">{error}</div>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Funding on Ledger...' : 'Fund Invoice'}
      </Button>
    </form>
  );
}
