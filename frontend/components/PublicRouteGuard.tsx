'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '../store/useUserStore';
import { useWalletStore } from '../store/useWalletSore';

interface PublicRouteGuardProps {
  children: React.ReactNode;
  blockIfLoggedIn?: boolean;
  blockIfWalletConnected?: boolean;
}

export default function PublicRouteGuard({
  children,
  blockIfLoggedIn = false,
  blockIfWalletConnected = false,
}: PublicRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const token = useUserStore((state) => state.token);
  const accountId = useWalletStore((state) => state.accountId);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (blockIfLoggedIn && token) {
      router.replace('/workflows');
    } else if (blockIfWalletConnected && accountId) {
      router.replace('/workflows');
    }
  }, [hydrated, blockIfLoggedIn, blockIfWalletConnected, token, accountId, router]);

  if (!hydrated) return null;
  if ((blockIfLoggedIn && token) || (blockIfWalletConnected && accountId)) {
    return null;
  }

  return <>{children}</>;
}
