import { trpc } from '@/lib/trpc';
import { useUserStore } from '@/stores/useUserStore';

export const useFriends = () => {
  //   const { toast } = useToast();
  const user = useUserStore((state) => state.user);
  const utils = trpc.useUtils();
  const { data: friends, isLoading: loadingFriends } =
    trpc.friend.getAllFriends.useQuery(undefined, {
      enabled: !!user?.id,
    });

  const { data: pendingRequests, isLoading: loadingRequests } =
    trpc.friend.getPendingFriendRequests.useQuery(undefined, {
      enabled: !!user?.id,
    });

  const acceptFriendRequest = trpc.friend.acceptFriendRequest.useMutation({
    onSuccess: () => {
      utils.friend.getAllFriends.invalidate();
      utils.friend.getPendingFriendRequests.invalidate();
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
