import { trpc } from '@/lib/trpc';
import { useConversationStore } from '@/stores/useConversationStore';

export const useConversations = () => {
  const currentConversationId = useConversationStore(
    (state) => state.currentConversationId
  );
  const utils = trpc.useUtils();

  const { data: conversations, isLoading: isLoadingConversations } =
    trpc.conversation.getConversations.useQuery(undefined, {
      retry: false,
    });

  const getSingleConversation =
    trpc.conversation.getSingleConversation.useQuery(
      {
        conversationId: currentConversationId ?? '',
      },
      {
        enabled: !!currentConversationId,
        retry: false,
      }
    );

  const createConversation = trpc.conversation.createConversation.useMutation({
    onSuccess: () => {
      // Invalidate conversations query to refresh the list
      utils.conversation.getConversations.invalidate();
    },
  });

  const createGroup = trpc.conversation.createGroup.useMutation();
  const joinGroup = trpc.conversation.joinGroup.useMutation();
  const addMembers = trpc.conversation.addMembers.useMutation();
  const getConversations = trpc.conversation.getConversations.useQuery();

  return {
    conversations: conversations ?? [], // Provide empty array as fallback
    isLoadingConversations,
    createConversation,
    getSingleConversation,
    createGroup,
    joinGroup,
    getConversations,
    addMembers,
  };
};
