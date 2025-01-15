import React from 'react';

export default async function PrivateChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;

  return (
    <div className="flex w-full">
      {slug}
      {/* <PrivateChatbox slug={slug} /> */}
      {/* <UserProfile /> */}
    </div>
  );
}
