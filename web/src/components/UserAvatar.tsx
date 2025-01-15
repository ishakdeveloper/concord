import { cn } from '@/lib/utils';
import {
  Avatar as RadixAvatar,
  AvatarFallback,
  AvatarImage,
} from '@radix-ui/react-avatar';

export type Status = 'online' | 'idle' | 'dnd' | 'offline' | 'invisible';

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof RadixAvatar> {
  src?: string | null;
  fallback: string;
  status?: Status;
  size?: 'sm' | 'md' | 'lg';
}

const statusColors: Record<Status, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500',
  invisible: 'bg-gray-500',
};

const statusSizes = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function UserAvatar({
  src,
  fallback,
  status,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <div className="relative inline-block">
      <RadixAvatar
        className={cn('relative rounded-full', sizeClasses[size], className)}
        {...props}
      >
        <AvatarImage
          src={src ?? undefined}
          className="h-full w-full rounded-full object-cover"
        />
        <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs">
          {fallback}
        </AvatarFallback>
      </RadixAvatar>
      {status && (
        <span
          className={cn(
            'absolute right-0 bottom-0 ring-1 ring-background rounded-full z-10',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}
