'use client';

import { AvatarFallback } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpCircle, Inbox, Users } from 'lucide-react';
import React from 'react';
import NextLink from 'next/link';
// import SelectGroupMembers from './SelectGroupMembers';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { useChannelStore } from '@/stores/useChannelStore';
import { RouterOutput, trpc } from '@/lib/trpc';
import { useUserStore } from '@/stores/useUserStore';
import { useChatStore } from '@/stores/useChatStore';
import LoggedInUserBox from '../LoggedInUserBox';
import SelectGroupMembers from './SelectGroupMembers';

const ConversationSidebar = () => {
  const setCurrentChannelId = useChannelStore(
    (state) => state.setCurrentChannelId
  );
  const currentChannelId = useChannelStore((state) => state.currentChannelId);
  const currentUser = useUserStore((state) => state.user);
  const setOneOnOnePartner = useChatStore((state) => state.setOneOnOnePartner);

  const { data: conversations } = trpc.conversation.getConversations.useQuery();

  const handleConversationClick = (
    conversation: RouterOutput['conversation']['getConversations'][number]
  ) => {
    if (currentChannelId === conversation.id) {
      return;
    }

    const otherParticipant = conversation.participants.find(
      (p) => p.user?.id !== currentUser?.id
    );

    if (otherParticipant?.user?.id) {
      setOneOnOnePartner(conversation.id, otherParticipant.user.id);
    }

    setCurrentChannelId(conversation.id);
  };

  const getConversationName = (
    conversation: RouterOutput['conversation']['getConversations'][number]
  ) => {
    if (conversation.isGroup) {
      const participantNames = conversation.participants
        .filter((p) => p.user && p.user.name)
        .map((p) => p.user.name);
      return participantNames.join(', ') || 'Unnamed Group';
    } else {
      const otherParticipant = conversation.participants.find(
        (p) => p.user?.id !== currentUser?.id
      );
      return otherParticipant?.user?.name || 'Unknown User';
    }
  };

  const getAvatarText = (
    conversation: RouterOutput['conversation']['getConversations'][number]
  ) => {
    if (conversation.isGroup) {
      const validParticipants = conversation.participants
        .filter((p) => p.user?.name)
        .slice(0, 2);
      return (
        validParticipants.map((p) => p.user?.name?.[0] || 'G').join('') || 'G'
      );
    } else {
      const otherParticipant = conversation.participants.find(
        (p) => p.user?.id !== currentUser?.id
      );
      return otherParticipant?.user?.name?.[0] || '?';
    }
  };

  return (
    <div className="w-60 border-r flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <Input placeholder="Find or start a conversation" className="h-8" />
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2 justify-start">
          <NextLink
            href="/channels/me/"
            onClick={() => setCurrentChannelId(null)}
            className={buttonVariants({
              variant: 'ghost',
              className: 'w-full justify-start px-2 mb-1',
            })}
          >
            <Users className="mr-2 h-4 w-4" />
            Friends
          </NextLink>
          <NextLink
            href="/channels/me/"
            onClick={() => setCurrentChannelId(null)}
            className={buttonVariants({
              variant: 'ghost',
              className: 'w-full justify-start px-2 mb-1',
            })}
          >
            <Inbox className="mr-2 h-4 w-4" />
            Inbox
          </NextLink>
          <NextLink
            href="/channels/me/"
            onClick={() => setCurrentChannelId(null)}
            className={buttonVariants({
              variant: 'ghost',
              className: 'w-full justify-start px-2 mb-4',
            })}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </NextLink>
          <div className="text-sm font-semibold mb-2 flex justify-between items-center px-2">
            <span>Direct Messages</span>
            <SelectGroupMembers isCreateGroup={true} />
          </div>
          {conversations?.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationClick(conversation)}
              className={buttonVariants({
                variant: 'ghost',
                className: cn(
                  'w-full justify-start px-2 mb-1 relative',
                  currentChannelId === conversation.id && 'bg-accent'
                ),
              })}
            >
              <Avatar className="h-8 w-8 mr-2">
                {conversation.isGroup ? (
                  <AvatarFallback>
                    <Users className="h-4 w-4" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback>{getAvatarText(conversation)}</AvatarFallback>
                )}
              </Avatar>
              <span className="flex-grow text-left">
                {getConversationName(conversation)}
              </span>
              {/* {conversation.unreadCount > 0 && (
              <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs absolute right-2">
                {conversation.unreadCount}
              </span>
            )} */}
            </button>
          ))}
        </div>
      </ScrollArea>
      <LoggedInUserBox />
    </div>
  );
};

export default ConversationSidebar;
