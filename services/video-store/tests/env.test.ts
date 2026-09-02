import { test } from "node:test";
import assert from "node:assert/strict";

const FULL_VALID_ENV: Record<string, string> = {
  DATABASE_URL: "file:./dev.db",
  APP_URL: "http://localhost:4100",
  PAYSTACK_SECRET_KEY: "sk_test_xxx",
  CLOUDINARY_CLOUD_NAME: "demo",
  CLOUDINARY_API_KEY: "123",
  CLOUDINARY_API_SECRET: "secret",
  SMTP_HOST: "smtp.example.com",
  SMTP_USER: "user",
  SMTP_PASSWORD: "password",
  EMAIL_FROM: "store@okhub.tech",
  ADMIN_EMAIL: "admin@okhub.tech",
  ADMIN_PASSWORD: "a-long-enough-password",
  ADMIN_SESSION_SECRET: "0123456789abcdef0123456789abcdef",
};

// Each scenario imports lib/env.ts fresh (cache-busted via a unique query
// string) because env() memoises its result at module scope on first call —
// without this, whichever scenario ran first would poison the others.
async function freshEnvModule() {
  return import(`../lib/env.ts?t=${Date.now()}-${Math.random()}`);
}

test("env() throws a descriptive error when required vars are missing", async () => {
  const saved = { ...process.env };
  for (const key of Object.keys(FULL_VALID_ENV)) delete process.env[key];
  try {
    const { env } = await freshEnvModule();
    assert.throws(() => env(), /invalid or missing environment configuration/);
  } finally {
    process.env = saved;
  }
});

test("env() succeeds and applies defaults when every required var is set", async () => {
  const saved = { ...process.env };
  Object.assign(process.env, FULL_VALID_ENV);
  try {
    const { env } = await freshEnvModule();
    const result = env();
    assert.equal(result.APP_URL, "http://localhost:4100");
    assert.equal(result.SMTP_PORT, 587); // default applied, not set above
    assert.equal(result.DOWNLOAD_TOKEN_TTL_HOURS, 72);
    assert.equal(result.DOWNLOAD_MAX_USES, 5);
  } finally {
    process.env = saved;
  }
});

test("env() rejects a malformed ADMIN_EMAIL even if everything else is valid", async () => {
  const saved = { ...process.env };
  Object.assign(process.env, FULL_VALID_ENV, { ADMIN_EMAIL: "not-an-email" });
  try {
    const { env } = await freshEnvModule();
    assert.throws(() => env(), /ADMIN_EMAIL/);
  } finally {
    process.env = saved;
  }
});
