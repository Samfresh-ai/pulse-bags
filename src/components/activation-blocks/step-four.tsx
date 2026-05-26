import { CTAButton, BackBtn } from "./activation-components";

export interface Step4Props {
  activationId: string | null;
  connectedWallet: string | undefined;
  busy: boolean;
  errorMsg: string | null;
  onBack: () => void;
  onSign: () => void;
}

export function Step4Panel({ activationId, connectedWallet, busy, errorMsg, onBack, onSign }: Step4Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-5">
        <h2 className="font-['Space_Grotesk'] text-[18px] font-bold tracking-[-0.02em]">Sign Transaction</h2>
        <p className="mt-1 font-['JetBrains_Mono'] text-[11px] text-slate-500">Approve with your connected wallet</p>
      </div>
      {activationId && (
        <div className="mb-4 rounded-[12px] border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 mb-1.5">Activation ID</p>
          <p className="font-['JetBrains_Mono'] text-[11px] text-slate-400 break-all">{activationId}</p>
        </div>
      )}
      <div className="mb-4 rounded-[12px] border border-white/[0.07] bg-white/[0.025] px-4 py-3.5">
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.1em] text-slate-600 mb-1.5">Signing wallet</p>
        <p className="font-['JetBrains_Mono'] text-[11px] text-slate-400 break-all">{connectedWallet ?? "No wallet connected"}</p>
      </div>
      <div className="mb-4 rounded-[12px] border border-violet-500/20 bg-violet-500/[0.06] px-4 py-4">
        <p className="font-['JetBrains_Mono'] text-[11px] text-violet-300 leading-relaxed">
          This opens a <strong className="text-violet-200">fee-share bonus window</strong> on Bags — it does not immediately transfer tokens. Holders earn proportionally during the window based on their Pulse rank.
        </p>
      </div>
      {errorMsg && (
        <div className="mb-3 rounded-[10px] border border-red-500/20 bg-red-500/[0.07] px-4 py-3 font-['JetBrains_Mono'] text-[11px] text-red-400">{errorMsg}</div>
      )}
      <div className="mt-auto flex gap-3">
        <BackBtn onClick={onBack} />
        <div className="flex-[2]">
          <CTAButton onClick={onSign} loading={busy} disabled={busy}>
            Sign &amp; Activate
          </CTAButton>
        </div>
      </div>
    </div>
  );
}