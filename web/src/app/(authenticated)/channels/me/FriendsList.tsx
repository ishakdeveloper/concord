'use client';

import { useState } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useFriends } from '@/hooks/useFriends';
import { FriendsHeader } from './FriendsHeader';
import { AddFriendForm } from './AddFriendForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PendingFriendsList } from './PendingFriendsList';
import { FriendsGrid } from './FriendsGrid';
import { useChannelStore } from '@/stores/useChannelStore';

export const FriendsList = () => {
  const [activeTab, setActiveTab] = useState<
    'all' | 'online' | 'pending' | 'blocked' | 'add'
  >('all');

  const [friendUsername, setFriendUsername] = useState('');

  const setCurrentChannelId = useChannelStore(
    (state) => state.setCurrentChannelId
  );

  const setOneOnOnePartner = useChatStore((state) => state.setOneOnOnePartner);

  const {
    friends,
    pendingRequests,
    loadingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useFriends();

  const filteredFriends =
    friends?.filter((_friend) => {
      if (!friends) return [];
      switch (activeTab) {
        case 'online':
          return true;
        case 'pending':
        case 'blocked':
          return false;
        default:
          return true;
      }
    }) ?? [];

  const handleOpenConversation = (conversationId: string, friendId: string) => {
    setCurrentChannelId(conversationId);
    setOneOnOnePartner(conversationId, friendId);
  };

  return (
    <div className="flex-grow flex flex-col">
      <FriendsHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRequestsCount={pendingRequests?.length}
      />

      {activeTab === 'add' && (
        <AddFriendForm
          friendUsername={friendUsername}
          setFriendUsername={setFriendUsername}
          onSubmit={() =>
            sendFriendRequest({
              name: friendUsername.split('#')[0],
              discriminator: friendUsername.split('#')[1] ?? '0000',
            })
          }
          isPending={false}
        />
      )}

      <ScrollArea className="flex-grow p-4">
        {activeTab === 'pending' ? (
          <PendingFriendsList
            requests={pendingRequests ?? []}
            onAccept={acceptFriendRequest}
            onDecline={declineFriendRequest}
            isLoading={loadingRequests}
          />
        ) : (
          <FriendsGrid
            friends={filteredFriends ?? []}
            onOpenConversation={handleOpenConversation}
            onRemoveFriend={(friendshipId) =>
              removeFriend({ friendId: friendshipId })
            }
          />
        )}
      </ScrollArea>
    </div>
  );
};
