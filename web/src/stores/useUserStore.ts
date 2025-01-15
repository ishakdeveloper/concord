import { DbUser } from '@concord/server';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = Pick<DbUser, 'id' | 'displayName' | 'name' | 'image'>;

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'UserStore',
    }
  )
);
