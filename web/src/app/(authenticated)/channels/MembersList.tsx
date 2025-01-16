'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { useGuildStore } from '@/stores/useGuildStore';
import UserProfilePopup from './UserProfilePopup';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { UserAvatar } from '@/components/UserAvatar';

const MembersList = () => {
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: guildMembers } = trpc.guild.getGuildMembers.useQuery(
    {
      guildId: currentGuildId ?? '',
    },
    {
      enabled: !!currentGuildId,
    }
  );

  useEffect(() => {}, []);

  return (
    <div className="w-60 border-l p-4">
      <div className="text-sm font-semibold mb-4">
        Members — {guildMembers?.members.length}
      </div>
      <ScrollArea className="h-full">
        {guildMembers?.members.map((member) => (
          <div key={member.users.id}>
            {/* Member row */}
            <div
              className="flex items-center mb-2 p-2 rounded hover:bg-accent cursor-pointer relative"
              onClick={() => {
                setSelectedUserId(
                  selectedUserId === member.users.id ? null : member.users.id
                );
              }}
            >
              {/* User Profile Popup */}
              <UserProfilePopup
                userId={member.users.id}
                open={selectedUserId === member.users.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedUserId(null);
                  }
                }}
              />
              <UserAvatar
                src={member.users.image ?? ''}
                fallback={member.users.name?.[0] ?? ''}
              />
              <div className="ml-3">
                <div className="font-medium">{member.users.name}</div>
                <div className="text-xs text-muted-foreground">
                  {member.users.bio?.slice(0, 20)}
                  {member.users.bio && member.users.bio.length > 20
                    ? '...'
                    : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default MembersList;
