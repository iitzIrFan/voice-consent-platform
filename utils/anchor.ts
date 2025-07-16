import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function anchorToChain(cid: string): Promise<void> {
  const key = process.env.LIGHTHOUSE_API_KEY;
  if (!key) throw new Error("LIGHTHOUSE_API_KEY missing");

  const res = await fetch("https://node.lighthouse.storage/api/v0/add", {
    method: "POST",
    headers: {
      Authorization: key,
    },
    body: JSON.stringify({ cid }),
  });

  if (!res.ok) {
    throw new Error(`Anchoring failed: ${await res.text()}`);
  }
}
