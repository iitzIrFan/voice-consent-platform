import Redis from "ioredis";
import dotenv from "dotenv";
import { encrypt } from "../utils/encrypt";
import { uploadToStorage } from "../utils/storage";
import { pinToIPFS } from "../utils/ipfs";
import { anchorToChain } from "../utils/anchor";

dotenv.config();

const redis = new Redis(process.env.UPSTASH_REDIS_URL as string);

async function processQueue() {
  while (true) {
    try {
      const jobData = await redis.lpop("consent-queue");
      if (!jobData) {
        await new Promise((r) => setTimeout(r, 1000)); // wait 1s if empty
        continue;
      }

      const job = JSON.parse(jobData);
      const encrypted = await encrypt(job);
      const fileUrl = await uploadToStorage(job.phone, encrypted);
      const cid = await pinToIPFS(fileUrl);
      await anchorToChain(cid);
      console.log(`✅ Consent for ${job.phone} anchored at CID: ${cid}`);
    } catch (err) {
      console.error("❌ Worker error", err);
    }
  }
}

processQueue();
