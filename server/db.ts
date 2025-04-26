import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Lade Umgebungsvariablen aus .env Datei
dotenv.config();

neonConfig.webSocketConstructor = ws;

// Development fallback für die Datenbank-URL
const DEFAULT_DATABASE_URL = "postgresql://neondb_owner:npg_Zmu5fPeRX7WB@ep-rough-recipe-a6zuu3nm.us-west-2.aws.neon.tech/neondb?sslmode=require";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL nicht gesetzt, verwende Standard-URL. Dies sollte nur in der Entwicklungsumgebung passieren.",
  );
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle({ client: pool, schema });