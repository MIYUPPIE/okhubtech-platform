import { z } from "zod";

/**
 * One schema for every environment variable this service needs. Validated
 * lazily (first access, not import time) so `next build`'s typecheck pass
 * doesn't require a real .env, but any route that actually touches
 * Paystack/Cloudinary/SMTP/admin auth fails loudly and immediately if it's
 * misconfigured, instead of sending a malformed request to a payment API.
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url(),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(16),
  DOWNLOAD_TOKEN_TTL_HOURS: z.coerce.number().int().positive().default(72),
  DOWNLOAD_MAX_USES: z.coerce.number().int().positive().default(5),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`video-store: invalid or missing environment configuration — ${problems}`);
  }
  cached = parsed.data;
  return cached;
}
