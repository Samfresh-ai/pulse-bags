
export interface Step5Props {
  currentLabel: string;
  currentHoldersCount: number;
  holderPoolBps: number;
  preview: ActivationPreview | null;
  txSig: string | null;
}

export function Step5Panel({ currentLabel, currentHoldersCount, holderPoolBps, preview, txSig }: Step5Props) {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center gap-5 py-6">
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-4 border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.15)]">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l7 7 13-13" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping opacity-30"/>
      </div>
      <div>
        <h2 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.02em]">Activation Complete</h2>
        <p className="mt-1.5 font-['JetBrains_Mono'] text-[12px] text-slate-500">Fee-share bonus window is live on Bags</p>
      </div>
      <div className="w-full rounded-[12px] border border-emerald-500/15 bg-emerald-500/[0.06] px-5 py-4 text-left">
        {[
          { label: "Target group", value: currentLabel },
          { label: "Recipients",   value: preview?.targetCount ?? currentHoldersCount },
          { label: "Holder pool",  value: `${(holderPoolBps / 100).toFixed(0)}% of fee-share` },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between py-1.5">
            <span className="font-['JetBrains_Mono'] text-[10px] text-slate-600">{r.label}</span>
            <span className="font-['JetBrains_Mono'] text-[11px] font-semibold text-emerald-400">{r.value}</span>
          </div>
        ))}
      </div>
      {txSig && (
        <a href={`https://explorer.solana.com/tx/${txSig}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-violet-400 hover:text-violet-300 transition">
          View on Explorer
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 2H2.5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6.5"/>
            <path d="M7 1h3v3M5 6l5-5"/>
          </svg>
        </a>
      )}
    </div>
  );
}
