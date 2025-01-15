'use client';

import React, { useEffect } from 'react';
import ChatArea from '../ChatArea';
import { useChannelStore } from '@/stores/useChannelStore';

export default function ChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const setCurrentChannelId = useChannelStore(
    (state) => state.setCurrentChannelId
  );

  useEffect(() => {
    async function fetchParams() {
      const { channelId } = await params; // Await the Promise
      setCurrentChannelId(channelId); // Update Zustand store
    }

    fetchParams();
  }, [params, setCurrentChannelId]);

  // useEffect(() => {
  //   if (socket) {
  //     socket.sendMessage({
  //       op: "join_guild",
  //       guild_id: getCurrentGuildId ?? "",
  //     });
  //   }
  // }, [getCurrentGuildId]);

  return (
    <>
      <ChatArea />
    </>
  );
}
