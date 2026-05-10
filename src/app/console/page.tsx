import { buildActivationPreview } from "@/lib/activation";
import { readPulseState } from "@/lib/store";
import { PulseConsole } from "@/components/pulse-console";

export default function Home() {
  const state = readPulseState();
  const token = state.tokens[0];
  const holders = state.holdersByToken[token.mint] ?? [];
  const scores = state.scoresByToken[token.mint] ?? [];
  const activation = buildActivationPreview({ holders, creatorWallet: token.adminWallet ?? token.creatorWallet });
  return <PulseConsole initialToken={token} initialHolders={holders} initialScores={scores} initialActivation={activation} />;
}
