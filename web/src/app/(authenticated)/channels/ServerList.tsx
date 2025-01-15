'use client';

import { Bell, BellOff, Link, LogOut } from 'lucide-react';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { trpc } from '@/lib/trpc';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CreateGuildModal } from './CreateGuildModal';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Separator } from '@/components/ui/separator';

const ServerList = () => {
  const { data: guilds, isLoading } = trpc.guild.getAllGuilds.useQuery();

  return (
    <div className="w-20 border-r flex flex-col items-center py-4 space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/channels/me/`}>
              <Button
                variant="secondary"
                className="w-12 h-12 rounded-2xl p-0 bg-primary/10 hover:bg-primary/20"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Home</p>
          </TooltipContent>
        </Tooltip>
        <Separator className="my-2 w-8" />
        {isLoading ? (
          <>
            <div className="w-12 h-12 rounded-[24px] bg-primary/10 animate-pulse" />
          </>
        ) : (
          guilds?.map((guild) => (
            <ContextMenu key={guild.guilds.id}>
              <ContextMenuTrigger>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-12 h-12 rounded-[24px] p-0 overflow-hidden transition-all duration-200 hover:rounded-[16px]"
                    >
                      <Avatar>
                        <AvatarFallback>{guild.guilds.name[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{guild.guilds.name}</p>
                  </TooltipContent>
                </Tooltip>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Mute Server
                </ContextMenuItem>
                <ContextMenuItem>
                  <BellOff className="mr-2 h-4 w-4" />
                  Unmute Server
                </ContextMenuItem>
                <ContextMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Server
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))
        )}

        <CreateGuildModal />
      </TooltipProvider>
    </div>
  );
};

export default ServerList;