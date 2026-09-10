import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  GEOSPATIAL_WORKER_URL: z.string().optional(),
  JWT_SECRET: z.string(),
  VITE_GOOGLE_MAPS_API_KEY: z.string(),
  MODEL_SERVICE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
