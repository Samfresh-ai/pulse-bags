import { NextResponse } from "next/server";
import { upsertCreator } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const creator = upsertCreator({
    privyUserId: typeof body.privyUserId === "string" ? body.privyUserId : undefined,
    wallet: typeof body.wallet === "string" ? body.wallet : undefined,
    xUserId: typeof body.xUserId === "string" ? body.xUserId : undefined,
    xUsername: typeof body.xUsername === "string" ? body.xUsername : undefined,
    displayName: typeof body.displayName === "string" ? body.displayName : undefined,
    avatarUrl: typeof body.avatarUrl === "string" ? body.avatarUrl : undefined,
  });
  return NextResponse.json({ creator });
}
