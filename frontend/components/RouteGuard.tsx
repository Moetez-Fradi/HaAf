'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '../store/useUserStore';
import { useWalletStore } from '../store/useWalletSore';

interface RouteGuardProps {
  children: React.ReactNode;
  requireLogin?: boolean;
  requireWallet?: boolean;
}

export default function RouteGuard({
  children,
  requireLogin = false,
  requireWallet = false,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { token } = useUserStore();
  const { accountId } = useWalletStore();

  useEffect(() => {
    // redirect to login if user not authenticated
    if (requireLogin && !token) {
      router.push(`/login?redirect=${pathname}`);
    }
    // redirect to wallet connect page if wallet not connected
    else if (requireWallet && !accountId) {
      router.push(`/connect-wallet?redirect=${pathname}`);
    }
  }, [requireLogin, requireWallet, token, accountId, router, pathname]);

  // only render children if allowed
  if (requireLogin && !token) return null;
  if (requireWallet && !accountId) return null;

  return <>{children}</>;
}
