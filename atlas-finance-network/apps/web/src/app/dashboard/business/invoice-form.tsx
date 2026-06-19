'use client';

import { useState } from 'react';
import { createInvoice } from '@/app/actions';
import { createInvoiceOnChain } from '@/lib/stellar';
import { useWallet } from '@/components/wallet-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function InvoiceCreationForm({ businessId }: { businessId: string }) {
  const { walletId } = useWallet();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walletId) {
      setError('Please connect your wallet first');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);

    // Generate a unique invoice token ID for the blockchain
    const tokenId = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      // 1. Write to Stellar Testnet Soroban Contract
      await createInvoiceOnChain(tokenId, walletId, amount);

      // 2. Write to PostgreSQL Database via Server Action
      formData.append('tokenId', tokenId);
      await createInvoice(formData);

      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Transaction failed or rejected');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="businessId" value={businessId} />
      {error && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded">{error}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="invoiceNum">Invoice Number</Label>
        <Input id="invoiceNum" name="invoiceNum" required placeholder="INV-2026-001" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input id="customerName" name="customerName" required placeholder="Global Retail Inc." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required placeholder="5000.00" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" name="dueDate" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pdf">Upload PDF</Label>
        <Input id="pdf" type="file" accept="application/pdf" />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Tokenizing on Stellar...' : 'Create & Tokenize Invoice'}
      </Button>
    </form>
  );
}
