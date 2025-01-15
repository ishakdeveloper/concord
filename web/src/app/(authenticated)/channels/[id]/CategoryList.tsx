import { Button } from '@/components/ui/button';
import { useGuildStore } from '@/stores/useGuildStore';
import { useState, Fragment } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableChannel } from './SortableChannel';
import { Hash } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { SortableCategory } from './SortableCategory';

export const CategoryList = () => {
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<{
    id: string;
    type: 'channel' | 'category';
  } | null>(null);
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const utils = trpc.useUtils();
  const { data: channels } = trpc.guild.guildChannel.getGuildChannels.useQuery(
    { guildId: currentGuildId ?? '' },
    {
      enabled: !!currentGuildId,
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleToggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setActiveItem({
      id: active.id as string,
      type: active.data.current?.type || 'channel',
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setDragOverId(null);
      return;
    }

    // If dragging a channel over a category
    if (
      activeItem?.type === 'channel' &&
      over.data.current?.type === 'category'
    ) {
      const categoryId = over.id as string;
      const category = channels?.categorized.find((c) => c.id === categoryId);
      if (category) {
        // Show drop indicator at the end of the category's channels
        setDragOverId(`${categoryId}-end`);
        return;
      }
    }

    setDragOverId(over.id as string);
  };

  const { mutate: reorderChannel } =
    trpc.guild.guildChannel.reorderChannel.useMutation({
      onSuccess: () => {
        utils.guild.guildChannel.getGuildChannels.invalidate({
          guildId: currentGuildId ?? '',
        });
      },
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      if (activeItem?.type === 'channel') {
        const channelId = active.id as string;
        let targetCategoryId: string | null = null;
        const newPosition = 0; // Calculate this based on drop position

        if (over.data.current?.type === 'category') {
          targetCategoryId = over.id as string;
        } else if (over.data.current?.categoryId) {
          targetCategoryId = over.data.current.categoryId;
        }

        reorderChannel({
          channelId,
          newPosition,
          newCategoryId: targetCategoryId ?? '',
          guildId: currentGuildId ?? '',
        });
      }
    }

    setActiveId(null);
    setActiveItem(null);
    setDragOverId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      {/* Uncategorized channels */}
      <SortableContext
        items={channels?.uncategorized.map((c) => c.id) ?? []}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5">
          {channels?.uncategorized.map((channel) => (
            <Fragment key={channel.id}>
              {dragOverId === channel.id && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-2" />
              )}
              <SortableChannel channel={channel} />
            </Fragment>
          ))}
        </div>
      </SortableContext>

      {/* Categorized channels */}
      <SortableContext
        items={channels?.categorized.map((c) => c.id) ?? []}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {channels?.categorized.map((category) => (
            <Fragment key={category.id}>
              {dragOverId === category.id && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-2" />
              )}
              <SortableCategory
                category={category}
                isCollapsed={collapsedCategories.includes(category.id)}
                onToggle={() => handleToggleCategory(category.id)}
                dragOverId={dragOverId}
              />
              {dragOverId === `${category.id}-end` && (
                <div className="h-0.5 bg-blue-500 rounded-full mx-2 ml-5" />
              )}
            </Fragment>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId && activeItem?.type === 'channel' && (
          <div className="opacity-50">
            <Button variant="ghost" className="w-full justify-start px-2">
              <Hash className="mr-2 h-4 w-4" />
              {
                [
                  ...(channels?.uncategorized ?? []),
                  ...(channels?.categorized.flatMap((c) => c.channels) ?? []),
                ].find((c) => c.id === activeId)?.name
              }
            </Button>
          </div>
        )}
        {activeId && activeItem?.type === 'category' && (
          <div className="opacity-50 flex items-center text-sm font-semibold p-1">
            <ChevronRight className="h-4 w-4 mr-1" />
            {channels?.categorized.find((c) => c.id === activeId)?.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
