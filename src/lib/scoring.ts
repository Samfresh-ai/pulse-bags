import type { Badge, Holder, TrueFanScore } from "./types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(startIso: string, endIso = new Date().toISOString()) {
  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.floor((end - start) / MS_PER_DAY));
}

export function computeTrueFanScore(input: {
  amountScore: number;
  durationScore: number;
  loyaltyScore: number;
  socialScore: number;
  activityScore: number;
}) {
  return Math.round(
    input.amountScore * 0.35 +
      input.durationScore * 0.25 +
      input.loyaltyScore * 0.2 +
      input.socialScore * 0.1 +
      input.activityScore * 0.1,
  );
}

export function scoreHolder(holder: Holder, totalHolders: number, nowIso = new Date().toISOString()): TrueFanScore {
  const percentile = totalHolders <= 1 ? 0 : ((holder.balanceRank - 1) / (totalHolders - 1)) * 100;
  const amountScore = clamp(100 - percentile);
  const daysHeld = daysBetween(holder.firstSeenAt, nowIso);
  const durationScore = clamp((daysHeld / 180) * 100);
  const sellPenalty = Math.min(60, holder.sellCount * 15);
  const roundTripPenalty = holder.totalBought > 0 && holder.totalSold > holder.totalBought * 0.75 ? 25 : 0;
  const loyaltyScore = clamp(100 - sellPenalty - roundTripPenalty);
  const socialScore = holder.xUsername ? 100 : 0;

  const badges: Badge[] = [];
  if (holder.balanceRank <= 50) badges.push("Genesis Holder");
  if (holder.sellCount === 0) badges.push("Diamond Hands");

  const activityScore = clamp(
    (badges.includes("Genesis Holder") ? 40 : 0) +
      (badges.includes("Diamond Hands") ? 40 : 0) +
      (holder.xUsername ? 20 : 0),
  );

  const score = computeTrueFanScore({ amountScore, durationScore, loyaltyScore, socialScore, activityScore });
  if (score >= 85) badges.push("True Believer");

  return {
    wallet: holder.wallet,
    score,
    amountScore: Math.round(amountScore),
    durationScore: Math.round(durationScore),
    loyaltyScore: Math.round(loyaltyScore),
    socialScore,
    activityScore: Math.round(activityScore),
    badges,
    updatedAt: nowIso,
    explanation: [
      `#${holder.balanceRank} by balance`,
      `${daysHeld} days observed holding`,
      holder.sellCount === 0 ? "No sell events observed" : `${holder.sellCount} sell event(s) observed`,
      holder.xUsername ? `Matched to @${holder.xUsername}` : "No social match yet",
    ],
  };
}

export function scoreHolders(holders: Holder[], nowIso = new Date().toISOString()) {
  return holders.map((holder) => scoreHolder(holder, holders.length, nowIso));
}
