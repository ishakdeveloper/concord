import { trpc } from '@/lib/trpc';
import { useChannelStore } from '@/stores/useChannelStore';

export const useConversations = () => {
  const currentChannelId = useChannelStore((state) => state.currentChannelId);

  const { data: conversations } = trpc.conversation.getConversations.useQuery();
  const createGroup = trpc.conversation.createGroup.useMutation();
  const joinGroup = trpc.conversation.joinGroup.useMutation();
  const createConversation = trpc.conversation.createConversation.useMutation();
  const addMembers = trpc.conversation.addMembers.useMutation();
  const getConversations = trpc.conversation.getConversations.useQuery();

  const getSingleConversation =
    trpc.conversation.getSingleConversation.useQuery(
      {
        conversationId: currentChannelId ?? '',
      },
      {
        enabled: !!currentChannelId,
      }
    );

  return {
    conversations,
    createGroup,
    joinGroup,
    createConversation,
    getConversations,
    getSingleConversation,
    addMembers,
  };
};
