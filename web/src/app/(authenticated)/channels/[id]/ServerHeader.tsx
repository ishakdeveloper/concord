import {
  ChevronDown,
  FolderPlus,
  Pencil,
  Plus,
  Settings,
  Trash,
  UserPlus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGuildStore } from '@/stores/useGuildStore';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

interface ServerHeaderProps {
  onCreateChannel: () => void;
  onCreateCategory: () => void;
  onInvitePeople: () => void;
}

export const ServerHeader = ({
  onCreateChannel,
  onCreateCategory,
  onInvitePeople,
}: ServerHeaderProps) => {
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const router = useRouter();

  const { data: guild } = trpc.guild.getSingleGuild.useQuery(
    {
      guildId: currentGuildId ?? '',
    },
    {
      enabled: !!currentGuildId,
    }
  );

  const { mutate: deleteGuild } = trpc.guild.deleteGuild.useMutation({
    onSuccess: () => {
      router.push('/channels/me');
    },
  });

  const handleDeleteGuild = () => {
    deleteGuild({ guildId: currentGuildId ?? '' });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="p-4 font-bold flex items-center justify-between cursor-pointer hover:bg-accent/50">
          <span>{guild?.guild.name}</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Server</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Server Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onInvitePeople}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>Invite People</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateChannel}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Channel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateCategory}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Create Category</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={handleDeleteGuild}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete Server</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
