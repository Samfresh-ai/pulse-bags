import { NextResponse } from "next/server";
import { assertValidActivation } from "@/lib/activation";
import { getActivation } from "@/lib/pulse-state";

export async function POST(request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const body = await request.json().catch(() => ({}));
  const targetCount = Number(body.targetCount ?? 5);
  const holderPoolBps = Number(body.holderPoolBps ?? 1000);
  const activation = getActivation(targetCount, holderPoolBps, tokenId);
  assertValidActivation(activation);
  return NextResponse.json({ tokenId, activation });
}
