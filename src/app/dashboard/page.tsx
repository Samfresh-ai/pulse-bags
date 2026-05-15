// "use client";

// import Link from "next/link";
// import { useState, useMemo } from "react";
// import { usePrivy } from "@privy-io/react-auth";
// import type { ActivationPreview, Holder, TokenProfile, TrueFanScore } from "@/lib/types";
// import { ActivationPanel } from "./activation-panel";

// /* ─── Types ─── */
// type Props = {
//   initialToken: TokenProfile;
//   initialHolders: Holder[];
//   initialScores: TrueFanScore[];
//   initialActivation: ActivationPreview;
// };
// type ActionState = "idle" | "loading" | "done" | "error";

// /* ─── Helpers ─── */
// function shortWallet(w: string) {
//   if (!w) return "0x000…000";
//   return `${w.slice(0, 5)}…${w.slice(-5)}`;
// }

// async function postJson<T>(url: string, body: unknown): Promise<T> {
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify(body),
//   });
//   const json = await res.json();
//   if (!res.ok) throw new Error(json.error ?? JSON.stringify(json));
//   return json as T;
// }

// /* ─── Tiny SVG icons ─── */
// const OverviewIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/>
//     <rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
//   </svg>
// );
// const HoldersIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="6" cy="5" r="2.5"/><path d="M1 14a5 5 0 0 1 10 0"/>
//     <circle cx="12" cy="5" r="2"/><path d="M14 13a3 3 0 0 0-4-2.8"/>
//   </svg>
// );
// const ActivationsIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M8 2l1.8 3.6L14 6.5l-3 2.9.7 4.1L8 11.5l-3.7 2 .7-4.1-3-2.9 4.2-.9L8 2z"/>
//   </svg>
// );
// const AnalyticsIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M2 12l3.5-4 3 2.5L12 5l2 2"/>
//     <path d="M1 14h14"/>
//   </svg>
// );
// const SettingsIcon = () => (
//   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="8" cy="8" r="2.5"/>
//     <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42"/>
//   </svg>
// );
// const ExternalIcon = () => (
//   <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M4 2H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6"/>
//     <path d="M7 1h2v2M5.5 4.5L9 1"/>
//   </svg>
// );
// const ChevronDown = () => (
//   <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M2.5 4l3 3 3-3"/>
//   </svg>
// );
// const SyncIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M11 2.5A5.5 5.5 0 1 1 6.5 1"/><path d="M9 1l2.5 1.5L10 5"/>
//   </svg>
// );
// const ScoreIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M6.5 1.5l1.5 3 3.5.5-2.5 2.5.6 3.5-3.1-1.6-3.1 1.6.6-3.5L2 5l3.5-.5z"/>
//   </svg>
// );
// const RewardIcon = () => (
//   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <circle cx="6.5" cy="6.5" r="5.5"/>
//     <path d="M6.5 3.5v6M4 5l2.5-1.5L11 5"/>
//   </svg>
// );
// const TrendUp = () => (
//   <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M1 8.5l3-3 2 2 4-5"/><path d="M7 2.5h3v3"/>
//   </svg>
// );

// /* ─── Stat card ─── */
// function StatCard({
//   label, value, delta, sub,
// }: { label: string; value: string | number; delta?: string; sub?: string }) {
//   return (
//     <div className="rounded-[14px] border border-white/[0.07] bg-[#0d1120] p-5">
//       <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-3">{label}</p>
//       <p className="font-['Space_Grotesk'] text-[28px] font-bold tracking-[-0.03em] text-slate-50 leading-none">{value}</p>
//       {delta && (
//         <div className="mt-2 inline-flex items-center gap-1 text-emerald-400">
//           <span className="font-['JetBrains_Mono'] text-[10px] font-medium">{delta}</span>
//         </div>
//       )}
//       {sub && !delta && (
//         <p className="mt-2 font-['JetBrains_Mono'] text-[10px] text-slate-600">{sub}</p>
//       )}
//     </div>
//   );
// }

// /* ─── Inline sparkline ─── */
// function Sparkline({ data }: { data: number[] }) {
//   const max = Math.max(...data);
//   const min = Math.min(...data);
//   const range = max - min || 1;
//   const w = 260, h = 80;
//   const pts = data.map((v, i) => {
//     const x = (i / (data.length - 1)) * w;
//     const y = h - ((v - min) / range) * h;
//     return `${x},${y}`;
//   });
//   const area = `M${pts[0]} ` + pts.slice(1).map((p) => `L${p}`).join(" ") + ` L${w},${h} L0,${h} Z`;
//   const line = `M${pts[0]} ` + pts.slice(1).map((p) => `L${p}`).join(" ");
//   return (
//     <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
//       <defs>
//         <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/>
//           <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0"/>
//         </linearGradient>
//       </defs>
//       <path d={area} fill="url(#sg)"/>
//       <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//     </svg>
//   );
// }

