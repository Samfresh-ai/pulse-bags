import type { Holder } from "@/lib/types";

function shortWallet(w: string) {
  return `${w.slice(0, 5)}…${w.slice(-4)}`;
}

function AvatarChips({ holders }: { holders: Holder[] }) {
  const gradients = [
    "from-amber-400 to-orange-500",
    "from-violet-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-pink-500 to-rose-600",
    "from-sky-500 to-cyan-600",
  ];
  const shown = holders.slice(0, 4);
  const extra = holders.length - shown.length;
  return (
    <div className="flex items-center gap-1 mt-2.5">
      {shown.map((h, i) => {
        const name = h.xUsername ?? h.wallet;
        return (
          <div
            key={h.wallet}
            title={h.xUsername ? `@${h.xUsername}` : shortWallet(h.wallet)}
            className={`h-7 w-7 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-[#0d1120] shrink-0`}
          >
            {name[0]?.toUpperCase()}
          </div>
        );
      })}
      {extra > 0 && (
        <div className="h-7 w-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[9px] font-['JetBrains_Mono'] text-slate-500">
          +{extra}
        </div>
      )}
    </div>
  );
}

export function BpsInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">Holder pool</span>
        <span className="font-['JetBrains_Mono'] text-[14px] font-bold text-slate-100">{(value / 100).toFixed(0)}%</span>
      </div>
      <input
        type="range" min={100} max={3000} step={100}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-500"
      />
      <div className="flex justify-between mt-1 font-['JetBrains_Mono'] text-[9px] text-slate-700">
        <span>1%</span><span>15%</span><span>30%</span>
      </div>
      <p className="mt-3 font-['JetBrains_Mono'] text-[11px] text-slate-600">
        Remaining {((10000 - value) / 100).toFixed(0)}% routes to the creator wallet as normal fee-share.
      </p>
    </div>
  );
}

export function ClaimerRow({ wallet, bps, rank, xUsername }: {
  wallet: string; bps: number; rank?: number; xUsername?: string;
}) {
  const label = xUsername ? `@${xUsername}` : shortWallet(wallet);
  const isCreator = !rank;
  const pct = (bps / 10000) * 100;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${isCreator ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-gradient-to-br from-amber-400 to-orange-500"}`}>
        {(label[0] === "@" ? label[1] : label[0])?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-slate-200 truncate">{label}</p>
        <p className="font-['JetBrains_Mono'] text-[10px] text-slate-600">{isCreator ? "Creator" : `Rank #${rank}`}</p>
      </div>
      <div className="text-right">
        <p className="font-['JetBrains_Mono'] text-[12px] font-bold text-slate-100">{pct.toFixed(1)}%</p>
        <p className="font-['JetBrains_Mono'] text-[10px] text-slate-600">{bps} bps</p>
      </div>
    </div>
  );
}

export function CTAButton({ onClick, disabled, loading, children }: {
  onClick: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-[12px] bg-violet-600 py-4 text-[14px] font-semibold text-white transition-all hover:bg-violet-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_24px_rgba(139,92,246,0.3)]"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"/>
          Loading…
        </span>
      ) : children}
    </button>
  );
}

export function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-[12px] border border-white/[0.07] bg-white/[0.025] py-3.5 text-[13px] font-medium text-slate-400 transition hover:text-slate-200"
    >
      Back
    </button>
  );
}

export { AvatarChips };
