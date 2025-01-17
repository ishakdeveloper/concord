'use client';

import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Inbox, Users } from 'lucide-react';
import React from 'react';
import NextLink from 'next/link';
// import SelectGroupMembers from './SelectGroupMembers';
import { cn } from '@/lib/utils';
import { useConversationStore } from '@/stores/useConversationStore';
import { RouterOutput } from '@/lib/trpc';
import { useUserStore } from '@/stores/useUserStore';
import { useChatStore } from '@/stores/useChatStore';
import LoggedInUserBox from '../LoggedInUserBox';
import SelectGroupMembers from './SelectGroupMembers';
import { useConversations } from '@/hooks/useConversations';
import { usePathname, useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/UserAvatar';

const ConversationSidebar = () => {
  const setCurrentConversationId = useConversationStore(
    (state) => state.setCurrentConversationId
  );
  const currentConversationId = useConversationStore(
    (state) => state.currentConversationId
  );
  const currentUser = useUserStore((state) => state.user);
  const setOneOnOnePartner = useChatStore((state) => state.setOneOnOnePartner);
  const pathname = usePathname();

  const { conversations, isLoadingConversations } = useConversations();
  const router = useRouter();

  // Clear invalid currentConversationId if it doesn't exist in conversations
  React.useEffect(() => {
    if (
      currentConversationId &&
      conversations &&
      !conversations.some((c) => c.id === currentConversationId)
    ) {
      setCurrentConversationId(null);
      router.replace('/channels/me');
    }
  }, [currentConversationId, conversations, router, setCurrentConversationId]);

  const handleConversationClick = (
    conversation: RouterOutput['conversation']['getConversations'][number]
  ) => {
    if (currentConversationId === conversation.id) {
      return;
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.user?.id !== currentUser?.id
    );

    if (otherParticipant?.user?.id) {
      setOneOnOnePartner(conversation.id, otherParticipant.user.id);
    }

    setCurrentConversationId(conversation.id);
    router.push(`/channels/me/${conversation.id}`);
  };

  const getConversationName = (
    conversation: RouterOutput['conversation']['getConversations'][number]
  ) => {
    if (conversation.isGroup) {
      return conversation.name || 'Unnamed Group';
    } else {
      const otherParticipant = conversation.participants.find(
        (p) => p.user?.id !== currentUser?.id
      );
      return otherParticipant?.user?.name || 'Unknown User';
    }
  };

  // const getAvatarText = (
  //   conversation: RouterOutput['conversation']['getConversations'][number]
  // ) => {
  //   if (conversation.isGroup) {
  //     const validParticipants = conversation.participants
  //       .filter((p) => p.user?.name)
  //       .slice(0, 2);
  //     return (
  //       validParticipants.map((p) => p.user?.name?.[0] || 'G').join('') || 'G'
  //     );
  //   } else {
  //     const otherParticipant = conversation.participants.find(
  //       (p) => p.user?.id !== currentUser?.id
  //     );
  //     return otherParticipant?.user?.name?.[0] || '?';
  //   }
  // };

  return (
    <div className="w-60 border-r flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <Input placeholder="Find or start a conversation" className="h-8" />
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 justify-start">
          <NextLink
            href="/channels/me/"
            onClick={() => setCurrentConversationId(null)}
            className={buttonVariants({
              variant: 'ghost',
              className: cn(
                'w-full justify-start px-2 mb-1',
                pathname === '/channels/me' && 'bg-accent'
              ),
            })}
          >
            <Users className="mr-2 h-4 w-4" />
            Friends
          </NextLink>
          <NextLink
            href="/channels/me/inbox"
            onClick={() => setCurrentConversationId(null)}
            className={buttonVariants({
              variant: 'ghost',
              className: cn(
                'w-full justify-start px-2 mb-1',
                pathname === '/channels/me/inbox' && 'bg-accent'
              ),
            })}
          >
            <Inbox className="mr-2 h-4 w-4" />
            Inbox
          </NextLink>
          <NextLink
            href="/channels/me/help"
            onClick={() => setCurrentConversationId(null)}
            className={buttonVariants({
              variant: 'ghost',
              className: cn(
                'w-full justify-start px-2 mb-4',
                pathname === '/channels/me/help' && 'bg-accent'
              ),
            })}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </NextLink>
          <div className="text-sm font-semibold mb-2 flex justify-between items-center px-2">
            <span>Direct Messages</span>
            <SelectGroupMembers isCreateGroup={true} />
          </div>
          {isLoadingConversations ? (
            <div className="p-4 text-sm text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No conversations yet. Start a new one!
            </div>
          ) : (
            conversations?.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className={buttonVariants({
                  variant: 'ghost',
                  className: cn(
                    'w-full justify-start px-2 mb-1 relative',
                    currentConversationId === conversation.id && 'bg-accent'
                  ),
                })}
              >
                <UserAvatar
                  src={
                    conversation.isGroup
                      ? undefined
                      : conversation.participants.find(
                          (p) => p.user?.id !== currentUser?.id
                        )?.user?.image
                  }
                  fallback={
                    conversation.isGroup
                      ? 'G'
                      : (conversation.participants.find(
                          (p) => p.user?.id !== currentUser?.id
                        )?.user?.name?.[0] ?? '?')
                  }
                  size="md"
                  className="mr-2"
                />
                <span className="flex-grow text-left">
                  {getConversationName(conversation)}
                </span>
                {/* {conversation.unreadCount > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs absolute right-2">
                  {conversation.unreadCount}
                </span>
              )} */}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      <LoggedInUserBox />
    </div>
  );
};

export default ConversationSidebar;
