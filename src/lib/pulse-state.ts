import { buildActivationPreview } from "./activation";
import { demoHolders, demoToken, isFallbackDemoMint } from "./demo-data";
import { readPulseState } from "./store";

export function getDemoToken() {
  return demoToken;
}

export function getDemoHolders() {
  return demoHolders;
}

export function getCurrentToken(mint = demoToken.mint) {
  const state = readPulseState();
  const token = state.tokens.find((item) => item.mint === mint);
  if (token || isFallbackDemoMint(mint)) return token ?? demoToken;
  return { ...demoToken, mint, symbol: mint.slice(0, 5).toUpperCase(), name: "Connected Bags token", access: "view-only" as const };
}

export function getCurrentHolders(mint = demoToken.mint) {
  const state = readPulseState();
  return state.holdersByToken[mint] ?? (isFallbackDemoMint(mint) ? demoHolders : []);
}

export function getCurrentScores(mint = demoToken.mint) {
  const state = readPulseState();
  return state.scoresByToken[mint] ?? [];
}

export function getCurrentHolder(wallet: string) {
  const state = readPulseState();
  for (const holders of Object.values(state.holdersByToken)) {
    const holder = holders.find((item) => item.wallet === wallet);
    if (holder) return holder;
  }
  return undefined;
}

export function getTokenForHolder(wallet: string) {
  const state = readPulseState();
  const match = Object.entries(state.holdersByToken).find(([, holders]) => holders.some((holder) => holder.wallet === wallet));
  if (!match) return demoToken;
  return state.tokens.find((token) => token.mint === match[0]) ?? demoToken;
}

export function getActivation(targetCount = 5, holderPoolBps = 1000, mint = demoToken.mint) {
  const token = getCurrentToken(mint);
  return buildActivationPreview({
    holders: getCurrentHolders(mint),
    creatorWallet: token.adminWallet ?? token.creatorWallet,
    targetCount,
    holderPoolBps,
  });
}

export function makeDemoTransaction(mint = demoToken.mint, targetCount = 5, holderPoolBps = 1000) {
  const activation = getActivation(targetCount, holderPoolBps, mint);
  return {
    mode: "demo",
    status: "created",
    note: "Demo-safe serialized transaction placeholder. Set BAGS_API_KEY and creator admin wallet to request real Bags transactions.",
    bagsRequest: {
      baseMint: mint,
      claimersArray: activation.claimersArray,
      basisPointsArray: activation.basisPointsArray,
      payer: activation.creatorWallet,
    },
    transactions: [
      {
        type: "bags_fee_share_config",
        serialized: "DEMO_BAGS_FEE_SHARE_CONFIG_TX_BASE64",
        signers: [activation.creatorWallet],
      },
    ],
  };
}
