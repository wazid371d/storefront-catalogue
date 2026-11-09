import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  FAKE_STORE_API_BASE_URL: z.string().url().default('https://fakestoreapi.com'),
  PRODUCT_CACHE_TTL_SECONDS: z.coerce.number().positive().default(900),

  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_FROM: z.string().min(1, 'SMTP_FROM is required'),
  SALES_INBOX_EMAIL: z.string().email('SALES_INBOX_EMAIL must be a valid email'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(20),
});

/**
 * Parsed once at boot. Fails fast with a readable message instead of
 * surfacing a confusing error the first time a missing var is touched.
 */
function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;
