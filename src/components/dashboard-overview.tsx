"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { ActivationPreview, Holder, TokenProfile, TrueFanScore } from "@/lib/types";
import Image from "next/image";

type Props = {
  initialToken: TokenProfile;
  initialHolders: Holder[];
  initialScores: TrueFanScore[];
  initialActivation: ActivationPreview;
};
type ActionState = "idle" | "loading" | "done" | "error";
type Range = "7D" | "30D" | "All Time";

function shortWallet(w: string) {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? JSON.stringify(json));
  return json as T;
}

const IconHolders = () => (
  <Image src="/Icons/icon-holders.svg" alt="Icon Holders" width={16} height={16} />
);
const IconTrendUp = () => (
  <Image src="/Icons/icon-trendup.svg" alt="Icon Trendup" width={16} height={16} />
);
const IconSync = () => (
  <Image src="/Icons/icon-sync.svg" alt="Icon Sync" width={16} height={16} />
);
const IconStar = () => (
  <Image src="/Icons/icon-star.svg" alt="Icon Star" width={16} height={16} />
);
const IconReward = () => (
  <Image src="/Icons/icon-reward.svg" alt="Icon Reward" width={16} height={16} />
);
const IconClose = () => (
  <Image src="/Icons/icon-close.svg" alt="Icon Close" width={16} height={16} />
);
const IconChevronDown = () => (
  <Image src="/Icons/icon-chevron-down.svg" alt="Icon Chevron Down" width={16} height={16} />
);

function WavySparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  const W = 400, H = 100, PAD = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;

  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((v - min) / rng) * (H - PAD * 2),
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }

  const fill = d + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#wg)"/>
      <path d={d} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="4" fill="#8b5cf6"/>
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="7" fill="#8b5cf6" fillOpacity="0.2"/>
    </svg>
  );
}

function StatCard({ label, value, delta, sub }: {
  label: string; value: string | number; delta?: string; sub?: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-[#0e1422] p-5">
      <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.12em] text-slate-500 mb-3 leading-none">{label}</p>
      <p className="font-['Space_Grotesk'] text-[30px] font-bold tracking-[-0.03em] text-slate-50 leading-none">{value}</p>
      {delta && (
        <div className="mt-2.5 inline-flex items-center gap-1 text-[#00D62B]">
          <IconTrendUp />
          <span className="font-['JetBrains_Mono'] text-[10px] font-semibold">{delta}</span>
        </div>
      )}
      {sub && !delta && (
        <p className="mt-2.5 font-['JetBrains_Mono'] text-[10px] text-slate-600 flex items-center gap-1">
          <span className="text-emerald-500">⬡</span> {sub}
        </p>
      )}
    </div>
  );
}

function QuickBtn({ icon, label, onClick, busy }: {
  icon: React.ReactNode; label: string; onClick: () => void; busy?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#0e1422] px-4 py-2.5 text-[12px] font-medium text-slate-400 transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.07] hover:text-violet-200 disabled:opacity-40"
    >
      {busy
        ? <div className="h-3 w-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin"/>
        : icon}
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "completed") return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/[0.12] px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px] font-semibold text-emerald-400">
      Completed
    </span>
  );
  if (s === "active") return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-violet-300">
      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"/>Active
    </span>
  );
  return (
    <span className="inline-flex items-center rounded-full border border-slate-700/50 bg-slate-700/20 px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-500">
      {status}
    </span>
  );
}

