'use client';

import { useEffect } from 'react';
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

  const { token } = useUserStore();
  const { accountId } = useWalletStore();

  useEffect(() => {
    if (blockIfLoggedIn && token) {
      router.replace('/dashboard'); // or your home page
    } else if (blockIfWalletConnected && accountId) {
      router.replace('/dashboard'); // or maybe `/profile`
    }
  }, [blockIfLoggedIn, blockIfWalletConnected, token, accountId, router, pathname]);

  if ((blockIfLoggedIn && token) || (blockIfWalletConnected && accountId)) {
    return null; // avoid flashing the login page
  }

  return <>{children}</>;
}
