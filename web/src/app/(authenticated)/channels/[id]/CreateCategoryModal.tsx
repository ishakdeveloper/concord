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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useGuildStore } from '@/stores/useGuildStore';
import { trpc } from '@/lib/trpc';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
  setCategoryName?: (name: string) => void;
}

export const CreateCategoryModal = ({
  isOpen,
  onClose,
  categoryName,
  setCategoryName,
}: CreateCategoryModalProps) => {
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const utils = trpc.useUtils();

  const { mutate: createCategory } =
    trpc.guild.guildChannel.createCategory.useMutation({
      onSuccess: () => {
        utils.guild.getSingleGuild.invalidate();
        onClose();
        setCategoryName?.('');
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (categoryName?.trim()) {
      createCategory({
        guildId: currentGuildId ?? '',
        name: categoryName,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Create a new category to organize channels
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">CATEGORY NAME</Label>
              <Input
                id="category-name"
                placeholder="New Category"
                value={categoryName}
                onChange={(e) => setCategoryName?.(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <Label>PRIVATE CATEGORY</Label>
                  <p className="text-sm text-muted-foreground">
                    Only selected members and roles will be able to view this
                    category and its channels
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!categoryName?.trim()}>
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
