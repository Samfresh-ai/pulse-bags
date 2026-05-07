import { NextResponse } from "next/server";
import { isFallbackDemoMint } from "@/lib/demo-data";
import { aggregateHeliusTokenAccounts, getTokenAccountsByMint } from "@/lib/helius";
import { getDemoHolders } from "@/lib/pulse-state";
import { setTokenHolders } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const body = await request.json().catch(() => ({}));
  const forceDemo = body.mode === "demo" || isFallbackDemoMint(tokenId);

  if (forceDemo || !process.env.HELIUS_API_KEY) {
    const holders = setTokenHolders(tokenId, getDemoHolders());
    return NextResponse.json({ mode: "demo", tokenId, holders, scannedAccounts: holders.length });
  }

  const json = await getTokenAccountsByMint(tokenId, 1, 1000);
  const accounts = json?.result?.token_accounts ?? json?.result ?? [];
  const holders = setTokenHolders(tokenId, aggregateHeliusTokenAccounts(accounts));
  return NextResponse.json({ mode: "live", tokenId, holders, scannedAccounts: accounts.length });
}