// /* ─── Quick action button ─── */
// function QuickAction({
//   icon, label, onClick, busy,
// }: { icon: React.ReactNode; label: string; onClick: () => void; busy?: boolean }) {
//   return (
//     <button
//       onClick={onClick}
//       disabled={busy}
//       className="flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 font-['DM_Sans'] text-[12px] font-medium text-slate-300 transition-all duration-200 hover:border-violet-500/30 hover:bg-violet-500/[0.06] hover:text-violet-200 disabled:opacity-40"
//     >
//       {busy
//         ? <div className="h-3 w-3 rounded-full border-2 border-violet-400 border-t-transparent animate-spin"/>
//         : icon}
//       {label}
//     </button>
//   );
// }

// /* ─── Activation status badge ─── */
// function ActivationBadge({ status }: { status: string }) {
//   const s = status.toLowerCase();
//   if (s === "completed") return (
//     <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-emerald-400">
//       Completed
//     </span>
//   );
//   if (s === "active") return (
//     <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-violet-300">
//       <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse"/>Active
//     </span>
//   );
//   return (
//     <span className="inline-flex items-center rounded-full border border-slate-600/30 bg-slate-600/10 px-2.5 py-0.5 font-['JetBrains_Mono'] text-[10px] text-slate-500">
//       {status}
//     </span>
//   );
// }

// /* ─── Sidebar nav item ─── */
// function NavItem({
//   icon, label, active = false, href = "#",
// }: { icon: React.ReactNode; label: string; active?: boolean; href?: string }) {
//   return (
//     <Link
//       href={href}
//       className={[
//         "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150",
//         active
//           ? "bg-violet-600/20 text-violet-200 border border-violet-500/20"
//           : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 border border-transparent",
//       ].join(" ")}
//     >
//       <span className={active ? "text-violet-400" : "text-slate-600"}>{icon}</span>
//       {label}
//     </Link>
//   );
// }

// /* ─── Main console (FIXED: Added 'default' export) ─── */
// export default function PulseConsole({
//   initialToken, initialHolders = [], initialScores = [], initialActivation,
// }: Props) {
//   const [token, setToken]           = useState(initialToken);
//   const [holders, setHolders]       = useState(initialHolders);
//   const [scores, setScores]         = useState(initialScores);
//   const [activation, setActivation] = useState(initialActivation);
//   const [filter, setFilter]         = useState("all");
//   const [state, setState]           = useState<ActionState>("idle");
//   const [log, setLog]               = useState<string[]>(["Dashboard loaded."]);
//   const [range, setRange]           = useState<"7D" | "30D" | "All Time">("7D");
//   const [activeNav, setActiveNav]   = useState("overview");

//   const { user } = usePrivy();

//   const scoreByWallet = useMemo(() => new Map(scores.map((s) => [s.wallet, s])), [scores]);

//   const matchedCount = (holders || []).filter((h) => h.xUsername).length;
//   const topScore     = scores.length ? Math.max(...scores.map((s) => s.score), 0) : 0;
//   const topHolder    = [...scores].sort((a, b) => b.score - a.score)[0];
//   const topHolderRaw = topHolder ? holders.find((h) => h.wallet === topHolder.wallet) : null;

//   function pushLog(msg: string) {
//     setLog((c) => [`${new Date().toLocaleTimeString()} ${msg}`, ...c].slice(0, 8));
//   }

//   async function runAction<T>(msg: string, fn: () => Promise<T>) {
//     setState("loading");
//     try {
//       const r = await fn();
//       pushLog(msg);
//       setState("done");
//       return r;
//     } catch (e) {
//       pushLog(e instanceof Error ? `ERROR: ${e.message}` : "ERROR");
//       setState("error");
//       return null;
//     }
//   }

//   async function syncHolders() {
//     const r = await runAction("Holders synced.", () =>
//       postJson<{ holders: Holder[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/sync-holders`, {}));
//     if (r) setHolders(r.holders);
//   }

//   async function syncSocial() {
//     const r = await runAction("Social matched.", () =>
//       postJson<{ identities: unknown[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/sync-social`, { maxFollowers: 100 }));
//     if (r) {
//       const hr = await fetch(`/api/tokens/${encodeURIComponent(token.mint)}/holders`).then((x) => x.json());
//       setHolders(hr.holders);
//       setScores(hr.scores);
//     }
//   }

//   async function recomputeScores() {
//     const r = await runAction("Scores recomputed.", () =>
//       postJson<{ scores: TrueFanScore[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/recompute-scores`, {}));
//     if (r) setScores(r.scores);
//   }

//   async function previewReward() {
//     const r = await runAction("Reward preview built.", () =>
//       postJson<{ activation: ActivationPreview }>(`/api/tokens/${encodeURIComponent(token.mint)}/activation/preview`, { targetCount: 5, holderPoolBps: 1000 }));
//     if (r) setActivation(r.activation);
//   }

