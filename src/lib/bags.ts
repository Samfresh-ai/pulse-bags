import type { BagsCreator } from "./types";

const BAGS_BASE_URL = process.env.BAGS_BASE_URL ?? "https://public-api-v2.bags.fm/api/v1";

function bagsHeaders() {
  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) throw new Error("BAGS_API_KEY is required for live Bags calls");
  return { "x-api-key": apiKey, "content-type": "application/json" };
}

function unwrapResponse<T>(json: unknown): T {
  if (json && typeof json === "object" && "response" in json) return (json as { response: T }).response;
  return json as T;
}

export async function getTokenCreators(tokenMint: string): Promise<BagsCreator[]> {
  const url = new URL(`${BAGS_BASE_URL}/token-launch/creator/v3`);
  url.searchParams.set("tokenMint", tokenMint);
  const res = await fetch(url, { headers: bagsHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`Bags token creator lookup failed: ${res.status}`);
  const json = await res.json();
  const response = unwrapResponse<BagsCreator[]>(json);
  return Array.isArray(response) ? response : [];
}

export async function getFeeShareWallet(provider: string, username: string) {
  const url = new URL(`${BAGS_BASE_URL}/token-launch/fee-share/wallet/v2`);
  url.searchParams.set("provider", provider);
  url.searchParams.set("username", username);
  const res = await fetch(url, { headers: bagsHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`Bags social wallet lookup failed: ${res.status}`);
  return unwrapResponse(await res.json());
}

export async function getFeeShareWalletsBulk(items: Array<{ provider: string; username: string }>) {
  const res = await fetch(`${BAGS_BASE_URL}/token-launch/fee-share/wallet/v2/bulk`, {
    method: "POST",
    headers: bagsHeaders(),
    body: JSON.stringify({ items }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Bags bulk social wallet lookup failed: ${res.status}`);
  return unwrapResponse(await res.json());
}

export async function createFeeShareAdminUpdateConfig(input: {
  baseMint: string;
  claimersArray: string[];
  basisPointsArray: number[];
  payer: string;
  additionalLookupTables?: string[];
}) {
  // Official Bags docs expose POST /fee-share/admin/update-config for fee-share admin config updates.
  const res = await fetch(`${BAGS_BASE_URL}/fee-share/admin/update-config`, {
    method: "POST",
    headers: bagsHeaders(),
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Bags fee-share config tx creation failed: ${res.status}`);
  return unwrapResponse(await res.json());
}
