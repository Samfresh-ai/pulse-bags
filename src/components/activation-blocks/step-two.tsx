import type { Holder } from "@/lib/types";
import { AvatarChips, BpsInput, CTAButton, BackBtn } from "./activation-components";

export interface Step2Props {
  currentLabel: string;
  currentHolders: Holder[];
  holderPoolBps: number;
  setBps: (v: number) => void;
  busy: boolean;
  onBack: () => void;
  onNext: () => void;
  onChangeGroup: () => void;
}

export function Step2Panel({ currentLabel, currentHolders, holderPoolBps, setBps, busy, onBack, onNext, onChangeGroup }: Step2Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="font-['Space_Grotesk'] text-[18px] font-bold tracking-[-0.02em]">Configure Bonus Pool</h2>
        <p className="mt-1 font-['JetBrains_Mono'] text-[11px] text-slate-500">Set the fee-share split for the bonus window</p>
      </div>
      <div className="rounded-[12px] border border-white/[0.07] bg-white/[0.025] px-4 py-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600">Target group</span>
          <button onClick={onChangeGroup} className="font-['JetBrains_Mono'] text-[10px] text-violet-400 hover:text-violet-300 transition">Change</button>
        </div>
        <p className="text-[13px] font-semibold text-slate-100">{currentLabel}</p>
        <p className="font-['JetBrains_Mono'] text-[11px] text-slate-600 mt-0.5">{currentHolders.length} wallet{currentHolders.length !== 1 ? "s" : ""} will share the pool</p>
        <AvatarChips holders={currentHolders} />
      </div>
      <div className="rounded-[12px] border border-white/[0.07] bg-white/[0.025] px-4 py-4 mb-4">
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 mb-3">Fee-share allocation</p>
        <BpsInput value={holderPoolBps} onChange={setBps} />
      </div>
      {currentHolders.length > 0 && (
        <div className="rounded-[12px] border border-violet-500/15 bg-violet-500/[0.06] px-4 py-3.5 mb-4">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-violet-400 mb-1">Each holder receives</p>
          <p className="font-['Space_Grotesk'] text-[20px] font-bold text-violet-300">
            {(holderPoolBps / currentHolders.length / 100).toFixed(1)}%
          </p>
          <p className="font-['JetBrains_Mono'] text-[10px] text-slate-600 mt-0.5">of all fee-share during the bonus window</p>
        </div>
      )}
      <div className="mt-auto flex gap-3">
        <BackBtn onClick={onBack} />
        <div className="flex-[2]">
          <CTAButton onClick={onNext} loading={busy} disabled={busy}>
            Next: Review & Confirm
          </CTAButton>
        </div>
      </div>
    </div>
  );
}