import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  token: string | null;
  email: string | null;
  userId: string | null;
  setUser: (token: string, email: string, userId: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      userId: null,
      setUser: (token, email, userId) => set({ token, email, userId }),
      clearUser: () => set({ token: null, email: null, userId: null }),
    }),
    {
      name: 'access_token',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
