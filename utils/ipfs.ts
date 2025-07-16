import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

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
  const json = await res.json();
  return json.cid;
}
