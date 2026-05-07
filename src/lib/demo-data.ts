import type { Creator, Holder, SocialIdentity, TokenProfile } from "./types";
import { cleanWallet } from "./wallets";

const now = "2026-05-07T00:00:00.000Z";
export const FALLBACK_DEMO_MINT = "PULSEDEMO111111111111111111111111111111BAGS";
const configuredMint = process.env.PULSE_BAGS_TOKEN_MINT?.trim();
const configuredAdminWallet = cleanWallet(process.env.PULSE_BAGS_ADMIN_WALLET);
const configuredCreatorWallet = cleanWallet(process.env.PULSE_BAGS_CREATOR_WALLET) ?? configuredAdminWallet;
const configuredCreatorUsername = process.env.PULSE_BAGS_CREATOR_USERNAME?.replace(/^@/, "").trim();
const configuredSymbol = process.env.PULSE_BAGS_TOKEN_SYMBOL?.trim();
const configuredName = process.env.PULSE_BAGS_TOKEN_NAME?.trim();

export function isFallbackDemoMint(mint: string) {
  return mint === FALLBACK_DEMO_MINT || mint.startsWith("PULSEDEMO");
}

export const demoCreator: Creator = {
  id: "creator_demo_pulse",
  privyUserId: "demo:telegram:sam",
  wallet: configuredCreatorWallet ?? "Cr8tr9rQx4FhZ5QeV1mBagsCreatorWallet1111111",
  xUserId: "demo_x_pulsefounder",
  xUsername: configuredCreatorUsername ?? "pulsefounder",
  displayName: configuredCreatorUsername ? `@${configuredCreatorUsername}` : "Pulse founder",
  avatarUrl: undefined,
  createdAt: "2026-05-07T00:00:00.000Z",
  updatedAt: now,
};

export const demoToken: TokenProfile = {
  id: "token_demo_pulse",
  creatorId: demoCreator.id,
  mint: configuredMint ?? FALLBACK_DEMO_MINT,
  symbol: configuredSymbol ?? "PULSE",
  name: configuredName ?? "Pulse Genesis",
  creatorWallet: demoCreator.wallet!,
  adminWallet: configuredAdminWallet ?? demoCreator.wallet!,
  adminWallets: [configuredAdminWallet ?? demoCreator.wallet!],
  creatorWallets: [demoCreator.wallet!],
  creatorUsername: configuredCreatorUsername ?? "pulsefounder",
  creatorProvider: "twitter",
  access: configuredMint && configuredAdminWallet ? "view-only" : "demo-admin",
  createdAt: "2026-05-07T00:00:00.000Z",
  lastHolderSyncAt: configuredMint ? undefined : now,
  lastSocialSyncAt: configuredMint ? undefined : now,
};

export const demoHolders: Holder[] = [
  { wallet: "Hldr9aKxTrueFanAlpha111111111111111111111", uiBalance: 18230, balanceRank: 1, firstSeenAt: "2025-11-04T10:00:00.000Z", lastSeenAt: now, buyCount: 9, sellCount: 0, totalBought: 18230, totalSold: 0, xUsername: "miraearly", displayName: "Mira / early believer" },
  { wallet: "Hldr2bKxDiamondSignal22222222222222222222", uiBalance: 12490, balanceRank: 2, firstSeenAt: "2025-12-18T10:00:00.000Z", lastSeenAt: now, buyCount: 5, sellCount: 0, totalBought: 12490, totalSold: 0, xUsername: "chainlucid", displayName: "Lucid" },
  { wallet: "Hldr3cKxSocialWhale333333333333333333333", uiBalance: 10420, balanceRank: 3, firstSeenAt: "2026-01-05T10:00:00.000Z", lastSeenAt: now, buyCount: 6, sellCount: 1, totalBought: 12800, totalSold: 2380, xUsername: "bagsfanatic", displayName: "Bags Fanatic" },
  { wallet: "Hldr4dKxQuietHolder4444444444444444444444", uiBalance: 7340, balanceRank: 4, firstSeenAt: "2026-02-10T10:00:00.000Z", lastSeenAt: now, buyCount: 3, sellCount: 0, totalBought: 7340, totalSold: 0 },
  { wallet: "Hldr5eKxReplyGuy555555555555555555555555", uiBalance: 6310, balanceRank: 5, firstSeenAt: "2026-02-22T10:00:00.000Z", lastSeenAt: now, buyCount: 4, sellCount: 0, totalBought: 6310, totalSold: 0, xUsername: "replysavant", displayName: "Reply Savant" },
  { wallet: "Hldr6fKxFastFlip666666666666666666666666", uiBalance: 5820, balanceRank: 6, firstSeenAt: "2026-03-01T10:00:00.000Z", lastSeenAt: now, buyCount: 8, sellCount: 3, totalBought: 14800, totalSold: 8980 },
  { wallet: "Hldr7gKxSmallButReal77777777777777777777", uiBalance: 4210, balanceRank: 7, firstSeenAt: "2026-03-20T10:00:00.000Z", lastSeenAt: now, buyCount: 2, sellCount: 0, totalBought: 4210, totalSold: 0, xUsername: "smallbutreal", displayName: "smallbutreal" },
  { wallet: "Hldr8hKxUnmatched88888888888888888888888", uiBalance: 2100, balanceRank: 8, firstSeenAt: "2026-04-07T10:00:00.000Z", lastSeenAt: now, buyCount: 1, sellCount: 0, totalBought: 2100, totalSold: 0 },
];

export const demoSocialIdentities: SocialIdentity[] = demoHolders
  .filter((holder) => holder.xUsername)
  .map((holder) => ({
    wallet: holder.wallet,
    provider: "twitter",
    username: holder.xUsername!,
    displayName: holder.displayName,
    avatarUrl: holder.avatarUrl,
    source: "demo",
    lastCheckedAt: now,
  }));

export const demoFollowerHandles = [
  "miraearly",
  "chainlucid",
  "bagsfanatic",
  "replysavant",
  "smallbutreal",
  "nonholderfan",
  "lurkerbuilder",
  "solanascout",
];
