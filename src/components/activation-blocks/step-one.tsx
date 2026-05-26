
import type { Holder } from "@/lib/types";
import { AvatarChips, CTAButton } from "./activation-components";

type TargetGroup = "top5" | "top10" | "social10" | "believers";

function TargetCard({ label, desc, holders, selected, disabled, onSelect }: {
  id: TargetGroup; label: string; desc: string;
  holders: Holder[]; selected: boolean; disabled?: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={[
        "w-full rounded-[14px] border px-4 py-4 text-left transition-all duration-200",
        selected
          ? "border-violet-500/60 bg-violet-500/[0.08] shadow-[0_0_0_1px_rgba(139,92,246,0.25)]"
          : disabled
          ? "border-white/[0.05] bg-white/[0.01] opacity-50 cursor-not-allowed"
          : "border-white/[0.07] bg-white/[0.02] hover:border-violet-500/30 hover:bg-violet-500/[0.04]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className={[
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          selected ? "border-violet-500" : "border-white/20",
        ].join(" ")}>
          {selected && <div className="h-1.5 w-1.5 rounded-full bg-violet-500"/>}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-semibold ${selected ? "text-slate-100" : "text-slate-300"}`}>{label}</p>
          <p className="mt-0.5 font-['JetBrains_Mono'] text-[11px] text-slate-600">{desc}</p>
          {holders.length > 0 && <AvatarChips holders={holders} />}
        </div>
        {selected && (
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"/>
        )}
      </div>
    </button>
  );
}

export interface Step1Props {
  targetGroup: TargetGroup;
  setTargetGroup: (g: TargetGroup) => void;
  top5Holders: Holder[];
  top10Holders: Holder[];
  socialHolders: Holder[];
  believeHolders: Holder[];
  onNext: () => void;
}
export function Step1Panel({ targetGroup, setTargetGroup, top5Holders, top10Holders, socialHolders, believeHolders, onNext }: Step1Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-5">
        <h2 className="font-['Space_Grotesk'] text-[18px] font-bold tracking-[-0.02em]">Select Target Group</h2>
        <p className="mt-1 font-['JetBrains_Mono'] text-[11px] text-slate-500">Choose who will receive the bonus</p>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <TargetCard id="top5"      label="Top 5 Holders"         desc="Reward the top 5 by True Fan Score"    holders={top5Holders}    selected={targetGroup === "top5"}      onSelect={() => setTargetGroup("top5")} />
        <TargetCard id="top10"     label="Top 10 Holders"        desc="Reward the top 10 by True Fan Score"   holders={top10Holders}   selected={targetGroup === "top10"}     onSelect={() => setTargetGroup("top10")} />
        <TargetCard id="social10"  label="Social Matched Top 10" desc="Reward top 10 who follow you on X"     holders={socialHolders}  selected={targetGroup === "social10"}  onSelect={() => setTargetGroup("social10")} />
        <TargetCard id="believers" label="True Believers"        desc="Reward holders with score 85+"         holders={believeHolders} selected={targetGroup === "believers"} onSelect={() => setTargetGroup("believers")} />
      </div>
      {targetGroup !== "top5" && (
        <div className="mt-4 rounded-[10px] border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3 font-['JetBrains_Mono'] text-[11px] text-amber-400">
          Top 10+ groups may require additional lookup tables on Bags. Top 5 is the recommended live path.
        </div>
      )}
      <div className="mt-4">
        <CTAButton onClick={onNext}>Next: Configure Bonus</CTAButton>
      </div>
    </div>
  );
}