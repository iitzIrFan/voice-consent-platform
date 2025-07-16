// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { Redis } from "https://deno.land/x/upstash_redis/mod.ts";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

serve(async (req) => {
  const payload = (await req.json()) as any;
  const { phone, consent_type, recording_url, timestamp } = payload;
  if (!phone || !consent_type || !recording_url) {
    return new Response("Invalid payload", { status: 400 });
  }
  await redis.rpush(
    "consent-queue",
    JSON.stringify({
      phone,
      consent_type,
      recording_url,
      timestamp: timestamp || new Date().toISOString(),
    }),
  );
  return new Response("Queued", { status: 200 });
});
