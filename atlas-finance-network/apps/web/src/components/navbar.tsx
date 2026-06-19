'use client';

import Link from 'next/link';
import { useWallet } from './wallet-provider';
import { Button } from './ui/button';

export function Navbar() {
  const { walletId, connectWallet, disconnectWallet } = useWallet();

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Atlas Finance
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/marketplace" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Marketplace
          </Link>
          {walletId && (
            <>
              <Link href="/dashboard/business" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Business
              </Link>
              <Link href="/dashboard/investor" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Investor
              </Link>
            </>
          )}
          {walletId ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
                {walletId.slice(0, 4)}...{walletId.slice(-4)}
              </span>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button onClick={connectWallet} size="sm">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
