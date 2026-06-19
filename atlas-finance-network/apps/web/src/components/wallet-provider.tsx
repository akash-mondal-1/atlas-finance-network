'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getConnectedPublicKey } from '@/lib/stellar';
import { connectUser } from '@/app/actions';

type WalletContextType = {
  walletId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletId, setWalletId] = useState<string | null>(null);
  const router = useRouter();

  // Read from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('walletId');
    if (saved) {
      setWalletId(saved);
      document.cookie = `walletId=${saved}; path=/`;
    }
  }, []);

  const connectWallet = async () => {
    try {
      const publicKey = await getConnectedPublicKey();
      if (publicKey) {
        setWalletId(publicKey);
        localStorage.setItem('walletId', publicKey);
        document.cookie = `walletId=${publicKey}; path=/`;
        // Sync public key to database
        await connectUser(publicKey);
        router.refresh();
      }
    } catch (e) {
      console.error('Failed to connect wallet:', e);
    }
  };

  const disconnectWallet = () => {
    setWalletId(null);
    localStorage.removeItem('walletId');
    document.cookie = 'walletId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.refresh();
  };

  return (
    <WalletContext.Provider value={{ walletId, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
