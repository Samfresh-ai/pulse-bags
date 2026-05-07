import type { ActivationPreview, Holder } from "./types";
import { walletsEqual } from "./wallets";

export function buildActivationPreview(input: {
  holders: Holder[];
  creatorWallet: string;
  targetCount?: number;
  holderPoolBps?: number;
}): ActivationPreview {
  const targetCount = Math.max(1, Math.min(50, Math.floor(input.targetCount ?? 5)));
  const holderPoolBps = Math.max(100, Math.min(5000, Math.floor(input.holderPoolBps ?? 1000)));
  const seenTargets = new Set<string>();
  const targets = input.holders
    .slice()
    .sort((a, b) => a.balanceRank - b.balanceRank)
    .filter((holder) => {
      if (walletsEqual(holder.wallet, input.creatorWallet) || seenTargets.has(holder.wallet)) return false;
      seenTargets.add(holder.wallet);
      return true;
    })
    .slice(0, targetCount);

  const holderBpsEach = targets.length > 0 ? Math.floor(holderPoolBps / targets.length) : 0;
  const allocatedToHolders = holderBpsEach * targets.length;
  const creatorBps = 10_000 - allocatedToHolders;

  return {
    targetCount: targets.length,
    creatorWallet: input.creatorWallet,
    targetWallets: targets.map((holder) => holder.wallet),
    claimersArray: [input.creatorWallet, ...targets.map((holder) => holder.wallet)],
    basisPointsArray: [creatorBps, ...targets.map(() => holderBpsEach)],
    creatorBps,
    holderPoolBps: allocatedToHolders,
    holderBpsEach,
    warning:
      targets.length > 7
        ? "Bags requires additional lookup tables for more than 7 fee claimers. Use top 5 for the live signed demo."
        : undefined,
  };
}

export function assertValidActivation(preview: ActivationPreview) {
  if (preview.claimersArray.length !== preview.basisPointsArray.length) {
    throw new Error("Claimers and basis point arrays must align");
  }
  const total = preview.basisPointsArray.reduce((sum, bps) => sum + bps, 0);
  if (total !== 10_000) throw new Error(`Basis points must total 10000; received ${total}`);
  if (new Set(preview.claimersArray).size !== preview.claimersArray.length) {
    throw new Error("Claimers must be unique");
  }
}
