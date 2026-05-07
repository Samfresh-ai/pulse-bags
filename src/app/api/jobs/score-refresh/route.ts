import { NextResponse } from "next/server";
import { readPulseState, recomputeTokenScores } from "@/lib/store";

export async function POST() {
  const state = readPulseState();
  const refreshed = state.tokens.map((token) => ({ tokenMint: token.mint, scores: recomputeTokenScores(token.mint).length }));
  return NextResponse.json({ refreshed });
}
