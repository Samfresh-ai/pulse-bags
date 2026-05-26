"use client";

import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { ActivationPreview, Holder, TokenProfile, TrueFanScore } from "@/lib/types";
import { Step1Panel } from "./activation-blocks/step-one";
import { Step2Panel } from "./activation-blocks/step-two";
import { Step3Panel } from "./activation-blocks/step-three";
import { Step4Panel } from "./activation-blocks/step-four";
import { Step5Panel } from "./activation-blocks/step-five";

type Step = 1 | 2 | 3 | 4 | 5;
type TargetGroup = "top5" | "top10" | "social10" | "believers";
type ActionState = "idle" | "loading" | "success" | "error";

interface PrivyWallet {
  address: string;
}
interface PrivyLinkedAccount {
  type: string;
  address: string;
}
interface PrivyUser {
  wallet?: PrivyWallet;
  linkedAccounts?: PrivyLinkedAccount[];
}

function shortWallet(w: string) {
  return `${w.slice(0, 5)}…${w.slice(-4)}`;
}
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? JSON.stringify(data));
  return data as T;
}

function StepItem({ n, label, sub, state }: {
  n: Step; label: string; sub: string;
  state: "done" | "active" | "pending";
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        <div className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-['JetBrains_Mono'] text-[12px] font-bold transition-all duration-300",
          state === "done"    ? "border-violet-500 bg-violet-500 text-white"
          : state === "active" ? "border-violet-500 bg-violet-500/20 text-violet-300"
                               : "border-white/[0.1] bg-white/[0.03] text-slate-700",
        ].join(" ")}>
          {state === "done" ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : n}
        </div>
        {n < 5 && (
          <div className="flex-1 w-px my-1 min-h-[28px]" style={{
            borderLeft: `1px dashed ${state === "done" ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
          }}/>
        )}
      </div>
      <div className="pb-5 min-w-0">
        <p className={[
          "text-[13px] font-semibold leading-tight transition-colors",
          state === "active" ? "text-slate-100" : state === "done" ? "text-violet-400" : "text-slate-600",
        ].join(" ")}>{label}</p>
        <p className={[
          "mt-0.5 text-[11px] leading-snug transition-colors",
          state === "active" ? "text-slate-500" : "text-slate-700",
        ].join(" ")}>{sub}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export default function ActivationFlow({
  token,
  initialHolders,
  initialScores,
}: {
  token: TokenProfile;
  initialHolders: Holder[];
  initialScores: TrueFanScore[];
}) {
  const { authenticated, user } = usePrivy();
  const privyUser = user as PrivyUser | null;
  const connectedWallet =
    privyUser?.wallet?.address ??
    privyUser?.linkedAccounts?.find((a) => a.type === "wallet")?.address;

  const [step, setStep]               = useState<Step>(1);
  const [targetGroup, setTargetGroup] = useState<TargetGroup>("top5");
  const [holderPoolBps, setBps]       = useState(1000);
  const [preview, setPreview]         = useState<ActivationPreview | null>(null);
  const [actionState, setAction]      = useState<ActionState>("idle");
  const [errorMsg, setError]          = useState<string | null>(null);
  const [activationId, setActId]      = useState<string | null>(null);
  const [txSig, setTxSig]             = useState<string | null>(null);

  const scoreByWallet = useMemo(
    () => new Map(initialScores.map((s) => [s.wallet, s])),
    [initialScores]
  );

  const top5Holders    = useMemo(() => [...initialHolders].sort((a, b) => a.balanceRank - b.balanceRank).slice(0, 5),   [initialHolders]);
  const top10Holders   = useMemo(() => [...initialHolders].sort((a, b) => a.balanceRank - b.balanceRank).slice(0, 10),  [initialHolders]);
  const socialHolders  = useMemo(() => initialHolders.filter((h) => h.xUsername).sort((a, b) => a.balanceRank - b.balanceRank).slice(0, 10), [initialHolders]);
  const believeHolders = useMemo(() => initialHolders.filter((h) => (scoreByWallet.get(h.wallet)?.score ?? 0) >= 85).sort((a, b) => a.balanceRank - b.balanceRank), [initialHolders, scoreByWallet]);

  const groupMap: Record<TargetGroup, { label: string; holders: Holder[] }> = {
    top5:      { label: "Top 5 Holders",        holders: top5Holders    },
    top10:     { label: "Top 10 Holders",        holders: top10Holders   },
    social10:  { label: "Social Matched Top 10", holders: socialHolders  },
    believers: { label: "True Believers",        holders: believeHolders },
  };

  const current = groupMap[targetGroup];
  const busy = actionState === "loading";

  const stepMeta: Record<Step, { label: string; sub: string }> = {
    1: { label: "Select Targets",      sub: "Choose who to reward"  },
    2: { label: "Configure Bonus",     sub: "Set your bonus pool"    },
    3: { label: "Review & Confirm",    sub: "Preview and create tx"  },
    4: { label: "Sign Transaction",    sub: "Approve with wallet"    },
    5: { label: "Activation Complete", sub: "Your fans are rewarded" },
  };
  function stepState(n: Step): "done" | "active" | "pending" {
    return step > n ? "done" : step === n ? "active" : "pending";
  }

  async function goToReview() {
    setAction("loading"); setError(null);
    try {
      const r = await postJson<{ activation: ActivationPreview }>(
        `/api/tokens/${encodeURIComponent(token.mint)}/activation/preview`,
        { targetCount: current.holders.length, holderPoolBps }
      );
      setPreview(r.activation);
      setAction("idle");
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      setAction("error");
    }
  }
  async function createActivation() {
    setAction("loading"); setError(null);
    try {
      const r = await postJson<{ activation: { id: string } }>(
        `/api/tokens/${encodeURIComponent(token.mint)}/activation/create-txs`,
        { targetCount: current.holders.length, holderPoolBps, wallet: connectedWallet }
      );
      setActId(r.activation.id);
      setAction("idle");
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
      setAction("error");
    }
  }
  async function signTransaction() {
    if (!activationId) return;
    setAction("loading"); setError(null);
    try {
      const r = await postJson<{ signatures: string[] }>(
        `/api/tokens/${encodeURIComponent(token.mint)}/activation/${activationId}/sign`,
        { wallet: connectedWallet }
      );
      setTxSig(r.signatures?.[0] ?? null);
      setAction("success");
      setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign failed");
      setAction("error");
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] font-['DM_Sans'] text-slate-100">
      <div className="mx-auto max-w-[680px] px-5 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-['Space_Grotesk'] text-[28px] font-bold tracking-[-0.03em] leading-none">Reward Top Holders</h1>
          <p className="mt-2 text-[14px] text-slate-500">Create a fee-share bonus for your top supporters</p>
        </div>
        <div className="grid grid-cols-[176px_1fr] gap-5 items-start">
          <div className="pt-1">
            {([1, 2, 3, 4, 5] as Step[]).map((n) => (
              <StepItem key={n} n={n} label={stepMeta[n].label} sub={stepMeta[n].sub} state={stepState(n)} />
            ))}
          </div>
          <div className="rounded-[18px] border border-white/[0.07] bg-[#0d1120] p-6 min-h-[520px] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.5)]">
            {step === 1 && (
              <Step1Panel
                targetGroup={targetGroup}
                setTargetGroup={setTargetGroup}
                top5Holders={top5Holders}
                top10Holders={top10Holders}
                socialHolders={socialHolders}
                believeHolders={believeHolders}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step2Panel
                currentLabel={current.label}
                currentHolders={current.holders}
                holderPoolBps={holderPoolBps}
                setBps={setBps}
                busy={busy}
                onBack={() => setStep(1)}
                onNext={goToReview}
                onChangeGroup={() => setStep(1)}
              />
            )}
            {step === 3 && preview && (
              <Step3Panel
                preview={preview}
                initialHolders={initialHolders}
                authenticated={authenticated}
                busy={busy}
                errorMsg={errorMsg}
                onBack={() => setStep(2)}
                onNext={createActivation}
              />
            )}
            {step === 4 && (
              <Step4Panel
                activationId={activationId}
                connectedWallet={connectedWallet}
                busy={busy}
                errorMsg={errorMsg}
                onBack={() => setStep(3)}
                onSign={signTransaction}
              />
            )}
            {step === 5 && (
              <Step5Panel
                currentLabel={current.label}
                currentHoldersCount={current.holders.length}
                holderPoolBps={holderPoolBps}
                preview={preview}
                txSig={txSig}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}