import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConversationStore {
  currentConversationId: string | null;
  lastVisitedConversations: string[];
  setCurrentConversationId: (conversationId: string | null) => void;
  addToLastVisited: (conversationId: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      currentConversationId: null,
      lastVisitedConversations: [],
      setCurrentConversationId: (conversationId) =>
        set({ currentConversationId: conversationId }),
      addToLastVisited: (conversationId) =>
        set((state) => ({
          lastVisitedConversations: [
            conversationId,
            ...state.lastVisitedConversations.filter(
              (id) => id !== conversationId
            ),
          ].slice(0, 10), // Keep last 10 conversations
        })),
    }),
    { name: 'ConversationStore' }
  )
);
