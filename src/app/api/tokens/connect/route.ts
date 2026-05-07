import { NextResponse } from "next/server";
import { getTokenCreators } from "@/lib/bags";
import { isFallbackDemoMint } from "@/lib/demo-data";
import { getDemoToken } from "@/lib/pulse-state";
import { upsertToken } from "@/lib/store";
import type { TokenProfile } from "@/lib/types";
import { cleanWallet, uniqueWallets, walletsEqual } from "@/lib/wallets";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mint = typeof body.mint === "string" && body.mint.trim() ? body.mint.trim() : getDemoToken().mint;
  const wallet = cleanWallet(typeof body.wallet === "string" ? body.wallet : undefined);

  function demoResponse(warning?: string) {
    const base = getDemoToken();
    const adminWallet = base.adminWallet ?? base.creatorWallet;
    const isSeedMint = mint === base.mint;
    const token = upsertToken({
      ...base,
      id: isSeedMint ? base.id : `token_${mint}`,
      mint,
      creatorWallet: isSeedMint ? base.creatorWallet : wallet ?? base.creatorWallet,
      adminWallet: isSeedMint ? adminWallet : wallet ?? adminWallet,
      creatorWallets: isSeedMint ? base.creatorWallets : uniqueWallets([wallet, base.creatorWallet]),
      adminWallets: isSeedMint ? base.adminWallets : uniqueWallets([wallet, adminWallet]),
      access: wallet && walletsEqual(wallet, adminWallet) ? "demo-admin" : "view-only-demo",
      verifiedAt: undefined,
    });
    return NextResponse.json({
      mode: "demo",
      warning,
      token,
      access: token.access,
      authority: {
        connectedWallet: wallet,
        creatorWallets: token.creatorWallets ?? [token.creatorWallet],
        adminWallets: token.adminWallets ?? [token.adminWallet ?? token.creatorWallet],
        canActivate: token.access === "demo-admin",
      },
      creators: [{ wallet: token.creatorWallet, provider: token.creatorProvider, username: token.creatorUsername, isCreator: true, isAdmin: true }],
    });
  }

  if (body.mode === "demo" || !process.env.BAGS_API_KEY || isFallbackDemoMint(mint)) return demoResponse();

  let creators;
  try {
    creators = await getTokenCreators(mint);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown Bags lookup error";
    return demoResponse(`Bags token creator lookup failed (${message}); using demo token state.`);
  }
  if (!creators.length) {
    return NextResponse.json({ error: "No Bags creator/admin records found for this mint.", mint }, { status: 404 });
  }

  const primary = creators.find((creator) => creator.isCreator) ?? creators[0];
  const creatorWallets = uniqueWallets(creators.filter((creator) => creator.isCreator).map((creator) => creator.wallet));
  const adminWallets = uniqueWallets(creators.filter((creator) => creator.isAdmin).map((creator) => creator.wallet));
  const fallbackCreatorWallets = creatorWallets.length ? creatorWallets : uniqueWallets([primary?.wallet]);
  const fallbackAdminWallets = adminWallets.length ? adminWallets : fallbackCreatorWallets;
  const isAdminWallet = fallbackAdminWallets.some((adminWallet) => walletsEqual(adminWallet, wallet));
  const isCreatorWallet = fallbackCreatorWallets.some((creatorWallet) => walletsEqual(creatorWallet, wallet));
  const token: TokenProfile = upsertToken({
    id: `token_${mint}`,
    mint,
    symbol: typeof body.symbol === "string" ? body.symbol : mint.slice(0, 5).toUpperCase(),
    name: typeof body.name === "string" ? body.name : "Connected Bags token",
    creatorWallet: primary?.wallet ?? wallet ?? "unknown",
    adminWallet: fallbackAdminWallets[0] ?? primary?.wallet,
    creatorWallets: fallbackCreatorWallets,
    adminWallets: fallbackAdminWallets,
    creatorUsername: primary?.providerUsername ?? primary?.twitterUsername ?? primary?.username ?? undefined,
    creatorProvider: primary?.provider ?? undefined,
    creatorAvatarUrl: primary?.pfp ?? undefined,
    access: isAdminWallet ? "admin" : isCreatorWallet ? "creator" : "view-only",
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    mode: "live",
    token,
    access: token.access,
    authority: {
      connectedWallet: wallet,
      creatorWallets: fallbackCreatorWallets,
      adminWallets: fallbackAdminWallets,
      isCreatorWallet,
      isAdminWallet,
      canActivate: isAdminWallet || isCreatorWallet,
    },
    creators,
  });
}
