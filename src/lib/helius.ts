import type { Holder } from "./types";

export async function getTokenAccountsByMint(mint: string, page = 1, limit = 1000) {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) throw new Error("HELIUS_API_KEY is required for live holder sync");
  const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${apiKey}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "pulse-holder-sync",
      method: "getTokenAccounts",
      params: { mint, page, limit, displayOptions: { showZeroBalance: false } },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Helius holder sync failed: ${res.status}`);
  return res.json();
}

export function aggregateHeliusTokenAccounts(accounts: Array<{ owner?: string; address?: string; amount?: number | string }>): Holder[] {
  const byOwner = new Map<string, { wallet: string; tokenAccount?: string; uiBalance: number }>();
  for (const account of accounts) {
    if (!account.owner) continue;
    const current = byOwner.get(account.owner) ?? { wallet: account.owner, tokenAccount: account.address, uiBalance: 0 };
    current.uiBalance += Number(account.amount ?? 0);
    byOwner.set(account.owner, current);
  }
  return Array.from(byOwner.values())
    .filter((holder) => holder.uiBalance > 0)
    .sort((a, b) => b.uiBalance - a.uiBalance)
    .map((holder, index) => ({ ...holder, balanceRank: index + 1, firstSeenAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), buyCount: 0, sellCount: 0, totalBought: holder.uiBalance, totalSold: 0 }));
}
