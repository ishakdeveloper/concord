import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { RouterOutput } from '@/lib/trpc';

interface PendingFriendsListProps {
  requests: RouterOutput['friend']['getPendingFriendRequests'];
  onAccept: (variables: { friendId: string }) => Promise<any>;
  onDecline: (variables: { friendId: string }) => Promise<any>;
  isLoading: boolean;
}

export const PendingFriendsList = ({
  requests,
  onAccept,
  onDecline,
  isLoading,
}: PendingFriendsListProps) => {
  if (isLoading) return <div>Loading pending requests...</div>;
  if (!requests?.length) return <div>No pending friend requests</div>;

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center mb-4 p-2 hover:bg-accent rounded-md"
        >
          <UserAvatar
            src={request.requester.image}
            fallback={request.requester.name ?? ''}
            size="md"
            className="mr-3"
          />
          <div className="flex-grow">
            <div className="font-semibold">{request.requester.name}</div>
            <div className="text-sm text-muted-foreground">
              {request.type === 'incoming' ? (
                <span className="text-blue-500">Incoming Friend Request</span>
              ) : (
                <span className="text-green-500">Outgoing Friend Request</span>
              )}
            </div>
          </div>
          {request.type === 'incoming' && (
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onAccept({ friendId: request.id })}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDecline({ friendId: request.id })}
              >
                Decline
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
