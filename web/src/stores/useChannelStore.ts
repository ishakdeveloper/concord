import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChannelStore {
  currentChannelId: string | null;
  setCurrentChannelId: (channelId: string | null) => void;
  lastVisitedChannels: Record<string, string | null>;
  setLastVisitedChannel: (guildId: string, channelId: string) => void;
}

export const useChannelStore = create<ChannelStore>()(
  persist(
    (set) => ({
      currentChannelId: null,
      setCurrentChannelId: (channelId) => set({ currentChannelId: channelId }),
      lastVisitedChannels: {},
      setLastVisitedChannel: (guildId, channelId) =>
        set((state) => ({
          lastVisitedChannels: {
            ...state.lastVisitedChannels,
            [guildId]: channelId,
          },
        })),
    }),
    {
      name: 'ChannelStore',
    }
  )
);
