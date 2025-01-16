import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
  src?: string | null;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({
  src,
  fallback,
  className,
  ...props
}: AvatarProps) {
  return (
    <div className="relative inline-block h-9 w-9">
      <Avatar className={cn('relative', className)} {...props}>
        <AvatarImage src={src ?? undefined} className="object-cover" />
        <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'absolute right-0 bottom-0 ring-2 ring-background rounded-full z-10',
          'bg-gray-500',
          'h-2 w-2'
        )}
      />
    </div>
  );
}
