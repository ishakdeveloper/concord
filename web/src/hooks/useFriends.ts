import { trpc } from '@/lib/trpc';

export const useFriends = () => {
  //   const { toast } = useToast();
  const utils = trpc.useUtils();
  const { data: friends, isLoading: loadingFriends } =
    trpc.friend.getAllFriends.useQuery();

  const { data: pendingRequests, isLoading: loadingRequests } =
    trpc.friend.getPendingFriendRequests.useQuery();

  const acceptFriendRequest = trpc.friend.acceptFriendRequest.useMutation({
    onSuccess: () => {
      utils.friend.getAllFriends.invalidate();
      utils.friend.getPendingFriendRequests.invalidate();
      utils.conversation.getConversations.invalidate();
    },
  });

  const rejectFriendRequest = trpc.friend.declineFriendRequest.useMutation({
    onSuccess: () => {
      utils.friend.getPendingFriendRequests.invalidate();
    },
  });

  const removeFriend = trpc.friend.removeFriend.useMutation({
    onSuccess: () => {
      utils.friend.getAllFriends.invalidate();
    },
  });

  const sendFriendRequest = trpc.friend.sendFriendRequest.useMutation({
    onSuccess: () => {
      utils.friend.getPendingFriendRequests.invalidate();
    },
  });

  return {
    friends,
    loadingFriends,
    pendingRequests,
    loadingRequests,
    acceptFriendRequest: acceptFriendRequest.mutateAsync,
    declineFriendRequest: rejectFriendRequest.mutateAsync,
    removeFriend: removeFriend.mutateAsync,
    sendFriendRequest: sendFriendRequest.mutateAsync,
  };
};
