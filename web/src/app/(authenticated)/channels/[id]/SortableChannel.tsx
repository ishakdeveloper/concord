import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Hash, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useChannelStore } from '@/stores/useChannelStore';
import { RouterOutput } from '@/lib/trpc';

interface SortableChannelProps {
  channel: RouterOutput['guild']['guildChannel']['getSingleChannel'];
  categoryId?: string;
}

export const SortableChannel = ({
  channel,
  categoryId,
}: SortableChannelProps) => {
  const currentChannelId = useChannelStore((state) => state.currentChannelId);
  const setCurrentChannelId = useChannelStore(
    (state) => state.setCurrentChannelId
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: channel.id,
    data: {
      type: 'channel',
      channel,
      categoryId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as const,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <Button
            variant="ghost"
            className={`w-full justify-start px-2 ${
              currentChannelId === channel.id ? 'bg-accent' : ''
            }`}
            onClick={() => setCurrentChannelId(channel.id)}
          >
            <Hash className="mr-2 h-4 w-4" />
            {channel.name}
          </Button>
        </div>
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
  );
};
