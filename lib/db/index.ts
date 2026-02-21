import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("kabunav.db");
export const db = drizzle(sqlite, { schema });

// Export schema for easy access
export * from "./schema";
