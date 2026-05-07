import { NextResponse } from "next/server";
import { recomputeTokenScores, readPulseState, setTokenHolders } from "@/lib/store";

export async function POST(request: Request) {
  const secret = process.env.HELIUS_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-pulse-webhook-secret") !== secret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const events = Array.isArray(body) ? body : body ? [body] : [];
  const state = readPulseState();
  const touched = new Set<string>();

  for (const event of events) {
    const transfers = Array.isArray(event?.tokenTransfers) ? event.tokenTransfers : [];
    for (const transfer of transfers) {
      const mint = transfer.mint as string | undefined;
      if (!mint || !state.holdersByToken[mint]) continue;
      touched.add(mint);
      const holders = state.holdersByToken[mint].map((holder) => {
        const amount = Number(transfer.tokenAmount ?? transfer.rawTokenAmount?.tokenAmount ?? 0);
        if (transfer.toUserAccount === holder.wallet) {
          return { ...holder, uiBalance: holder.uiBalance + amount, buyCount: holder.buyCount + 1, totalBought: holder.totalBought + amount, lastBuyAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
        }
        if (transfer.fromUserAccount === holder.wallet) {
          return { ...holder, uiBalance: Math.max(0, holder.uiBalance - amount), sellCount: holder.sellCount + 1, totalSold: holder.totalSold + amount, lastSellAt: new Date().toISOString(), lastSeenAt: new Date().toISOString() };
        }
        return holder;
      });
      setTokenHolders(mint, holders);
    }
  }

  for (const mint of touched) recomputeTokenScores(mint);
  return NextResponse.json({ received: events.length, touched: Array.from(touched) });
}
