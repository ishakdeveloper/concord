'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
interface DeleteServerModalProps {
  guildId: string;
  open: boolean;
  onClose: () => void;
}

export function DeleteServerModal({
  guildId,
  open,
  onClose,
}: DeleteServerModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const deleteServerMutation = trpc.guild.deleteGuild.useMutation({
    onSuccess: () => {
      utils.guild.getAllGuilds.invalidate();
      router.push('/channels/me');
      toast({
        title: 'Server deleted',
        description: 'Your server has been permanently deleted.',
      });
    },
  });

  const handleDelete = async () => {
    try {
      await deleteServerMutation.mutateAsync({ guildId });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            server and remove all data associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteServerMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteServerMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Delete Server'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteServerModal;
