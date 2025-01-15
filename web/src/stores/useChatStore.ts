import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
  oneOnOnePartner: Record<string, string>; // chatId -> other user id
  setOneOnOnePartner: (chatId: string, user: string) => void;
  clearChat: (chatId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      oneOnOnePartner: {},
      setOneOnOnePartner: (chatId, user) =>
        set((state) => ({
          oneOnOnePartner: {
            ...state.oneOnOnePartner,
            [chatId]: user,
          },
        })),
      clearChat: (chatId) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [chatId]: __, ...remainingPartners } = state.oneOnOnePartner;
          return {
            oneOnOnePartner: remainingPartners,
          };
        }),
    }),
    {
      name: 'chatStore',
    }
  )
);
