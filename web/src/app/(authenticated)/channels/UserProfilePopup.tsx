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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
            <div className="h-20 bg-primary/10 rounded-t-lg" />

            {/* Avatar */}
            <div className="absolute -bottom-6 left-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user?.name ?? 'User'}
                  />
                  <AvatarFallback>{user?.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>
                <span className="absolute right-0 bottom-0 ring-2 ring-background rounded-full z-10 bg-gray-500 h-3 w-3" />
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-2 mt-8">
            <h3 className="font-bold text-lg">{user?.name}</h3>
            {user?.bio && (
              <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
            )}

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
