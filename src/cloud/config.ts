// NEW FILE - Cloud database configuration
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use your existing schema or create cloud-specific one
import * as schema from '../db/schema.js';

const connectionString = process.env.CLOUD_DB_URL!;

const client = postgres(connectionString, { 
  prepare: false,
  max: 10 
});

export const cloudDb = drizzle(client, { schema });