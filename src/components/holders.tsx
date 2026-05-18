"use client";

import Link from "next/link";
import {useMemo, useState } from "react";
import type { Holder, TokenProfile, TrueFanScore } from "@/lib/types";
import { Pagination } from "./ui/pagination";

type EnhancedHolder = Holder & {
  holdDays?: number;
};

type Filter = "all" | "social" | "top10" | "true-believers" | "no-sells";
type SortKey = "rank" | "balance" | "days" | "score";
type SortDir = "asc" | "desc";

function shortWallet(w: string) {
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

const BADGE_EMOJI: Record<string, string> = {
  "diamond-hands": "💎",
  "diamond hands": "💎",
  "og": "👑",
  "early": "👑",
  "true-believer": "💜",
  "true believer": "💜",
  "no-sells":"🔥",
  "no sells":"🔥",
  "whale":"🐳",
  "social":"✨",
};

function getBadgeEmoji(badge: string): string {
  const lower = badge.toLowerCase();
  for (const [key, emoji] of Object.entries(BADGE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "⭐";
}

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5l3 3"/>
  </svg>
);
const IconFilter = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 2.5h11M3 6.5h7M5 10.5h3"/>
  </svg>
);
const IconHolders = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5"/><path d="M1 14a5 5 0 0 1 10 0"/>
    <circle cx="12.5" cy="5.5" r="2"/><path d="M15 13.5a3 3 0 0 0-5-2.2"/>
  </svg>
);

function Avatar({ name }: { name: string }) {
  const gradients = [
    "from-amber-400 to-orange-500",
    "from-violet-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-sky-500 to-cyan-600",
    "from-fuchsia-500 to-purple-600",
  ];
  const idx = (name.charCodeAt(0) ?? 0) % gradients.length;
  return (
    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradients[idx]} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20"
    : score >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 70 ? "text-amber-300 bg-amber-400/10 border-amber-400/20"
                  : "text-slate-400 bg-slate-500/10 border-slate-500/20";
  return (
    <span className={`inline-flex items-center justify-center min-w-[36px] rounded-[6px] border px-2 py-0.5 font-['JetBrains_Mono'] text-[13px] font-bold ${color}`}>
      {score}
    </span>
  );
}

function ColHeader({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey: SortKey;
  current: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 hover:text-slate-300 transition group"
    >
      {label}
      <span className={`transition-opacity ${active ? "opacity-100 text-violet-400" : "opacity-0 group-hover:opacity-40"}`}>
        {active && dir === "desc" ? "↓" : "↑"}
      </span>
    </button>
  );
}

const PAGE_SIZE = 8;

