import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import { useGuildStore } from '@/stores/useGuildStore';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useChannelStore } from '@/stores/useChannelStore';
interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  categoryName?: string;
}

export const CreateChannelModal = ({
  isOpen,
  onClose,
  categoryId,
  categoryName,
}: CreateChannelModalProps) => {
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const setCurrentChannelId = useChannelStore(
    (state) => state.setCurrentChannelId
  );

  const [channelName, setChannelName] = useState('');
  const utils = trpc.useUtils();
  const router = useRouter();

  const { mutate: createChannel } =
    trpc.guild.guildChannel.createChannel.useMutation({
      onSuccess: (newChannel) => {
        utils.guild.guildChannel.getGuildChannels.invalidate();

        setCurrentChannelId(newChannel.id);

        router.push(`/channels/${currentGuildId}/${newChannel.id}`);
        onClose();
        setChannelName('');
      },
    });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new channel{' '}
            {categoryName ? `in ${categoryName}` : 'in this server'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (channelName.trim()) {
              createChannel({
                guildId: currentGuildId ?? '',
                name: channelName,
                categoryId: categoryId,
              });
            }
          }}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">CHANNEL NAME</Label>
              <div className="flex items-center">
                <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="new-channel"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!channelName.trim()}>
              Create Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
