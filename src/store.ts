import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  phone?: string;
  privacyMode?: 'everyone' | 'requests';
  themeColor?: string;
}


interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'aurora-user-storage',
    }
  )
);
