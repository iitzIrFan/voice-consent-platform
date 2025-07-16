import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

interface Web3StorageResponse {
  cid: string;
  // Add other fields from the response if needed
  [key: string]: any;
}

export async function pinToIPFS(filePath: string): Promise<string> {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) throw new Error("WEB3_STORAGE_TOKEN missing");

  const res = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-NAME": filePath,
    },
    body: Buffer.from("placeholder"), // we would stream file content in prod
  });

  if (!res.ok) {
    throw new Error(`Failed to pin to IPFS: ${await res.text()}`);
  }
  
  const json = await res.json() as Web3StorageResponse;
  if (!json.cid) {
    throw new Error('Invalid response from Web3.Storage: Missing CID');
  }
  
  return json.cid;
}
