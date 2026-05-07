import { NextResponse } from "next/server";
import { recomputeTokenScores } from "@/lib/store";

export async function POST(_request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const scores = recomputeTokenScores(tokenId);
  return NextResponse.json({ tokenId, scores, count: scores.length });
}
