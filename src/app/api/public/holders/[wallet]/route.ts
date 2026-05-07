import { NextResponse } from "next/server";
import { getCurrentHolder, getTokenForHolder } from "@/lib/pulse-state";
import { readPulseState } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params;
  const holder = getCurrentHolder(wallet);
  if (!holder) return NextResponse.json({ error: "Holder not found" }, { status: 404 });
  const token = getTokenForHolder(wallet);
  const state = readPulseState();
  const score = (state.scoresByToken[token.mint] ?? []).find((item) => item.wallet === wallet);
  const activations = state.activations.filter((activation) => activation.targetWallets.includes(wallet));
  return NextResponse.json({ token, holder, score, activations });
}
