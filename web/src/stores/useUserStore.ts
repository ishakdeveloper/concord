import { DbUser } from '@concord/server';
import { create } from 'zustand';

export type UserState = Pick<
  DbUser,
  'id' | 'displayName' | 'name' | 'image' | 'discriminator'
>;

type UserStore = {
  user: UserState | null;
  isAuthenticated: boolean;
  setUser: (user: UserState | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
