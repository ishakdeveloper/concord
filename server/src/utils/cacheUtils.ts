import { redis } from '../services/redis';

export const cacheUtils = {
  // Clear all cache entries with a specific prefix
  async clearPrefix(prefix: string) {
    const keys = await redis.keys(`trpc:${prefix}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} keys with prefix ${prefix}`);
    }
  },

  // Clear specific cache entry
  async clearKey(key: string) {
    await redis.del(`trpc:${key}`);
    console.log(`Cleared key ${key}`);
  },

  // Clear user-specific cache
  async clearUserCache(userId: string) {
    const keys = await redis.keys(`trpc:*:*:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} keys for user ${userId}`);
    }
  },

  // Clear conversation cache
  async clearConversationCache(conversationId: string) {
    const keys = await redis.keys(
      `trpc:*:conversation.*:*:*${conversationId}*`
    );
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `Cleared ${keys.length} keys for conversation ${conversationId}`
      );
    }
  },

  // Clear guild cache
  async clearGuildCache(guildId: string) {
    const keys = await redis.keys(`trpc:*:guild.*:*:*${guildId}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} keys for guild ${guildId}`);
    }
  },

  // Monitor cache stats
  async getCacheStats() {
    const allKeys = await redis.keys('trpc:*');
    const stats = {
      total: allKeys.length,
      byPrefix: {} as Record<string, number>,
    };

    for (const key of allKeys) {
      const [, prefix] = key.split(':');
      stats.byPrefix[prefix] = (stats.byPrefix[prefix] || 0) + 1;
    }

    return stats;
  },

  // Clear message-related cache
  async clearMessageCache(conversationId?: string, channelId?: string) {
    const keys = [];

    if (conversationId) {
      const conversationKeys = await redis.keys(
        `trpc:*:messages.*:*${conversationId}*`
      );
      keys.push(...conversationKeys);
    }

    if (channelId) {
      const channelKeys = await redis.keys(`trpc:*:messages.*:*${channelId}*`);
      keys.push(...channelKeys);
    }

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} message cache keys`);
    }
  },

  // Clear all conversation-related cache for a user
  async clearConversationsCache(userId: string) {
    const keys = await redis.keys(`trpc:*:conversation.*:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `Cleared ${keys.length} conversation cache keys for user ${userId}`
      );
    }
  },

  // Clear specific conversation cache
  async clearSingleConversationCache(conversationId: string, userId?: string) {
    const pattern = userId
      ? `trpc:*:conversation.*:${userId}:*${conversationId}*`
      : `trpc:*:conversation.*:*:*${conversationId}*`;

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `Cleared ${keys.length} cache keys for conversation ${conversationId}`
      );
    }
  },
};
