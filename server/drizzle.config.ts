import type { Config } from "drizzle-kit";
import { config } from "./src/config";

export default {
  schema: "./src/database/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: config.database.url,
  },
  verbose: true,
  strict: true,
} satisfies Config;
