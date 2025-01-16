'use client';

import { Hash, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChannelChatArea } from '../../ChannelChatArea';
// import { VoiceVideoControls } from '../../VoiceVideoControls';
// import { CallOverlay } from '../../CallOverlay';
import { useChannelStore } from '@/stores/useChannelStore';
import { RouterOutput, trpc } from '@/lib/trpc';
import GroupMembers from './GroupMembers';
import { useUserStore } from '@/stores/useUserStore';
import SelectGroupMembers from '../SelectGroupMembers';
import { useConversations } from '@/hooks/useConversations';

const PrivateChatbox = () => {
  const currentChannelId = useChannelStore((state) => state.currentChannelId);
  const router = useRouter();
  const utils = trpc.useUtils();
  const currentUserId = useUserStore((state) => state.user?.id);

  const { getSingleConversation } = useConversations();
  const { data: conversation } = getSingleConversation;

  const { data: messages } = trpc.message.getMessages.useQuery(
    {
      conversationId: currentChannelId ?? '',
      limit: 50,
    },
    {
      enabled: !!currentChannelId,
    }
  );

  const { mutate: sendApiMessage } = trpc.message.sendMessage.useMutation({
    onSuccess: async () => {
      await utils.message.getMessages.invalidate({
        conversationId: currentChannelId ?? '',
      });
    },
  });

  const getConversationName = (
    conversation: RouterOutput['conversation']['getSingleConversation']
  ) => {
    if (!conversation?.participants) return 'Loading...';

    if (conversation.isGroup) {
      return (
        conversation.participants
          .filter((p) => p.userId !== currentUserId)
          .map((p) => p.user?.name)
          .filter(Boolean)
          .join(', ') || 'Unnamed Group'
      );
    } else {
      const otherParticipant = conversation.participants.find(
        (p) => p.user?.id !== currentUserId
      );
      return otherParticipant?.user?.name || 'Unnamed Chat';
    }
  };

  const handleLeaveGroup = () => {
    if (!currentChannelId) return;
    router.push('/channels/me');
  };

  const header = (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center">
        <Hash className="mr-2 h-5 w-5" />
        <div className="font-bold">
          {conversation && getConversationName(conversation)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* <VoiceVideoControls
          channelId={currentChannelId ?? ''}
          isGroup={conversation?.isGroup}
        /> */}
        {conversation?.isGroup && (
          <>
            <SelectGroupMembers
              isCreateGroup={false}
              icon={<UserPlus className="h-5 w-5" />}
            />
            <Button variant="ghost" size="icon" onClick={handleLeaveGroup}>
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* {conversation && (
        <CallOverlay
          channelId={currentChannelId ?? ''}
          participants={conversation.participants}
        />
      )} */}
      <ChannelChatArea
        header={header}
        messages={messages?.messages ?? []}
        onSendMessage={async (content) => {
          await sendApiMessage({
            content,
            conversationId: currentChannelId ?? '',
          });
        }}
        inputPlaceholder={`Message ${
          conversation && getConversationName(conversation)
        }`}
        chatId={currentChannelId ?? ''}
        showUserProfile={true}
        rightSidebar={conversation?.isGroup ? <GroupMembers /> : undefined}
      />
    </>
  );
};

export default PrivateChatbox;
