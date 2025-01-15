import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import UserProfilePopup from './UserProfilePopup';
import { useState } from 'react';
import { formatDate } from '@/utils/formatDate';
import { UserState } from '@/stores/useUserStore';

interface MessageItemProps {
  //   message: RouterOutput['message']['getMessages']['messages'][number];
  message: any;
  currentUser: UserState;
  showUserProfile?: boolean;
}

export const MessageItem = ({
  message,
  currentUser,
  showUserProfile,
}: MessageItemProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setUserProfileOpen(true);
  };

  const author = message.author || message.authorId;
  const isCurrentUser = author?.id === currentUser?.id;

  if (message.isSystem) {
    return (
      <div key={message.id} className="mb-4">
        <div className="flex items-center mb-1">
          <div className="font-semibold">System</div>
          <div className="text-muted-foreground text-xs ml-2">
            {formatDate(message.createdAt)}
          </div>
        </div>
        <div className="text-muted-foreground text-sm ml-10">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 group hover:bg-accent hover:rounded-md p-2 relative">
      <div className="flex items-center mb-1">
        {showUserProfile ? (
          <Popover
            open={userProfileOpen && selectedUser?.id === author?.id}
            onOpenChange={(open) => {
              setUserProfileOpen(open);
              if (!open) setSelectedUser(null);
            }}
          >
            <PopoverTrigger asChild>
              <div onClick={() => handleUserClick(author)}>
                <Avatar className="h-8 w-8 mr-2 cursor-pointer hover:opacity-80">
                  <AvatarFallback>{author?.name?.[0]}</AvatarFallback>
                </Avatar>
              </div>
            </PopoverTrigger>
            <UserProfilePopup
              userId={author?.id ?? ''}
              open={userProfileOpen && selectedUser?.id === author?.id}
              onOpenChange={(open) => {
                setUserProfileOpen(open);
                if (!open) setSelectedUser(null);
              }}
            />
          </Popover>
        ) : (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarFallback>{author?.name?.[0] ?? 'U'}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`font-semibold ${
            showUserProfile ? 'cursor-pointer hover:underline' : ''
          }`}
          onClick={showUserProfile ? () => handleUserClick(author) : undefined}
        >
          {author?.name}
        </div>
        <div className="text-muted-foreground text-xs ml-2">
          {formatDate(message.createdAt)}
        </div>
        {isCurrentUser && (
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Message</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <div className="ml-10">{message.content}</div>
    </div>
  );
};
