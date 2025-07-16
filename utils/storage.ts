import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  endPoint: process.env.STORAGE_ENDPOINT || "localhost",
  port: 9000,
  useSSL: false,
  accessKey: process.env.STORAGE_ACCESS_KEY || "minioadmin",
  secretKey: process.env.STORAGE_SECRET_KEY || "minioadmin",
});

export async function uploadToStorage(phone: string, data: Buffer): Promise<string> {
  const bucket = process.env.STORAGE_BUCKET || "consent-logs";
  const objectName = `${phone}-${Date.now()}.bin`;

  // Ensure bucket exists
  const exists = await client.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await client.makeBucket(bucket, "us-east-1");
  }

  await client.putObject(bucket, objectName, data);
  return `${bucket}/${objectName}`; // Path inside MinIO
}
