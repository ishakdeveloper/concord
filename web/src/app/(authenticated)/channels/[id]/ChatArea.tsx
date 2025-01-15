'use client';

import { Hash } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useGuildStore } from '@/stores/useGuildStore';
import { ChannelChatArea } from '../ChannelChatArea';
import { useChannelStore } from '@/stores/useChannelStore';

const ChatArea = () => {
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const currentChannelId = useChannelStore((state) => state.currentChannelId);
  const utils = trpc.useUtils();

  const { data: channel } = trpc.guild.guildChannel.getSingleChannel.useQuery(
    {
      guildId: currentGuildId ?? '',
      channelId: currentChannelId ?? '',
    },
    {
      enabled: !!currentGuildId && !!currentChannelId,
    }
  );

  const { data: messages } = trpc.message.getMessages.useQuery(
    {
      channelId: currentChannelId ?? '',
    },
    {
      enabled: !!currentChannelId,
    }
  );

  const { mutate: sendMessage } = trpc.message.sendMessage.useMutation({
    onSuccess: async () => {
      await utils.message.getMessages.invalidate({
        channelId: currentChannelId ?? '',
      });
    },
  });

  const header = (
    <div className="p-4 border-b flex items-center">
      <Hash className="mr-2 h-5 w-5" />
      <div className="font-bold">{channel?.slug}</div>
    </div>
  );

  return (
    <ChannelChatArea
      header={header}
      messages={messages?.messages ?? []}
      onSendMessage={async (content) => {
        sendMessage({
          channelId: currentChannelId ?? '',
          content,
        });
      }}
      inputPlaceholder={`Message #${channel?.slug}`}
      chatId={currentChannelId ?? ''}
      showUserProfile={true}
      //   socketPayload={{
      //     guild_id: currentGuildId ?? '',
      //     channel_id: currentChannelId ?? '',
      //   }}
    />
  );
};

export default ChatArea;
