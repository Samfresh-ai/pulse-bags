import { NextResponse } from "next/server";
import { getFeeShareWalletsBulk } from "@/lib/bags";
import { demoSocialIdentities } from "@/lib/demo-data";
import { getCurrentHolders } from "@/lib/pulse-state";
import { mergeSocialMatches, readPulseState } from "@/lib/store";
import type { SocialIdentity } from "@/lib/types";
import { getXFollowers } from "@/lib/x";

export async function POST(request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const body = await request.json().catch(() => ({}));
  const state = readPulseState();
  const token = state.tokens.find((item) => item.mint === tokenId);
  const followerResult = await getXFollowers(typeof body.xUserId === "string" ? body.xUserId : undefined, Number(body.maxFollowers ?? 100));
  const holders = getCurrentHolders(tokenId);
  const holderWallets = new Set(holders.map((holder) => holder.wallet));

  if (!process.env.BAGS_API_KEY) {
    const identities = demoSocialIdentities.filter((identity) => holderWallets.has(identity.wallet));
    const result = mergeSocialMatches(tokenId, identities);
    return NextResponse.json({ mode: "demo", xMode: followerResult.mode, warning: followerResult.warning, tokenId, token, scannedFollowers: followerResult.handles.length, matched: result.identities.length, identities: result.identities });
  }

  const lookups = followerResult.handles.slice(0, 100).map((username) => ({ provider: "twitter", username }));
  let response: Array<{ wallet?: string; provider?: string; username?: string; platformData?: { username?: string; display_name?: string; avatar_url?: string } }>;
  try {
    response = (await getFeeShareWalletsBulk(lookups)) as Array<{ wallet?: string; provider?: string; username?: string; platformData?: { username?: string; display_name?: string; avatar_url?: string } }>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown Bags social lookup error";
    const identities = demoSocialIdentities.filter((identity) => holderWallets.has(identity.wallet));
    const result = mergeSocialMatches(tokenId, identities);
    return NextResponse.json({ mode: "demo-fallback", xMode: followerResult.mode, warning: `Bags social wallet lookup failed (${message}); using demo-safe identities.`, tokenId, token, scannedFollowers: followerResult.handles.length, matched: result.identities.length, identities: result.identities });
  }
  const identities: SocialIdentity[] = response
    .filter((item) => item.wallet && holderWallets.has(item.wallet))
    .map((item) => ({
      wallet: item.wallet!,
      provider: item.provider ?? "twitter",
      username: item.platformData?.username ?? item.username ?? "unknown",
      displayName: item.platformData?.display_name,
      avatarUrl: item.platformData?.avatar_url,
      source: "bags",
      lastCheckedAt: new Date().toISOString(),
    }));
  const result = mergeSocialMatches(tokenId, identities);
  return NextResponse.json({ mode: "live", xMode: followerResult.mode, warning: followerResult.warning, tokenId, token, scannedFollowers: followerResult.handles.length, matched: result.identities.length, identities: result.identities });
}
