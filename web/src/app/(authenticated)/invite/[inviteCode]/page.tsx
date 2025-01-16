'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

export default function InvitePage({
  params,
}: {
  params: { inviteCode: string };
}) {
  const { data: guild } = trpc.invite.getGuildByInviteCode.useQuery({
    inviteCode: params.inviteCode,
  });

  const joinServerMutation = trpc.invite.useInviteLink.useMutation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            You&apos;ve been invited to join
          </h2>
          <h1 className="text-3xl font-bold mt-2">{guild?.guilds.name}</h1>
        </div>

        <Button
          className="w-full"
          onClick={() =>
            joinServerMutation.mutate({ inviteCode: params.inviteCode })
          }
          disabled={joinServerMutation.isPending}
        >
          {joinServerMutation.isPending ? 'Joining...' : 'Join Server'}
        </Button>
      </div>
    </div>
  );
}
