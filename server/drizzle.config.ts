import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv-safe';
import { join } from 'path';

dotenv.config({
  path: join(
    __dirname,
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development'
  ),
});

export default {
  schema: './src/database/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
