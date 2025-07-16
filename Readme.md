# Modern Voice Consent Platform – End-to-End Documentation

This document outlines the complete architecture, implementation, and deployment plan for a privacy-first, serverless voice + messaging consent platform. Built with modern tools like Supabase, Twilio, Redis, IPFS, and blockchain anchoring, it is compliant with data localization, consent laws, and auditable logs.

---

## 📌 Overview

A cloud-native platform to:

* Contact real estate agents in Georgia via voice
* Capture and encrypt consent via IVR or DTMF
* Log encrypted data and anchor to blockchain
* Send messages (SMS or WhatsApp) only after successful logging

---

## 🛠️ Tech Stack

| Component             | Tool/Service                             |
| --------------------- | ---------------------------------------- |
| Voice Call & IVR      | Twilio / SignalWire                      |
| Backend Functions     | Supabase Edge Functions                  |
| Queue System          | Redis (Upstash or hosted)                |
| File Storage          | MinIO / STORJ                            |
| Decentralized Storage | IPFS (Pinata/Web3.Storage)               |
| Blockchain Anchoring  | Filecoin (Lighthouse) / Arweave (Bundlr) |
| Messaging             | Twilio SMS/WhatsApp, SMSoffice.ge        |
| Frontend Dashboard    | Next.js + Supabase Auth                  |
| Monitoring            | Grafana Cloud + BetterStack              |
| CI/CD                 | GitHub Actions + Terraform               |

---

## 🧱 File Structure

```sh
voice-consent-platform/
├── supabase/functions/consentLogger.ts
├── redis/worker.ts
├── utils/
│   ├── encrypt.ts
│   ├── storage.ts
│   ├── ipfs.ts
│   └── anchor.ts
├── dashboard/ (Next.js)
├── .env.example
├── README.md
```

---

## 🔁 Consent Logging Flow

1. Call via Twilio
2. Agent hears IVR menu: Press 1 for SMS, 9 to opt-out, 5 for live agent
3. Supabase Edge Function logs DTMF event → pushes to Redis
4. Redis worker encrypts data, uploads to MinIO/STORJ
5. Pins metadata to IPFS
6. Anchors CID to blockchain
7. Sends message only if CID anchoring succeeds

---

## 📤 Supabase Edge Function: `consentLogger.ts`

```ts
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { Redis } from "https://deno.land/x/upstash_redis/mod.ts";

const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL")!,
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN")!,
});

serve(async (req) => {
  const { phone, consent_type, recording_url, timestamp } = await req.json();
  if (!phone || !consent_type || !recording_url) {
    return new Response("Invalid payload", { status: 400 });
  }
  await redis.rpush("consent-queue", JSON.stringify({
    phone, consent_type, recording_url, timestamp: timestamp || new Date().toISOString()
  }));
  return new Response("Queued", { status: 200 });
});
```

---

## 🧵 Redis Worker: `worker.ts`

```ts
import Redis from "ioredis";
import { encrypt } from "../utils/encrypt";
import { uploadToStorage } from "../utils/storage";
import { pinToIPFS } from "../utils/ipfs";
import { anchorToChain } from "../utils/anchor";

const redis = new Redis(process.env.UPSTASH_REDIS_URL);

async function processQueue() {
  while (true) {
    const jobData = await redis.lpop("consent-queue");
    if (!jobData) continue;

    const job = JSON.parse(jobData);
    const encrypted = await encrypt(job);
    const fileUrl = await uploadToStorage(job.phone, encrypted);
    const cid = await pinToIPFS(fileUrl);
    await anchorToChain(cid);
    console.log(`✅ Consent for ${job.phone} anchored at CID: ${cid}`);
  }
}

processQueue();
```

---

## 🔐 Encryption Logic: `encrypt.ts`

```ts
import crypto from "crypto";

export function encrypt(data: any) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const json = JSON.stringify(data);
  let encrypted = cipher.update(json, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}
```

---

## 🌐 Regulator Dashboard: `dashboard/`

* Built with **Next.js + Tailwind + Supabase Auth**
* Search by hashed phone number (HMAC)
* View timelines, download logs, validate CID + blockchain

---

## 📡 Monitoring & CI/CD

* **Grafana Cloud**: Alert if queue grows or logging >30s
* **BetterStack**: Log errors + uptime
* **GitHub Actions**: Deploy Edge Functions, Redis worker
* **Terraform**: Provision Supabase, Redis, MinIO buckets

---

## ✅ Deployment Checklist

* [ ] All environment variables set (.env)
* [ ] Vault-managed encryption keys configured
* [ ] Supabase project + Edge Functions deployed
* [ ] Twilio numbers + templates set up
* [ ] IPFS + Filecoin/Arweave anchoring working
* [ ] Dashboard running and verified
* [ ] Monitoring dashboards live

---

## 📦 Future Extensions

* Consent visual timeline view per user
* Inbound WhatsApp/SMS consent ("YES", "STOP")
* Revocation hash anchoring
* Ethereum-based wallet login for agents
* Sentry integration for runtime tracing

---

## 📞 Contact & Authorship

Project by: **@iitzIrFan**
Designed for: **Regulator-Compliant Voice Messaging Consent in Georgia**
Open-source under: MIT License

---

## 📌 Tags

`#voice-consent` `#serverless` `#twilio` `#supabase` `#ipfs` `#redis` `#arweave` `#filecoin` `#nextjs`
