import {
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu';
import { Hash, FolderPlus, UserPlus, Pencil, Trash } from 'lucide-react';
import { useGuildStore } from '@/stores/useGuildStore';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';

interface ChannelSidebarContextMenuProps {
  onCreateChannel: () => void;
  onCreateCategory: () => void;
  onInvitePeople: () => void;
  channelId?: string;
  categoryId?: string;
}

export const ChannelSidebarContextMenu = ({
  onCreateChannel,
  onCreateCategory,
  onInvitePeople,
  channelId,
  categoryId,
}: ChannelSidebarContextMenuProps) => {
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const handleEditChannel = async () => {
    if (!channelId) return;
    // Implement edit channel logic
    // You might want to open a modal here
    toast({
      title: 'Edit Channel',
      description: 'Channel editing will be implemented soon',
    });
  };

  const handleDeleteChannel = async () => {
    if (!channelId || !currentGuildId) return;
    try {
      await trpc.guild.guildChannel.deleteChannel.useMutation({
        onSuccess: () => {
          utils.guild.guildChannel.getGuildChannels.invalidate();

          toast({
            title: 'Success',
            description: 'Channel deleted successfully',
          });
        },
      });
      utils.guild.guildChannel.getGuildChannels.invalidate();

      toast({
        title: 'Success',
        description: 'Channel deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete channel',
        variant: 'destructive',
      });
    }
  };

  const handleEditCategory = async () => {
    if (!categoryId) return;
    // Implement edit category logic
    toast({
      title: 'Edit Category',
      description: 'Category editing will be implemented soon',
    });
  };

  const handleDeleteCategory = async () => {
    if (!categoryId || !currentGuildId) return;
    try {
      //   await client.api
      //     .guilds({ guildId: currentGuildId })
      //     .categories({ categoryId })
      //     .delete();
      utils.guild.guildChannel.getGuildChannels.invalidate();
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <ContextMenuItem onClick={onCreateChannel}>
        <Hash className="w-4 h-4 mr-2" />
        Create Channel
      </ContextMenuItem>
      <ContextMenuItem onClick={onCreateCategory}>
        <FolderPlus className="w-4 h-4 mr-2" />
        Create Category
      </ContextMenuItem>

      {channelId && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleEditChannel}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Channel
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDeleteChannel}
            className="text-red-500 focus:text-red-500"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Channel
          </ContextMenuItem>
        </>
      )}

      {categoryId && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleEditCategory}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit Category
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDeleteCategory}
            className="text-red-500 focus:text-red-500"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete Category
          </ContextMenuItem>
        </>
      )}

      <ContextMenuSeparator />
      <ContextMenuItem onClick={onInvitePeople}>
        <UserPlus className="w-4 h-4 mr-2" />
        Invite People
      </ContextMenuItem>
    </>
  );
};
