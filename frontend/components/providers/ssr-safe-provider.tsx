'use client';

import { useEffect, useState } from 'react';
import { EnvironmentStoreProvider } from '@/components/context';
import SolanaWalletProvider from './wallet-provider';
import Layout from '@/components/sections/layout';
import { Toaster } from '@/components/ui/toaster';

export default function SSRSafeProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Add a small delay to ensure all components are ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isClient || !isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Bimboh...</p>
        </div>
      </div>
    );
  }

  return (
    <EnvironmentStoreProvider>
      <SolanaWalletProvider>
        <Layout>{children}</Layout>
        <Toaster />
      </SolanaWalletProvider>
    </EnvironmentStoreProvider>
  );
}
