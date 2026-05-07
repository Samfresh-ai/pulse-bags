import { NextResponse } from "next/server";
import { confirmActivation } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ activationId: string }> }) {
  const { activationId } = await params;
  const body = await request.json().catch(() => ({}));
  const signatures = Array.isArray(body.signatures) ? body.signatures.map(String) : typeof body.signature === "string" ? [body.signature] : [];
  if (signatures.length === 0) return NextResponse.json({ error: "At least one signature is required" }, { status: 400 });
  const activation = confirmActivation(activationId, signatures);
  if (!activation) return NextResponse.json({ error: "Activation not found" }, { status: 404 });
  return NextResponse.json({ activation });
}
