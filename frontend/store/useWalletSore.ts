import { create } from 'zustand';

interface WalletState {
  accountId: string | null;
  setAccountId: (id: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  accountId: null,
  setAccountId: (id) => set({ accountId: id }),
}));
