type FeeSharePlatform = "twitter" | "tiktok" | "github" | "moltbook" | "solana" | "kick";

export type BagsLaunchIntentInput = {
  name?: string;
  ticker?: string;
  description?: string;
  website?: string;
  twitterUsername?: string;
  adminWallet?: string;
  feeShare?: Array<{ allocationBps: number; platform: FeeSharePlatform; username: string }>;
};

const DEFAULT_DESCRIPTION =
  "Pulse is a Bags-native creator fan CRM: connect a Bags token, reveal which holders are real social followers, score true believers, and reward them through fee-share.";

function cleanTwitterUsername(username?: string) {
  return username?.replace(/^@/, "").trim();
}

function isLikelySolanaPubkey(value?: string) {
  return Boolean(value && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value));
}

export function buildBagsLaunchIntentUrl(input: BagsLaunchIntentInput = {}, origin = "https://bags.fm") {
  const url = new URL("/launch", origin);
  const params = url.searchParams;
  const twitterUsername = cleanTwitterUsername(input.twitterUsername) || "Samfresh_";
  const feeShare = input.feeShare?.length
    ? input.feeShare
    : [{ allocationBps: 1000, platform: "twitter" as const, username: twitterUsername }];

  params.set("intent", "true");
  params.set("name", input.name || "Pulse Genesis");
  params.set("ticker", input.ticker || "PULSE");
  params.set("description", input.description || DEFAULT_DESCRIPTION);
  params.set("twitter", `https://x.com/${twitterUsername}`);
  params.set("showSocial", "true");
  params.set("feeMode", "DEFAULT");
  params.set("feeShareEnabled", "true");
  params.set("feeShareType", "multi");
  params.set("feeShare", JSON.stringify(feeShare));

  if (input.website) params.set("website", input.website);
  if (isLikelySolanaPubkey(input.adminWallet)) params.set("admin", input.adminWallet!);

  return url.toString();
}
