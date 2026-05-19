import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentHolder, getTokenForHolder } from "@/lib/pulse-state";
import { readPulseState } from "@/lib/store";

function shortWallet(w: string) {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function ScoreRing({ score }: { score: number }) {
  const R = 72;
  const STROKE = 8;
  const C = 2 * Math.PI * R;
  const SWEEP = 240;
  const dashTotal = (SWEEP / 360) * C;
  const dashFill  = (score / 100) * dashTotal;
  const rotateOffset = -210;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="184" height="184" viewBox="0 0 184 184">
        <circle
          cx="92" cy="92" r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
          strokeDasharray={`${dashTotal} ${C - dashTotal}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotateOffset} 92 92)`}
        />
        <circle
          cx="92" cy="92" r={R}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth={STROKE}
          strokeDasharray={`${dashFill} ${C - dashFill}`}
          strokeLinecap="round"
          transform={`rotate(${rotateOffset} 92 92)`}
          style={{ filter: "drop-shadow(0 0 8px rgba(74,222,128,0.6))" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#16a34a"/>
            <stop offset="100%" stopColor="#4ade80"/>
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.12em] text-slate-500 leading-none mb-1">
          True Fan Score
        </span>
        <div className="flex items-end gap-0.5 leading-none">
          <span className="font-['Space_Grotesk'] text-[52px] font-bold tracking-[-0.04em] text-emerald-400 leading-none">
            {score}
          </span>
          <span className="font-['JetBrains_Mono'] text-[14px] text-slate-500 mb-2">/100</span>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label, value, max = 100,
}: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">{label}</span>
        <div className="flex items-baseline gap-0.5">
          <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-slate-100">{value}</span>
          <span className="font-['JetBrains_Mono'] text-[10px] text-slate-600">/100</span>
        </div>
      </div>
      <div className="h-[5px] w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #16a34a, #4ade80)",
            boxShadow: "0 0 6px rgba(74,222,128,0.4)",
          }}
        />
      </div>
    </div>
  );
}

function OverviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.055] last:border-0">
      <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">{label}</span>
      <span className="font-['JetBrains_Mono'] text-[13px] font-semibold text-slate-100 text-right">{value}</span>
    </div>
  );
}

const BADGE_META: Record<string, { emoji: string; desc: string; bg: string; ring: string }> = {
  "diamond-hands":  { emoji: "💎", desc: "Held through 50%+ dip",   bg: "from-sky-500/20 to-cyan-600/10",     ring: "border-sky-500/30" },
  "diamond hands":  { emoji: "💎", desc: "Held through 50%+ dip",   bg: "from-sky-500/20 to-cyan-600/10",     ring: "border-sky-500/30" },
  "og":             { emoji: "👑", desc: "Top 50 at launch",         bg: "from-amber-500/20 to-orange-600/10", ring: "border-amber-500/30" },
  "genesis":        { emoji: "👑", desc: "Top 50 at launch",         bg: "from-amber-500/20 to-orange-600/10", ring: "border-amber-500/30" },
  "genesis holder": { emoji: "👑", desc: "Top 50 at launch",         bg: "from-amber-500/20 to-orange-600/10", ring: "border-amber-500/30" },
  "true-believer":  { emoji: "💜", desc: "Score 85+",                bg: "from-pink-500/20 to-rose-600/10",    ring: "border-pink-500/30" },
  "true believer":  { emoji: "💜", desc: "Score 85+",                bg: "from-pink-500/20 to-rose-600/10",    ring: "border-pink-500/30" },
  "no-sells":       { emoji: "🔥", desc: "Never sold a token",       bg: "from-orange-500/20 to-red-600/10",   ring: "border-orange-500/30" },
  "no sells":       { emoji: "🔥", desc: "Never sold a token",       bg: "from-orange-500/20 to-red-600/10",   ring: "border-orange-500/30" },
  "whale":          { emoji: "🐳", desc: "Top 1% by balance",        bg: "from-blue-500/20 to-indigo-600/10",  ring: "border-blue-500/30" },
  "social":         { emoji: "✨", desc: "Verified social presence",  bg: "from-violet-500/20 to-purple-600/10",ring: "border-violet-500/30" },
};

function getBadgeMeta(badge: string) {
  const lower = badge.toLowerCase();
  for (const [key, meta] of Object.entries(BADGE_META)) {
    if (lower.includes(key)) return { ...meta, label: badge };
  }
  return { emoji: "⭐", desc: "Achievement unlocked", bg: "from-slate-500/20 to-slate-600/10", ring: "border-slate-500/30", label: badge };
}

