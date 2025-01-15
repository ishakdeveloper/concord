'use client';

import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/useUserStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { UserAvatar, type Status } from '@/components/UserAvatar';

export default function LoggedInUserBox() {
  const currentUser = useUserStore((state) => state.user);
  const [status, setStatus] = useState<Status>('online');

  const handleLogout = () => {};

  return (
    <div className="p-4 border-t bg-muted/50 flex items-center gap-2">
      <UserAvatar
        src={currentUser?.image}
        fallback={currentUser?.name?.[0] ?? 'U'}
        size="sm"
        status={status}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{currentUser?.name}</div>
        {/* <div className="text-xs text-muted-foreground truncate">
          #{currentUser?.discriminator}
        </div> */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg
              width="20"
              height="20"
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
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={status}
                onValueChange={(v) => setStatus(v as Status)}
              >
                <DropdownMenuRadioItem value="online">
                  Online
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="idle">Idle</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dnd">
                  Do Not Disturb
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="invisible">
                  Invisible
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/channels/me/${currentUser?.id}`}>My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/channels/me/settings">User Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