//   const filteredHolders = (holders || [])
//     .filter((h) => {
//       const s = scoreByWallet.get(h.wallet);
//       if (filter === "social")          return Boolean(h.xUsername);
//       if (filter === "top10")           return h.balanceRank <= 10;
//       if (filter === "true-believers")  return (s?.score ?? 0) >= 85;
//       if (filter === "no-sells")        return h.sellCount === 0;
//       return true;
//     })
//     .slice(0, 3);

//   const sparkData = [holders.length * 0.4, holders.length * 0.55, holders.length * 0.62,
//     holders.length * 0.7, holders.length * 0.78, holders.length * 0.88, holders.length].map(Math.round);

//   const recentActivations = [
//     { name: activation?.description ?? "Pending activation", date: activation?.createdAt ? new Date(activation.createdAt).toLocaleDateString() : "—", status: activation ? "Active" : "Pending", bps: `${(activation?.holderPoolBps ?? 0) / 100}%` },
//   ];

//   return (
//     <div className="flex min-h-screen bg-[#070b14] font-['DM_Sans'] text-slate-100">

//       {/* ── SIDEBAR ── */}


//       {/* ── MAIN ── */}
//       <main className="flex-1 overflow-auto">
//         <div className="flex h-[64px] items-center justify-between border-b border-white/[0.055] bg-[#070b14]/80 px-7 backdrop-blur-sm sticky top-0 z-10">
//           <div>
//             <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.025em] leading-none">Overview</h1>
//             <p className="mt-0.5 text-[12px] text-slate-600">Your community at a glance</p>
//           </div>

//           <div className="flex items-center gap-2">
//             <div className="flex items-center rounded-[9px] border border-white/[0.07] bg-white/[0.025] p-0.5">
//               {(["7D", "30D", "All Time"] as const).map((r) => (
//                 <button
//                   key={r}
//                   onClick={() => setRange(r)}
//                   className={[
//                     "rounded-[7px] px-3 py-1.5 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.05em] transition-all duration-150",
//                     range === r
//                       ? "bg-violet-600/30 text-violet-200 border border-violet-500/25"
//                       : "text-slate-600 hover:text-slate-400",
//                   ].join(" ")}
//                 >
//                   {r}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="p-7 space-y-6">
//           <div className="flex flex-wrap gap-2">
//             <QuickAction icon={<SyncIcon />}   label="Sync holders"     onClick={syncHolders}    busy={state === "loading"} />
//             <QuickAction icon={<HoldersIcon />} label="Match social"    onClick={syncSocial}     busy={state === "loading"} />
//             <QuickAction icon={<ScoreIcon />}  label="Recompute scores" onClick={recomputeScores} busy={state === "loading"} />
//             <QuickAction icon={<RewardIcon />} label="Preview reward"   onClick={previewReward}  busy={state === "loading"} />
//           </div>

//           <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
//             <StatCard label="Total Holders"       value={holders.length.toLocaleString()} />
//             <StatCard label="Social Matched"      value={matchedCount.toLocaleString()}   />
//             <StatCard label="True Fan Score (Avg)" value={scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : "—"} />
//             <StatCard label="Active Bonus Pool"   value={`${(activation?.holderPoolBps ?? 0) / 100}%`} sub="Fee-Share" />
//           </div>

//           <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
//             <div className="rounded-[14px] border border-white/[0.07] bg-[#0d1120] p-5">
//               <p className="mb-4 font-['Space_Grotesk'] text-[14px] font-semibold tracking-[-0.015em]">Top True Fan</p>
//               {topHolderRaw || topHolder ? (
//                 <>
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-[14px] font-bold text-white shrink-0">
//                       {(topHolderRaw?.xUsername ?? "?")[0].toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="font-['Space_Grotesk'] text-[15px] font-semibold">
//                         @{topHolderRaw?.xUsername ?? shortWallet(topHolder?.wallet ?? "")}
//                       </p>
//                       <p className="font-['JetBrains_Mono'] text-[11px] text-slate-500">
//                         Rank #1 · Score {topHolder?.score ?? "—"}
//                       </p>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <div className="flex flex-col items-center justify-center py-8 text-center">
//                   <p className="font-['JetBrains_Mono'] text-[11px] text-slate-600">No scored holders yet</p>
//                 </div>
//               )}
//             </div>

//             <div className="rounded-[14px] border border-white/[0.07] bg-[#0d1120] p-5">
//               <p className="font-['Space_Grotesk'] text-[14px] font-semibold tracking-[-0.015em]">Holder Growth</p>
//               <div className="mt-4 h-[90px] w-full">
//                 <Sparkline data={sparkData}/>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-[12px] border border-white/[0.055] bg-[#080c16] px-5 py-4">
//             <p className="mb-2 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-700">Execution log</p>
//             <div className="space-y-1">
//               {log.map((line, i) => (
//                 <p key={i} className="font-['JetBrains_Mono'] text-[11px] text-slate-600">{line}</p>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }