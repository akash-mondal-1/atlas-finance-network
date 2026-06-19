'use client';

import { useWallet } from '@/components/wallet-provider';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { walletId, connectWallet } = useWallet();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
        Atlas Finance Network
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Stellar-powered credit reputation and invoice financing platform for SMEs.
        Tokenize your receivables and access liquidity immediately.
      </p>

      {!walletId ? (
        <Button size="lg" onClick={connectWallet} className="text-lg px-8">
          Connect Wallet to Enter
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard/business" className={buttonVariants({ size: 'lg', className: 'text-lg px-8' })}>
            Business Portal
          </Link>
          <Link href="/marketplace" className={buttonVariants({ variant: 'outline', size: 'lg', className: 'text-lg px-8' })}>
            Investor Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
