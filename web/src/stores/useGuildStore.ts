import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuildStore {
  currentGuildId: string | null;
  setCurrentGuildId: (guildId: string | null) => void;
}

export const useGuildStore = create<GuildStore>()(
  persist(
    (set) => ({
      currentGuildId: null,
      setCurrentGuildId: (guildId) => set({ currentGuildId: guildId }),
    }),
    { name: 'GuildStore' }
  )
);
