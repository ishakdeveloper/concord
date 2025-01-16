import { Redis } from 'ioredis';

const redisClient = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  }
);

redisClient.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

export const redis = redisClient;