export default function HoldersPage({
  initialHolders,
  initialScores,
}: {
  initialToken: TokenProfile;
  initialHolders: Holder[];
  initialScores: TrueFanScore[];
}) {
  const [holders]  = useState<EnhancedHolder[]>(initialHolders);
  const [scores]   = useState(initialScores);

  const [filter, setFilter]   = useState<Filter>("all");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const scoreByWallet = useMemo(
    () => new Map(scores.map((s) => [s.wallet, s])),
    [scores]
  );

  const filtered = useMemo(() => {
    let list = holders.filter((h) => {
      const s = scoreByWallet.get(h.wallet);
      if (filter === "social")         return Boolean(h.xUsername);
      if (filter === "top10")          return h.balanceRank <= 10;
      if (filter === "true-believers") return (s?.score ?? 0) >= 85;
      if (filter === "no-sells")       return h.sellCount === 0;
      return true;
    });

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.wallet.toLowerCase().includes(q) ||
          (h.xUsername ?? "").toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      const sa = scoreByWallet.get(a.wallet);
      const sb = scoreByWallet.get(b.wallet);
      let diff = 0;
      if (sortKey === "rank")    diff = a.balanceRank - b.balanceRank;
      if (sortKey === "balance") diff = b.uiBalance - a.uiBalance;
      if (sortKey === "days")    diff = (b.holdDays ?? 0) - (a.holdDays ?? 0);
      if (sortKey === "score")   diff = (sb?.score ?? 0) - (sa?.score ?? 0);
      return sortDir === "asc" ? diff : -diff;
    });

    return list;
  }, [holders, filter, search, sortKey, sortDir, scoreByWallet]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange(newFilter: Filter) {
    setFilter(newFilter);
    setPage(1);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(1);
  }

  function handleSort(k: SortKey) {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir("asc");
    }
    setPage(1);
  }

  const filterTabs: { key: Filter; label: string; icon?: string }[] = [
    { key: "all",            label: "All" },
    { key: "social",         label: "Social Matched", icon: "⭐" },
    { key: "top10",          label: "Top 10" },
    { key: "true-believers", label: "True Believers" },
    { key: "no-sells",       label: "No Sells" },
  ];

  return (
    <div className="flex min-h-screen bg-[#070b14] font-['DM_Sans'] text-slate-100">
      <div className="flex-1 flex flex-col overflow-auto">

        <div className="sticky top-0 z-20 border-b border-white/[0.055] bg-[#070b14]/90 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4 px-8 pt-7 pb-5">
            <div>
              <h1 className="font-['Space_Grotesk'] text-[26px] font-bold tracking-[-0.03em] leading-none">Holders</h1>
              <p className="mt-1.5 text-[13px] text-slate-500">Your token holders ranked by True Fan Score</p>
            </div>

            <div className="relative w-[280px]">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                <IconSearch />
              </span>
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search holders…"
                className="h-10 w-full rounded-[11px] border border-white/[0.08] bg-[#0e1422] pl-9 pr-4 font-['DM_Sans'] text-[13px] text-slate-200 placeholder-slate-700 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/15"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-8 pb-5">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key)}
                className={[
                  "flex items-center gap-1.5 rounded-[10px] border px-4 py-2 font-['DM_Sans'] text-[13px] font-medium transition-all duration-150",
                  filter === tab.key
                    ? "border-violet-500/30 bg-violet-600/20 text-violet-200"
                    : "border-white/[0.07] bg-white/[0.025] text-slate-500 hover:border-white/[0.12] hover:text-slate-300",
                ].join(" ")}
              >
                {tab.icon && <span className="text-[11px]">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}

            <div className="ml-auto">
              <button className="flex items-center gap-2 rounded-[10px] border border-white/[0.07] bg-[#0e1422] px-4 py-2 font-['DM_Sans'] text-[13px] font-medium text-slate-400 transition hover:border-white/[0.12] hover:text-slate-300">
                <IconFilter /> Filter
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 py-6">
          <div className="rounded-[16px] border border-white/[0.07] bg-[#0e1422] overflow-hidden">

            <div className="grid grid-cols-[52px_1fr_140px_110px_130px_160px] items-center gap-0 border-b border-white/[0.055] px-5 py-3.5">
              <ColHeader label="Rank"           sortKey="rank"    current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Holder"         sortKey="rank"    current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Balance"        sortKey="balance" current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="Days Held"      sortKey="days"    current={sortKey} dir={sortDir} onSort={handleSort} />
              <ColHeader label="True Fan Score" sortKey="score"   current={sortKey} dir={sortDir} onSort={handleSort} />
              <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600">Badges</span>
            </div>
            {paginated.length > 0 ? (
              paginated.map((holder) => {
                const score = scoreByWallet.get(holder.wallet);
                const displayName = holder.xUsername ? `@${holder.xUsername}` : shortWallet(holder.wallet);
                const holdDays = holder.holdDays;

                return (
                  <Link
                    key={holder.wallet}
                    href={`/h/${holder.wallet}`}
                    className="grid grid-cols-[52px_1fr_140px_110px_130px_160px] items-center gap-0 border-b border-white/[0.04] px-5 py-4 transition-colors hover:bg-violet-500/[0.035] last:border-0 group"
                  >
                    <span className="font-['JetBrains_Mono'] text-[13px] font-semibold text-slate-400">
                      {holder.balanceRank}
                    </span>
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <Avatar name={displayName} />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-slate-100 truncate group-hover:text-violet-200 transition-colors">
                          {displayName}
                        </p>
                        {holder.xUsername && (
                          <p className="font-['JetBrains_Mono'] text-[10px] text-slate-600 truncate">
                            {shortWallet(holder.wallet)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-slate-300">
                      {holder.uiBalance.toLocaleString()}
                    </span>
                    <span className="font-['JetBrains_Mono'] text-[13px] text-slate-300">
                      {holdDays != null ? holdDays : "—"}
                    </span>
                    <div>
                      {score != null ? (
                        <ScorePill score={score.score} />
                      ) : (
                        <span className="font-['JetBrains_Mono'] text-[12px] text-slate-700">—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {score?.badges?.length ? (
                        score.badges.slice(0, 5).map((b) => (
                          <span key={b} title={b} className="text-[17px] leading-none select-none">
                            {getBadgeEmoji(b)}
                          </span>
                        ))
                      ) : (
                        <span className="font-['JetBrains_Mono'] text-[10px] text-slate-700">No badges</span>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-slate-700">
                  <IconHolders />
                </div>
                <p className="font-['JetBrains_Mono'] text-[12px] text-slate-600">
                  {holders.length === 0
                    ? "No holders synced yet"
                    : search
                    ? `No results for "${search}"`
                    : "No holders match this filter"}
                </p>
                {holders.length === 0 && (
                  <p className="font-['JetBrains_Mono'] text-[11px] text-slate-700">
                    Go to Overview and click &quot;Sync holders&quot;
                  </p>
                )}
              </div>
            )}
          </div>
          {filtered.length > 0 && (
            <div className="mt-5 flex items-center justify-between">
              <p className="font-['JetBrains_Mono'] text-[12px] text-slate-600">
                Showing{" "}
                <span className="text-slate-400">{(page - 1) * PAGE_SIZE + 1}</span>
                {" "}to{" "}
                <span className="text-slate-400">{Math.min(page * PAGE_SIZE, filtered.length)}</span>
                {" "}of{" "}
                <span className="text-slate-400">{filtered.length.toLocaleString()}</span>
                {" "}holders
              </p>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}