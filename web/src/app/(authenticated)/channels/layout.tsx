import React from 'react';
import ServerList from './ServerList';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <ServerList />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
