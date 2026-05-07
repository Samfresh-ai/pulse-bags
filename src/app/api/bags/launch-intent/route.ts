import { NextResponse } from "next/server";
import { buildBagsLaunchIntentUrl } from "@/lib/bags-launch-intent";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const url = buildBagsLaunchIntentUrl({
    name: typeof body.name === "string" ? body.name : undefined,
    ticker: typeof body.ticker === "string" ? body.ticker : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    website: typeof body.website === "string" ? body.website : undefined,
    twitterUsername: typeof body.twitterUsername === "string" ? body.twitterUsername : undefined,
    adminWallet: typeof body.adminWallet === "string" ? body.adminWallet : undefined,
  });

  return NextResponse.json({
    mode: "launch-intent",
    url,
    note: "No Bags API key is required for this path. Bags will prefill /launch; the creator reviews and signs in Bags.",
  });
}
