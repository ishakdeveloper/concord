import { AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState } from 'react';
import UserProfilePopup from '../../UserProfilePopup';
import { Avatar } from '@/components/ui/avatar';
import { trpc } from '@/lib/trpc';
import { useUserStore } from '@/stores/useUserStore';
import { useChannelStore } from '@/stores/useChannelStore';

const GroupMembers = () => {
  const userId = useUserStore((state) => state.user?.id);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const currentChannelId = useChannelStore((state) => state.currentChannelId);

  const { data: members, isLoading } =
    trpc.conversation.getConversationMembers.useQuery(
      {
        conversationId: currentChannelId ?? '',
      },
      {
        enabled: !!currentChannelId,
      }
    );

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;

  if (!members) return null;

  return (
    <div className="w-60 border-l flex flex-col">
      <div className="p-4 flex items-center border-b">
        <Users className="mr-2 h-4 w-4" />
        <span className="font-semibold">Group Members</span>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-2">
          {members?.participants.map((participant) => (
            <div
              key={participant.user.id}
              className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
              onClick={() => {
                setSelectedUserId(
                  selectedUserId === participant.user.id
                    ? null
                    : participant.user.id
                );
              }}
            >
              <UserProfilePopup
                userId={participant.user.id}
                open={selectedUserId === participant.user.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedUserId(null);
                  }
                }}
              />
              <Avatar className="h-8 w-8 mr-2">
                {participant.user.image ? (
                  <img
                    src={participant.user.image}
                    alt={`${participant.user.name}'s avatar`}
                  />
                ) : (
                  <AvatarFallback>
                    {participant.user.name?.[0] ?? 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {participant.user.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {participant.user.id === userId ? 'You' : 'Member'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GroupMembers;
