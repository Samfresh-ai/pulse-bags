import { NextResponse } from "next/server";
import { readPulseState } from "@/lib/store";

export async function GET(request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const state = readPulseState();
  const scores = state.scoresByToken[tokenId] ?? [];
  const scoreByWallet = new Map(scores.map((score) => [score.wallet, score]));
  let holders = state.holdersByToken[tokenId] ?? [];
  if (filter === "social") holders = holders.filter((holder) => holder.xUsername);
  if (filter === "top10") holders = holders.filter((holder) => holder.balanceRank <= 10);
  if (filter === "true-believers") holders = holders.filter((holder) => (scoreByWallet.get(holder.wallet)?.score ?? 0) >= 85);
  if (filter === "no-sells") holders = holders.filter((holder) => holder.sellCount === 0);
  return NextResponse.json({ tokenId, holders, scores, count: holders.length });
}
