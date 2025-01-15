import React from 'react';
import ConversationSidebar from './ConversationSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <ConversationSidebar />
      {children}
    </div>
  );
}
