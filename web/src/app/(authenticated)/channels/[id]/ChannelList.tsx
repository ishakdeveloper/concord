import { Button } from '@/components/ui/button';
import { Hash, Pencil, Trash } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useChannelStore } from '@/stores/useChannelStore';

interface ChannelListProps {
  channels: any[];
}

export const ChannelList = ({ channels }: ChannelListProps) => {
  const currentChannelId = useChannelStore((state) => state.currentChannelId);
  const setCurrentChannelId = useChannelStore(
    (state) => state.setCurrentChannelId
  );

  const handleChannelClick = (channelId: string) => {
    setCurrentChannelId(channelId);
  };

  return (
    <div className="space-y-0.5">
      {channels.map((channel) => (
        <ContextMenu key={channel.id}>
          <ContextMenuTrigger>
            <Button
              variant="ghost"
              className={`w-full justify-start px-2 ${
                currentChannelId === channel.id ? 'bg-accent' : ''
              }`}
              onClick={() => handleChannelClick(channel.id)}
            >
              <Hash className="mr-2 h-4 w-4" />
              {channel.slug}
            </Button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Channel
            </ContextMenuItem>
            <ContextMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete Channel
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  );
};
