'use client';

import React, { useEffect } from 'react';
// import ChannelSidebar from "./ChannelSidebar";
import { useGuildStore } from '@/stores/useGuildStore';
import MembersList from '../MembersList';
import ChannelSidebar from './ChannelSidebar';

export default function GuildLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const setCurrentGuildId = useGuildStore((state) => state.setCurrentGuildId);

  useEffect(() => {
    async function fetchParams() {
      const { id } = await params; // Await the Promise
      setCurrentGuildId(id); // Update Zustand store
    }

    fetchParams();
  }, [setCurrentGuildId]);

  return (
    <div className="flex flex-1">
      <ChannelSidebar />
      {children}
      <MembersList />
    </div>
  );
}