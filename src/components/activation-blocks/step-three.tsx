import type { Holder, ActivationPreview } from "@/lib/types";
import { ClaimerRow, CTAButton, BackBtn } from "./activation-components";

export interface Step3Props {
  preview: ActivationPreview;
  initialHolders: Holder[];
  authenticated: boolean;
  busy: boolean;
  errorMsg: string | null;
  onBack: () => void;
  onNext: () => void;
}

export function Step3Panel({ preview, initialHolders, authenticated, busy, errorMsg, onBack, onNext }: Step3Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="font-['Space_Grotesk'] text-[18px] font-bold tracking-[-0.02em]">Review & Confirm</h2>
        <p className="mt-1 font-['JetBrains_Mono'] text-[11px] text-slate-500">Fee-share distribution preview</p>
      </div>
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: "Recipients",  value: preview.targetCount },
          { label: "Holder pool", value: `${(preview.holderPoolBps / 100).toFixed(0)}%` },
          { label: "Each gets",   value: `${(preview.holderBpsEach / 100).toFixed(1)}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-[10px] border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-center">
            <p className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-[0.1em] text-slate-600 mb-1">{s.label}</p>
            <p className="font-['Space_Grotesk'] text-[18px] font-bold text-slate-100">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[12px] border border-white/[0.07] bg-white/[0.025] px-4 py-2 mb-4 overflow-y-auto max-h-[200px]">
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 py-2 border-b border-white/[0.055]">Claimers & allocation</p>
        {preview.claimersArray.map((w, i) => {
          const bps = preview.basisPointsArray[i] ?? 0;
          const h   = initialHolders.find((x) => x.wallet === w);
          return (
            <ClaimerRow
              key={w} wallet={w} bps={bps}
              rank={w === preview.creatorWallet ? undefined : h?.balanceRank}
              xUsername={h?.xUsername}
            />
          );
        })}
      </div>
      {preview.warning && (
        <div className="mb-3 rounded-[10px] border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 font-['JetBrains_Mono'] text-[11px] text-amber-400">⚠ {preview.warning}</div>
      )}
      {!authenticated && (
        <div className="mb-3 rounded-[10px] border border-red-500/20 bg-red-500/[0.07] px-4 py-3 font-['JetBrains_Mono'] text-[11px] text-red-400">Connect your creator wallet to proceed.</div>
      )}
      {errorMsg && (
        <div className="mb-3 rounded-[10px] border border-red-500/20 bg-red-500/[0.07] px-4 py-3 font-['JetBrains_Mono'] text-[11px] text-red-400">{errorMsg}</div>
      )}
      <div className="mt-auto flex gap-3">
        <BackBtn onClick={onBack} />
        <div className="flex-[2]">
          <CTAButton onClick={onNext} loading={busy} disabled={busy || !authenticated}>
            Create Bags Transaction
          </CTAButton>
        </div>
      </div>
    </div>
  );
}