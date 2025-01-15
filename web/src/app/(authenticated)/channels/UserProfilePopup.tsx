import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/trpc';
import { Loader2, MessageSquare } from 'lucide-react';
import React from 'react';

interface UserProfilePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const UserProfilePopup = ({
  open,
  onOpenChange,
  userId,
}: UserProfilePopupProps) => {
  const { data: user, isLoading } = trpc.user.getUser.useQuery({
    userId: userId ?? '',
  });

  if (!user) return null;

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-4"
          align="start"
          side="right"
          onPointerDownOutside={() => onOpenChange(false)}
        >
          <div className="relative">
            {/* Banner */}
            <div className="h-16 bg-primary/10 rounded-t-lg" />

            {/* Avatar */}
            <Avatar className="h-16 w-16 absolute -bottom-8 left-4 border-4 border-background">
              <AvatarFallback className="text-xl">
                {user?.name?.[0] ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="pt-10 px-2">
            <h3 className="font-bold text-lg">{user?.name}</h3>

            <div className="mt-3 flex gap-2">
              <Button size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>

            <Separator className="my-3" />

            {/* Additional Info */}
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground">
                  MEMBER SINCE
                </h4>
                <p className="text-xs">
                  {user?.createdAt
                    ? new Date(user?.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>

              {user?.email && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground">
                    EMAIL
                  </h4>
                  <p className="text-xs">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </PopoverTrigger>
    </Popover>
  );
};

export default UserProfilePopup;
