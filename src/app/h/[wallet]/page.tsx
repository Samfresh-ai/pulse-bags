import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentHolder, getTokenForHolder } from "@/lib/pulse-state";
import { readPulseState } from "@/lib/store";

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 6)}…${wallet.slice(-6)}`;
}

export default async function HolderProfile({ params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = await params;
  const holder = getCurrentHolder(wallet);
  if (!holder) notFound();
  const token = getTokenForHolder(wallet);
  const state = readPulseState();
  const score = (state.scoresByToken[token.mint] ?? []).find((item) => item.wallet === wallet);
  const activations = state.activations.filter((activation) => activation.targetWallets.includes(wallet));

  return (
    <main className="min-h-screen bg-[#090907] px-5 py-6 text-[#f3efe1] sm:px-8">
      <div className="mx-auto max-w-4xl border border-[#2b291f] bg-[#11100c] p-6 sm:p-8">
        <Link href="/" className="text-xs uppercase tracking-[0.22em] text-[#f1c94b]">← Back to Pulse</Link>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <section>
            <p className="text-xs uppercase tracking-[0.22em] text-[#8d886f]">Verified holder profile</p>
            <h1 className="mt-4 max-w-full break-words text-4xl font-black leading-[0.95] tracking-[-0.06em] text-[#fff8d9] sm:text-5xl"><span className="block">{holder.xUsername ? `@${holder.xUsername}` : shortWallet(holder.wallet)}</span><span className="block">backed {token.symbol}.</span></h1>
            <div className="mt-5 max-w-xl break-words text-base leading-7 text-[#bdb69a] sm:text-lg sm:leading-8"><p>Rank #{holder.balanceRank} · Score {score?.score ?? "pending"}</p><p>{holder.uiBalance.toLocaleString()} tokens held.</p><p>Activation proof and badges live here.</p></div>
          </section>

          <aside className="border border-[#4a3b1b] bg-[#171207] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f1c94b]">True Fan Score</p>
            <p className="mt-4 text-6xl font-black tracking-[-0.08em] text-[#fff8d9] sm:text-7xl">{score?.score ?? "—"}</p>
            <div className="mt-6 space-y-3 text-sm text-[#d8d0aa]">{score?.explanation.map((line) => <p key={line}>• {line}</p>) ?? <p>Score not computed yet.</p>}</div>
          </aside>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {(score?.badges ?? []).map((badge) => <div key={badge} className="border border-[#332b18] bg-[#0b0a08] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[#77715d]">Badge</p><p className="mt-3 text-xl font-black text-[#fff8d9]">{badge}</p></div>)}
        </div>

        <section className="mt-10 border border-[#332b18] bg-[#0b0a08] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[#77715d]">Activation history</p>
          <div className="mt-3 space-y-2 font-mono text-xs text-[#bdb69a]">{activations.length ? activations.map((activation) => <p key={activation.id}>{activation.status} / {activation.targetCount} holders / {activation.id}</p>) : <p>No fee-share bonus window earned yet.</p>}</div>
        </section>
      </div>
    </main>
  );
}
