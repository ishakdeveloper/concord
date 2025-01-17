'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/useUserStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/UserAvatar';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

export default function LoggedInUserBox() {
  const router = useRouter();
  const { clearUser } = useUserStore();

  const { mutate: logout } = trpc.user.logout.useMutation({
    onSuccess: () => {
      clearUser();
      router.push('/login');
    },
  });

  const { data: me } = trpc.user.me.useQuery();

  return (
    <div className="p-2.5 border-t bg-muted/50 flex items-center gap-2">
      <div className="relative h-9 w-9">
        <UserAvatar
          src={me?.user?.image}
          fallback={me?.user?.displayName?.[0] ?? 'U'}
          size="sm"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{me?.user?.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          #{me?.user?.discriminator}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                fill="currentColor"
              />
              <path
                d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                fill="currentColor"
              />
              <path
                d="M20 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/channels/me/${me?.user?.id}`}>My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/channels/me/settings">User Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