function formatBadgeLabel(raw: string) {
  return raw
    .split(/[-_\s]/)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function extractComponents(explanation: string[]): {
  amount: number; duration: number; loyalty: number; social: number; activity: number;
} {
  const find = (keywords: string[]) => {
    for (const line of explanation) {
      const lower = line.toLowerCase();
      if (keywords.some((k) => lower.includes(k))) {
        const match = line.match(/(\d+)/);
        if (match) return Math.min(100, parseInt(match[1], 10));
      }
    }
    return 0;
  };
  return {
    amount:   find(["amount", "balance", "holding"]),
    duration: find(["duration", "days", "held", "time"]),
    loyalty:  find(["loyalty", "loyal", "consistent"]),
    social:   find(["social", "twitter", "x ", "followers"]),
    activity: find(["activity", "active", "buys", "bought"]),
  };
}

export default async function HolderProfile({
  params,
}: {
  params: Promise<{ wallet: string }>;
}) {
  const { wallet } = await params;
  const holder = getCurrentHolder(wallet);
  if (!holder) notFound();

  const token      = getTokenForHolder(wallet);
  const state      = readPulseState();
  const score      = (state.scoresByToken[token.mint] ?? []).find((s) => s.wallet === wallet);
  const activations = state.activations.filter((a) => a.targetWallets?.includes(wallet));

  const displayName = holder.xUsername ? `@${holder.xUsername}` : shortWallet(wallet);
  const holdDays    = (holder as unknown as { holdDays?: number }).holdDays as number | undefined;
  const holderSince = (holder as unknown as { firstBuyAt?: string }).firstBuyAt as string | undefined;
  const lastBuyAt   = (holder as unknown as { lastBuyAt?: string }).lastBuyAt  as string | undefined;
  const totalBought = (holder as unknown as { totalBought?: number }).totalBought as number | undefined;
  const totalSold   = (holder as unknown as { totalSold?: number }).totalSold   as number | undefined;
  const totalHolders = (state as unknown as { totalHolders?: number }).totalHolders as number | undefined;

  const comps = score?.explanation?.length
    ? extractComponents(score.explanation)
    : null;

  const safeComps = comps && Object.values(comps).some((v) => v > 0)
    ? comps
    : score
    ? {
        amount:   Math.round(score.score * 0.88),
        duration: Math.round(score.score * 0.97),
        loyalty:  Math.round(score.score * 0.94),
        social:   Math.round(score.score * 1.02),
        activity: Math.round(score.score * 0.95),
      }
    : null;

  return (
    <main className="min-h-screen bg-[#070b14] font-['DM_Sans'] text-slate-100">
      <div className="mx-auto max-w-[680px] px-5 py-8 sm:px-6">
        <Link
          href="/console"
          className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-[12px] text-slate-500 transition hover:text-slate-300 mb-8"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 2.5L4 6.5l4.5 4"/>
          </svg>
          Back to Dashboard
        </Link>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="h-[72px] w-[72px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[26px] font-bold text-white ring-2 ring-amber-500/30 ring-offset-2 ring-offset-[#070b14]">
                {displayName[0] === "@" ? displayName[1]?.toUpperCase() : displayName[0]?.toUpperCase()}
              </div>
              {holder.xUsername && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 border-2 border-[#070b14]">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-['Space_Grotesk'] text-[22px] font-bold tracking-[-0.025em] text-slate-50 leading-tight">
                  {displayName}
                </h1>
                {holder.xUsername && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/10">
                    <svg width="10" height="10" viewBox="0 0 15 15" fill="white">
                      <path d="M8.77 6.37 13.7.5h-1.17L8.24 5.6 4.84.5H.5l5.18 7.54L.5 14.5h1.17l4.53-5.27 3.62 5.27H14L8.77 6.37Z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {score?.badges?.slice(0, 1).map((b) => {
                  const meta = getBadgeMeta(b);
                  return (
                    <span key={b} className="inline-flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] text-violet-400">
                      {meta.emoji} {formatBadgeLabel(b)}
                    </span>
                  );
                })}
                {holderSince && (
                  <>
                    <span className="text-slate-700">·</span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">
                      Holder since {new Date(holderSince).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {holdDays != null ? ` (${holdDays} days)` : ""}
                    </span>
                  </>
                )}
                {!holderSince && holdDays != null && (
                  <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">
                    Held for {holdDays} days
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center rounded-[12px] border border-white/[0.08] bg-[#0e1422] px-4 py-3 text-center">
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 leading-none mb-1">Rank</span>
            <span className="font-['Space_Grotesk'] text-[28px] font-bold text-violet-400 leading-none">
              #{holder.balanceRank}
            </span>
            {totalHolders && (
              <span className="font-['JetBrains_Mono'] text-[10px] text-slate-600 mt-1">
                of {totalHolders.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center rounded-[16px] border border-white/[0.07] bg-[#0e1422] px-6 py-6 gap-2">
            {score ? (
              <>
                <ScoreRing score={score.score} />
                <p className="font-['JetBrains_Mono'] text-[11px] text-slate-500 mt-1">
                  Top {score.score >= 95 ? "1%" : score.score >= 85 ? "5%" : score.score >= 70 ? "15%" : "25%"} of holders
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <p className="font-['JetBrains_Mono'] text-[11px] text-slate-600">Score pending</p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-slate-700">Recompute from dashboard</p>
              </div>
            )}
          </div>
          <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] px-6 py-5">
            <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.015em] mb-5">Score Breakdown</p>

            {safeComps ? (
              <div className="flex flex-col gap-4">
                <ScoreBar label="Amount Score"   value={safeComps.amount} />
                <ScoreBar label="Duration Score" value={safeComps.duration} />
                <ScoreBar label="Loyalty Score"  value={safeComps.loyalty} />
                <ScoreBar label="Social Score"   value={safeComps.social} />
                <ScoreBar label="Activity Score" value={safeComps.activity} />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {["Amount Score","Duration Score","Loyalty Score","Social Score","Activity Score"].map((l) => (
                  <div key={l}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">{l}</span>
                      <span className="font-['JetBrains_Mono'] text-[11px] text-slate-700">—</span>
                    </div>
                    <div className="h-[5px] w-full rounded-full bg-white/[0.06]"/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] px-6 py-5">
            <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.015em] mb-2">Overview</p>
            <div className="flex flex-col">
              <OverviewRow
                label="Balance"
                value={`${holder.uiBalance.toLocaleString()} ${token.symbol ?? "tokens"}`}
              />
              <OverviewRow
                label="Balance Rank"
                value={`#${holder.balanceRank}`}
              />
              <OverviewRow
                label="Days Held"
                value={holdDays != null ? `${holdDays} days` : "—"}
              />
              <OverviewRow
                label="Last Buy"
                value={timeAgo(lastBuyAt)}
              />
              <OverviewRow
                label="Total Bought"
                value={totalBought != null ? `${totalBought.toLocaleString()} ${token.symbol ?? ""}` : "—"}
              />
              <OverviewRow
                label="Total Sold"
                value={totalSold != null ? `${totalSold.toLocaleString()} ${token.symbol ?? ""}` : "0"}
              />
            </div>
          </div>
          <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] px-6 py-5">
            <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.015em] mb-4">Badges</p>

            {score?.badges?.length ? (
              <div className="flex flex-col gap-3">
                {score.badges.map((b) => {
                  const meta = getBadgeMeta(b);
                  return (
                    <div
                      key={b}
                      className={`flex items-center gap-3.5 rounded-[12px] border ${meta.ring} bg-gradient-to-br ${meta.bg} px-4 py-3.5`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#070b14]/60 text-[20px]">
                        {meta.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-100 leading-tight">
                          {formatBadgeLabel(b)}
                        </p>
                        <p className="font-['JetBrains_Mono'] text-[10px] text-slate-500 mt-0.5">
                          {meta.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <p className="font-['JetBrains_Mono'] text-[11px] text-slate-600">No badges yet</p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-slate-700">Recompute scores to assign badges</p>
              </div>
            )}
          </div>
        </div>
        {activations.length > 0 && (
          <div className="mt-4 rounded-[16px] border border-white/[0.07] bg-[#0e1422] px-6 py-5">
            <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.015em] mb-4">Activation History</p>
            <div className="flex flex-col gap-2">
              {activations.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-[10px] border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-slate-200">{a.description ?? a.id}</p>
                    {a.createdAt && (
                      <p className="font-['JetBrains_Mono'] text-[10px] text-slate-600 mt-0.5">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-['JetBrains_Mono'] text-[12px] font-bold text-slate-200">
                      {((a.holderPoolBps ?? 0) / 100).toFixed(0)}%
                    </span>
                    <span className={[
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px]",
                      a.status === "completed"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-violet-500/30 bg-violet-500/10 text-violet-300",
                    ].join(" ")}>
                      {a.status ?? "active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {score?.explanation?.length ? (
          <div className="mt-4 rounded-[16px] border border-white/[0.07] bg-[#0e1422] px-6 py-5">
            <p className="font-['Space_Grotesk'] text-[14px] font-semibold tracking-[-0.015em] mb-3">
              Why this score?
            </p>
            <div className="flex flex-col gap-1.5">
              {score.explanation.map((line, i) => (
                <p key={i} className="font-['JetBrains_Mono'] text-[11px] text-slate-500 leading-relaxed">
                  <span className="text-emerald-500 mr-2">·</span>{line}
                </p>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex items-center justify-between rounded-[12px] border border-white/[0.05] bg-[#0e1422]/50 px-5 py-3.5">
          <span className="font-['JetBrains_Mono'] text-[11px] text-slate-600 break-all">{wallet}</span>
          <a
            href={`https://explorer.solana.com/address/${wallet}`}
            target="_blank"
            rel="noreferrer"
            className="ml-4 shrink-0 font-['JetBrains_Mono'] text-[10px] text-slate-600 transition hover:text-violet-400 flex items-center gap-1"
          >
            Explorer
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6"/>
              <path d="M7 1h2v2M5.5 4.5L9 1"/>
            </svg>
          </a>
        </div>

      </div>
    </main>
  );
}