function Avatar({ name, size = "md", gradient }: {
  name: string; size?: "sm" | "md" | "lg";
  gradient?: string;
}) {
  const sz = size === "lg" ? "h-11 w-11 text-[14px]" : size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-[11px]";
  const bg = gradient ?? "from-violet-500 to-indigo-600";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${bg} flex items-center justify-center font-bold text-white shrink-0`}>
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export default function DashboardOverview({
  initialToken, initialHolders, initialScores, initialActivation,
}: Props) {
  const [token]                     = useState(initialToken);
  const [holders, setHolders]       = useState(initialHolders);
  const [scores, setScores]         = useState(initialScores);
  const [activation, setActivation] = useState(initialActivation);
  const [state, setState]           = useState<ActionState>("idle");
  const [log, setLog]               = useState<string[]>(["Dashboard loaded."]);
  const [range, setRange]           = useState<Range>("7D");
  const [filter, setFilter]         = useState("all");

  usePrivy();

  const scoreByWallet = useMemo(
    () => new Map(scores.map((s) => [s.wallet, s])),
    [scores]
  );

  const matchedCount = holders.filter((h) => h.xUsername).length;
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0;

  const sortedScores = useMemo(() => [...scores].sort((a, b) => b.score - a.score), [scores]);
  const topScoreEntry = sortedScores[0];
  const topHolderRow  = topScoreEntry
    ? holders.find((h) => h.wallet === topScoreEntry.wallet)
    : null;

  const topThree = sortedScores.slice(0, 3).map((s) => ({
    score: s,
    holder: holders.find((h) => h.wallet === s.wallet),
    badges: s.badges ?? [],
  }));

  const filteredHolders = holders.filter((h) => {
    const s = scoreByWallet.get(h.wallet);
    if (filter === "social")         return Boolean(h.xUsername);
    if (filter === "top10")          return h.balanceRank <= 10;
    if (filter === "true-believers") return (s?.score ?? 0) >= 85;
    if (filter === "no-sells")       return h.sellCount === 0;
    return true;
  });

  const sparkPoints = [0.38, 0.46, 0.52, 0.61, 0.71, 0.82, 0.90, 0.95, 1.0]
    .map((f) => Math.max(1, Math.round(holders.length * f)));

  const recentActivations = activation
    ? [
        {
          name: activation.description ?? "Activation",
          date: activation.createdAt
            ? new Date(activation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—",
          status: "Active",
          pct: `${((activation.holderPoolBps ?? 0) / 100).toFixed(0)}%`,
        },
      ]
    : [];

  function pushLog(msg: string) {
    setLog((c) => [`${new Date().toLocaleTimeString()} ${msg}`, ...c].slice(0, 8));
  }
  async function runAction<T>(msg: string, fn: () => Promise<T>) {
    setState("loading");
    try {
      const r = await fn();
      pushLog(msg);
      setState("done");
      return r;
    } catch (e) {
      pushLog(e instanceof Error ? `ERROR: ${e.message}` : "ERROR");
      setState("error");
      return null;
    }
  }

  async function syncHolders() {
    const r = await runAction("Holders synced.", () =>
      postJson<{ holders: Holder[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/sync-holders`, {}));
    if (r) setHolders(r.holders);
  }
  async function syncSocial() {
    await runAction("Social matched.", () =>
      postJson(`/api/tokens/${encodeURIComponent(token.mint)}/sync-social`, { maxFollowers: 100 }));
    const hr = await fetch(`/api/tokens/${encodeURIComponent(token.mint)}/holders`).then((x) => x.json());
    setHolders(hr.holders); setScores(hr.scores);
  }
  async function recomputeScores() {
    const r = await runAction("Scores recomputed.", () =>
      postJson<{ scores: TrueFanScore[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/recompute-scores`, {}));
    if (r) setScores(r.scores);
  }
  async function previewReward() {
    const r = await runAction("Reward preview built.", () =>
      postJson<{ activation: ActivationPreview }>(`/api/tokens/${encodeURIComponent(token.mint)}/activation/preview`, { targetCount: 5, holderPoolBps: 1000 }));
    if (r) setActivation(r.activation);
  }

  const xLabels = ["May 9", "May 15", "May 22", "May 29", "Jun 5"];

  return (
    <div className="flex-1 flex flex-col overflow-auto">
        <div className="sticky top-0 z-20 flex h-[64px] items-center justify-center border-b border-white/[0.055] bg-[#070b14]/90 px-7 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <QuickBtn icon={<IconSync />}   label="Sync holders"     onClick={syncHolders}     busy={state === "loading"} />
            <QuickBtn icon={<IconHolders />} label="Match social"    onClick={syncSocial}      busy={state === "loading"} />
            <QuickBtn icon={<IconStar />}   label="Recompute scores" onClick={recomputeScores} busy={state === "loading"} />
            <QuickBtn icon={<IconReward />} label="Preview reward"   onClick={previewReward}   busy={state === "loading"} />

            <div className="flex items-center rounded-[9px] border border-white/[0.07] bg-white/[0.025] p-0.5 ml-2">
              {(["7D", "30D", "All Time"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={[
                    "rounded-[7px] px-3 py-1.5 font-['JetBrains_Mono'] text-[10px] tracking-[0.04em] uppercase transition-all duration-150",
                    range === r
                      ? "bg-violet-600/30 border border-violet-500/25 text-violet-200"
                      : "text-slate-600 hover:text-slate-400",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className={[
              "flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5",
              state === "loading" ? "border-amber-500/25 bg-amber-500/[0.07] text-amber-400"
              : state === "error" ? "border-red-500/25 bg-red-500/[0.07] text-red-400"
              : state === "done"  ? "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400"
                                  : "border-white/[0.06] bg-white/[0.02] text-slate-700",
            ].join(" ")}>
              {state === "loading" && <div className="h-2 w-2 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"/>}
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.04em]">{state}</span>
            </div>
          </div>
        </div>

        <div className="p-7 space-y-5">
            <div>
            <h1 className="font-['Space_Grotesk'] text-[22px] font-bold tracking-[-0.025em] leading-none">Overview</h1>
            <p className="mt-1 text-[12px] text-slate-600">Your community at a glance</p>
          </div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              label="Total Holders"
              value={holders.length.toLocaleString()}
              delta={holders.length > 0 ? `+${Math.round(holders.length * 0.125).toLocaleString()}` : undefined}
            />
            <StatCard
              label="Social Matched"
              value={matchedCount.toLocaleString()}
              delta={matchedCount > 0 ? `+${Math.round(matchedCount * 0.082).toLocaleString()}` : undefined}
            />
            <StatCard
              label="True Fan Score (Avg)"
              value={avgScore || "—"}
              delta={scores.length ? "+5.1" : undefined}
            />
            <StatCard
              label="Active Bonus Pool"
              value={`${((activation?.holderPoolBps ?? 0) / 100).toFixed(0)}%`}
              sub="Fee-Share"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.01em]">Top True Fan</p>
                <button className="text-slate-700 hover:text-slate-400 transition p-1">
                  <IconClose />
                </button>
              </div>

              {topHolderRow || topScoreEntry ? (
                <div>
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="relative">
                      <Avatar
                        name={topHolderRow?.xUsername ?? shortWallet(topScoreEntry?.wallet ?? "?")}
                        size="lg"
                        gradient="from-amber-400 to-orange-500"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 border-2 border-[#0e1422]">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-['Space_Grotesk'] text-[16px] font-bold truncate">
                          @{topHolderRow?.xUsername ?? shortWallet(topScoreEntry?.wallet ?? "")}
                        </p>
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] border border-white/10">
                          <svg width="9" height="9" viewBox="0 0 15 15" fill="white">
                            <path d="M8.77 6.37 13.7.5h-1.17L8.24 5.6 4.84.5H.5l5.18 7.54L.5 14.5h1.17l4.53-5.27 3.62 5.27H14L8.77 6.37Z"/>
                          </svg>
                        </span>
                      </div>
                      <p className="font-['JetBrains_Mono'] text-[11px] text-slate-500 mt-0.5">
                        Rank #1 · Score {topScoreEntry?.score ?? "—"}
                      </p>
                    </div>
                    <svg className="text-amber-400 shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="currentColor" fillOpacity="0.85">
                      <path d="M9 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L3.2 6.2l4-.6L9 2z"/>
                    </svg>
                  </div>
                  <p className="font-['JetBrains_Mono'] text-[12px] text-slate-500 mb-4">
                    Held for{" "}
                    <span className="text-slate-300 font-semibold">
                      {(topHolderRow as Holder & { holdDays?: number })?.holdDays ?? "—"} days
                    </span>
                  </p>
                  {topScoreEntry?.badges?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {topScoreEntry.badges.slice(0, 3).map((b) => (
                        <span
                          key={b}
                          className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.09] px-3 py-1 font-['JetBrains_Mono'] text-[10px] text-violet-300"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400"/>
                          {b}
                        </span>
                      ))}
                      <button className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] text-slate-600 hover:text-slate-400">
                        <IconChevronDown />
                      </button>
                    </div>
                  ) : (
                    <p className="font-['JetBrains_Mono'] text-[10px] text-slate-700">No badges yet — recompute scores</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <div className="h-12 w-12 rounded-full border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-slate-700">
                    <IconHolders />
                  </div>
                  <p className="font-['JetBrains_Mono'] text-[11px] text-slate-600">No scored holders yet</p>
                  <p className="font-['JetBrains_Mono'] text-[10px] text-slate-700">Sync holders → match social → recompute</p>
                </div>
              )}
            </div>
            <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] p-6">
              <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.01em] mb-1">Holder Growth</p>
              <div className="flex items-baseline gap-2.5 mb-5">
                <span className="font-['Space_Grotesk'] text-[28px] font-bold tracking-[-0.03em] text-slate-50 leading-none">
                  {holders.length.toLocaleString()}
                </span>
                {holders.length > 0 && (
                  <span className="flex items-center gap-1 font-['JetBrains_Mono'] text-[11px] font-semibold text-[#00D62B]">
                    <IconTrendUp />+12.5%
                  </span>
                )}
              </div>
              <div className="relative h-[110px] w-full">
                {holders.length > 0 ? (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                      {["15K", "10K", "5K"].map((l) => (
                        <span key={l} className="font-['JetBrains_Mono'] text-[9px] text-slate-700 leading-none">{l}</span>
                      ))}
                    </div>
                    <div className="absolute left-6 right-0 top-0 bottom-0">
                      {[0, 50, 100].map((pct) => (
                        <div
                          key={pct}
                          className="absolute left-0 right-0 border-t border-white/[0.04]"
                          style={{ top: `${pct}%` }}
                        />
                      ))}
                      <WavySparkline data={sparkPoints}/>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="font-['JetBrains_Mono'] text-[11px] text-slate-700">Sync holders to see growth</p>
                  </div>
                )}
              </div>
              {holders.length > 0 && (
                <div className="mt-2 ml-6 flex justify-between">
                  {xLabels.map((l) => (
                    <span key={l} className="font-['JetBrains_Mono'] text-[9px] text-slate-700">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
            <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] p-6">
              <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.01em] mb-5">Recent Activations</p>
              <div className="grid grid-cols-[1fr_110px_100px_60px] gap-3 pb-3 border-b border-white/[0.055] font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600">
                <span>Name</span>
                <span>Date</span>
                <span>Status</span>
                <span className="text-right">Pool</span>
              </div>

              {recentActivations.length > 0 ? (
                recentActivations.map((a, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_110px_100px_60px] gap-3 items-center py-4 border-b border-white/[0.04] last:border-0"
                  >
                    <span className="text-[13.5px] font-semibold text-slate-200 truncate">{a.name}</span>
                    <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">{a.date}</span>
                    <StatusBadge status={a.status}/>
                    <span className="text-right font-['JetBrains_Mono'] text-[13px] font-bold text-slate-100">{a.pct}</span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center font-['JetBrains_Mono'] text-[11px] text-slate-700">
                  No activations yet — click &quot;Preview reward&quot; to get started
                </div>
              )}
            </div>
            <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="font-['Space_Grotesk'] text-[15px] font-semibold tracking-[-0.01em]">Top Holders</p>
                <Link
                  href="/dashboard/holders"
                  className="rounded-[7px] border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] text-slate-500 transition hover:text-slate-300"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-1">
                {topThree.length > 0 ? (
                  topThree.map(({ score: s, holder: h }, i) => {
                    const gradients = [
                      "from-amber-400 to-orange-500",
                      "from-violet-500 to-indigo-500",
                      "from-slate-500 to-slate-600",
                    ];
                    const displayName = h?.xUsername
                      ? `@${h.xUsername}`
                      : shortWallet(s.wallet);
                    return (
                      <Link
                        key={s.wallet}
                        href={`/h/${s.wallet}`}
                        className="flex items-center gap-3 rounded-[10px] border border-transparent px-3 py-2.5 transition-all hover:border-violet-500/15 hover:bg-violet-500/[0.04]"
                      >
                        <Avatar
                          name={displayName}
                          size="sm"
                          gradient={gradients[i] ?? gradients[2]}
                        />
                        <p className="flex-1 min-w-0 text-[13px] font-medium text-slate-200 truncate">{displayName}</p>
                        <span className="font-['JetBrains_Mono'] text-[14px] font-bold text-slate-100">{s.score}</span>
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-8 text-center font-['JetBrains_Mono'] text-[11px] text-slate-700">
                    Sync holders to populate
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] overflow-hidden">
            <div className="flex flex-wrap gap-2 border-b border-white/[0.055] p-4">
              {["all", "social", "top10", "true-believers", "no-sells"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={[
                    "rounded-[8px] border px-3 py-1.5 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.08em] transition-all",
                    filter === f
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                      : "border-white/[0.06] text-slate-600 hover:border-white/[0.12] hover:text-slate-400",
                  ].join(" ")}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[0.4fr_1fr_0.7fr_0.6fr_1fr] gap-3 border-b border-white/[0.055] px-5 py-3 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600">
              <span>Rank</span><span>Holder</span><span>Balance</span><span>Score</span><span>Signals</span>
            </div>
            {filteredHolders.length > 0 ? filteredHolders.map((h) => {
              const s = scoreByWallet.get(h.wallet);
              return (
                <Link
                  key={h.wallet}
                  href={`/h/${h.wallet}`}
                  className="grid grid-cols-[0.4fr_1fr_0.7fr_0.6fr_1fr] gap-3 items-center border-b border-white/[0.04] px-5 py-4 text-sm transition hover:bg-violet-500/[0.03] last:border-0"
                >
                  <span className="font-['JetBrains_Mono'] text-[12px] font-semibold text-violet-400">
                    #{h.balanceRank}
                  </span>
                  <div>
                    <p className="font-semibold text-[13px] text-slate-100">
                      {h.xUsername ? `@${h.xUsername}` : shortWallet(h.wallet)}
                    </p>
                    <p className="font-['JetBrains_Mono'] text-[10px] text-slate-600">{shortWallet(h.wallet)}</p>
                  </div>
                  <span className="font-['JetBrains_Mono'] text-[12px] text-slate-300">
                    {h.uiBalance.toLocaleString()}
                  </span>
                  <span className="font-['JetBrains_Mono'] text-[13px] font-bold text-slate-100">
                    {s?.score ?? "—"}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {s?.badges?.join(" · ") ?? "No score"}
                  </span>
                </Link>
              );
            }) : (
              <div className="py-12 text-center font-['JetBrains_Mono'] text-[11px] text-slate-700">
                {holders.length === 0 ? "No holders — click Sync holders" : "No results for this filter"}
              </div>
            )}
          </div>
          <div className="rounded-[12px] border border-white/[0.055] bg-[#080c16] px-5 py-4">
            <p className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-700">Execution log</p>
            {log.map((line, i) => (
              <p key={i} className="font-['JetBrains_Mono'] text-[11px] text-slate-600">{line}</p>
            ))}
          </div>

        </div>
      </div>
  );
}