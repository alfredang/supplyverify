/**
 * Minimal IPFS upload via web3.storage HTTP API.
 * Falls back to a deterministic mock CID when no token is configured (dev only).
 */
const TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
const ENDPOINT = "https://api.web3.storage/upload";

export async function uploadFile(file: File): Promise<string> {
  if (!TOKEN) {
    return `mock://${file.name}-${Date.now()}`;
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: file,
  });
  if (!res.ok) throw new Error(`IPFS upload failed: ${res.status}`);
  const json = (await res.json()) as { cid: string };
  return json.cid;
}

export async function uploadJson(data: unknown): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const file = new File([blob], "metadata.json");
  return uploadFile(file);
}

export function ipfsUrl(cid: string): string {
  if (cid.startsWith("mock://")) return cid;
  return `https://${cid}.ipfs.w3s.link`;
}
