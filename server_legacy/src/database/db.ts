import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.database.url,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

const db = drizzle(pool, { schema });

export default db;
