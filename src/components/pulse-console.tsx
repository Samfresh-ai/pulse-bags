"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import type { ActivationPreview, Holder, TokenProfile, TrueFanScore } from "@/lib/types";
import { ActivationPanel } from "./activation-panel";
import DashboardSidebar from "./ui/dashboard-sidebar";
import DashboardOverview from "./dashboard-overview";
import HoldersPage from "./holders";
import ActivationFlow from "./activation-flow";

type Props = {
  initialToken: TokenProfile;
  initialHolders: Holder[];
  initialScores: TrueFanScore[];
  initialActivation: ActivationPreview;
};

type ActionState = "idle" | "loading" | "done" | "error";

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 5)}…${wallet.slice(-5)}`;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? JSON.stringify(json));
  return json as T;
}

export function PulseConsole({ initialToken, initialHolders, initialScores, initialActivation }: Props) {
  const [mint, setMint] = useState(initialToken.mint);
  const [token, setToken] = useState(initialToken);
  const [holders, setHolders] = useState(initialHolders);
  const [scores, setScores] = useState(initialScores);
  const [activation, setActivation] = useState(initialActivation);
  const [filter, setFilter] = useState("all");
  const [log, setLog] = useState<string[]>(["Demo state loaded. Live mode activates when API keys are present."]);
  const [state, setState] = useState<ActionState>("idle");
  const [launchUrl, setLaunchUrl] = useState("");
  const [activeNav, setActiveNav] = useState("overview");
  const { ready, authenticated, user, login, logout } = usePrivy();

  const scoreByWallet = useMemo(() => new Map(scores.map((score) => [score.wallet, score])), [scores]);
  const filteredHolders = holders.filter((holder) => {
    const score = scoreByWallet.get(holder.wallet);
    if (filter === "social") return Boolean(holder.xUsername);
    if (filter === "top10") return holder.balanceRank <= 10;
    if (filter === "true-believers") return (score?.score ?? 0) >= 85;
    if (filter === "no-sells") return holder.sellCount === 0;
    return true;
  });
  const matchedCount = holders.filter((holder) => holder.xUsername).length;
  const topScore = Math.max(...scores.map((score) => score.score), 0);
  const authorityWallets = useMemo(() => {
    const seen = new Set<string>();
    return [token.adminWallet, ...(token.adminWallets ?? []), token.creatorWallet, ...(token.creatorWallets ?? [])].filter((wallet): wallet is string => {
      if (!wallet || seen.has(wallet)) return false;
      seen.add(wallet);
      return true;
    });
  }, [token]);

  function pushLog(message: string) {
    setLog((current) => [`${new Date().toLocaleTimeString()} ${message}`, ...current].slice(0, 6));
  }

  async function runAction<T>(message: string, action: () => Promise<T>) {
    setState("loading");
    try {
      const result = await action();
      pushLog(message);
      setState("done");
      return result;
    } catch (error) {
      pushLog(error instanceof Error ? `ERROR: ${error.message}` : "ERROR: Unknown failure");
      setState("error");
      return null;
    }
  }

  const connectedWallet = user?.wallet?.address ?? user?.linkedAccounts?.find((account) => account.type === "wallet")?.address;

  async function connectToken() {
    const result = await runAction("Token connected and creator/admin context checked.", () =>
      postJson<{ token: TokenProfile; access: string; warning?: string }>("/api/tokens/connect", { mint, wallet: connectedWallet }),
    );
    if (!result) return;
    setToken(result.token);
    setMint(result.token.mint);
    if (result.warning) pushLog(result.warning);
  }

  async function syncHolders() {
    const result = await runAction("Holder snapshot imported and ranked.", () =>
      postJson<{ holders: Holder[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/sync-holders`, {}),
    );
    if (!result) return;
    setHolders(result.holders);
    await recomputeScores(false);
  }

  async function syncSocial() {
    const result = await runAction("Social follower wallet matches joined into holder table.", () =>
      postJson<{ identities: unknown[]; warning?: string; xMode?: string }>(`/api/tokens/${encodeURIComponent(token.mint)}/sync-social`, { maxFollowers: 100 }),
    );
    if (!result) return;
    if (result.warning) pushLog(result.warning);
    const holdersResult = await fetch(`/api/tokens/${encodeURIComponent(token.mint)}/holders`).then((res) => res.json());
    setHolders(holdersResult.holders);
    setScores(holdersResult.scores);
  }

  async function recomputeScores(withLog = true) {
    const result = await runAction(withLog ? "Scores recomputed." : "Scores refreshed after holder import.", () =>
      postJson<{ scores: TrueFanScore[] }>(`/api/tokens/${encodeURIComponent(token.mint)}/recompute-scores`, {}),
    );
    if (!result) return;
    setScores(result.scores);
  }

  async function refreshActivation(targetCount = 5, holderPoolBps = 1000) {
    const result = await runAction("Activation preview rebuilt.", () =>
      postJson<{ activation: ActivationPreview }>(`/api/tokens/${encodeURIComponent(token.mint)}/activation/preview`, { targetCount, holderPoolBps }),
    );
    if (!result) return;
    setActivation(result.activation);
  }

  async function createLaunchIntent() {
    const result = await runAction("Bags launch intent generated for a no-token path.", () =>
      postJson<{ url: string; note: string }>("/api/bags/launch-intent", { adminWallet: connectedWallet, twitterUsername: "Samfresh_" }),
    );
    if (!result) return;
    setLaunchUrl(result.url);
    pushLog(result.note);
  }

  return (
    <main className="flex min-h-screen bg-[#070b14] font-['DM_Sans'] text-slate-100">
      <DashboardSidebar 
        activeNav={activeNav}
        token={token}
        onNavChange={setActiveNav}
      />

      <div className="flex-1 overflow-auto">
        {activeNav === "overview" ? (
          <DashboardOverview
            initialToken={token}
            initialHolders={holders}
            initialScores={scores}
            initialActivation={activation}
          />
        ) : activeNav === "holders" ? (
          <HoldersPage
            initialToken={token}
            initialHolders={holders}
            initialScores={scores}
          />
        ) : activeNav === "activations" ? (
          <ActivationFlow
            token={token}
            initialHolders={holders}
            initialScores={scores}
          />
        ) : (
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b291f] pb-4 text-xs uppercase tracking-[0.22em] text-[#8d886f]">
          <span>Pulse / Bags fan CRM</span>
          <span className={state === "error" ? "text-[#ff6b4a]" : state === "loading" ? "text-[#f1c94b]" : "text-[#8d886f]"}>{state}</span>
        </nav>

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-[#383325] bg-[#11100c] p-6 shadow-2xl shadow-black/40 sm:p-8">
            <p className="mb-5 w-fit border border-[#5a4d26] bg-[#1d180d] px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#f1c94b]">Discover → rank → reward</p>
            <h1 className="max-w-4xl text-5xl font-black tracking-[-0.06em] text-[#fff8d9] sm:text-7xl lg:text-8xl">Meet the fans who put money behind you.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#bdb69a]">Pulse maps Bags token holders to real social followers, scores the strongest believers, and prepares a Bags fee-share activation for the top holders.</p>


            <div className="mt-6 border border-[#4a3b1b] bg-[#171207] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#f1c94b]">Privy creator session</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#d8d0aa]">
                <span>{!process.env.NEXT_PUBLIC_PRIVY_APP_ID ? "Privy app id missing" : !ready ? "Checking session…" : authenticated ? `Signed in${connectedWallet ? ` / ${shortWallet(connectedWallet)}` : ""}` : "Not signed in"}</span>
                <button onClick={() => (authenticated ? logout() : login())} className="border border-[#f1c94b] px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#f1c94b]">
                  {authenticated ? "Log out" : "Privy login"}
                </button>
                {authenticated && <button onClick={() => runAction("Creator session stored from Privy.", () => postJson("/api/creator/upsert", { privyUserId: user?.id, wallet: connectedWallet, displayName: user?.email?.address }))} className="border border-[#332b18] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#d8d0aa]">Store creator</button>}
              </div>
            </div>

            <div className="mt-8 border border-[#4a3b1b] bg-[#171207] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#f1c94b]">No Bags token yet</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#bdb69a]">Use the fallback path: generate a Bags launch intent for a Pulse Genesis token with fee-sharing prefilled. Bags handles wallet review/signing; Pulse gets a real token mint after launch.</p>
                </div>
                <button onClick={createLaunchIntent} className="border border-[#f1c94b] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#f1c94b]">Generate Bags launch</button>
              </div>
              {launchUrl && (
                <div className="mt-4 border border-[#332b18] bg-[#090907] p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#77715d]">Launch intent URL</p>
                  <p className="mt-2 font-mono text-xs text-[#d8d0aa]">{launchUrl}</p>
                  <a href={launchUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block border border-[#332b18] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[#f1c94b]">Open Bags launch</a>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Bags token mint</span>
                <input value={mint} onChange={(event) => setMint(event.target.value)} className="mt-2 w-full border border-[#332b18] bg-[#090907] px-4 py-4 font-mono text-sm text-[#fff8d9] outline-none focus:border-[#f1c94b]" />
              </label>
              <button onClick={connectToken} className="self-end border border-[#f1c94b] px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#f1c94b]">Connect token</button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              <div className="border border-[#2b291f] bg-[#0b0a08] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Token</p><p className="mt-3 text-2xl font-bold">{token.symbol}</p><p className="mt-1 text-xs text-[#8d886f]">{token.access ?? "unchecked"}</p></div>
              <div className="border border-[#2b291f] bg-[#0b0a08] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Holders</p><p className="mt-3 text-2xl font-bold">{holders.length}</p><p className="mt-1 text-xs text-[#8d886f]">ranked snapshot</p></div>
              <div className="border border-[#2b291f] bg-[#0b0a08] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Social matches</p><p className="mt-3 text-2xl font-bold">{matchedCount}</p><p className="mt-1 text-xs text-[#8d886f]">X → Bags join</p></div>
              <div className="border border-[#2b291f] bg-[#0b0a08] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Top score</p><p className="mt-3 text-2xl font-bold">{topScore}</p><p className="mt-1 text-xs text-[#8d886f]">true fan max</p></div>
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="border border-[#2b291f] bg-[#0b0a08] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Bags creator/admin</p>
                <p className="mt-3 break-all font-mono text-xs text-[#d8d0aa]">{authorityWallets[0] ?? "Connect token to verify"}</p>
                <p className="mt-2 text-xs text-[#8d886f]">{token.verifiedAt ? `Verified ${new Date(token.verifiedAt).toLocaleString()}` : "Demo/configured until Bags verifies the mint"}</p>
              </div>
              <div className="border border-[#2b291f] bg-[#0b0a08] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Connected wallet</p>
                <p className="mt-3 break-all font-mono text-xs text-[#d8d0aa]">{connectedWallet ?? "Sign in with Privy wallet"}</p>
                <p className="mt-2 text-xs text-[#8d886f]">{token.access === "admin" || token.access === "creator" || token.access === "demo-admin" ? "Activation authority available" : "View-only until the creator/admin wallet is connected"}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={syncHolders} className="border border-[#332b18] bg-[#0b0a08] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#d8d0aa]">Sync holders</button>
              <button onClick={syncSocial} className="border border-[#332b18] bg-[#0b0a08] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#d8d0aa]">Match social</button>
              <button onClick={() => recomputeScores()} className="border border-[#332b18] bg-[#0b0a08] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#d8d0aa]">Recompute score</button>
              <button onClick={() => refreshActivation()} className="border border-[#332b18] bg-[#0b0a08] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#d8d0aa]">Preview reward</button>
            </div>

            <div className="mt-6 border border-[#2b291f] bg-[#090907] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#77715d]">Execution log</p>
              <div className="mt-3 space-y-2 font-mono text-xs text-[#bdb69a]">{log.map((line) => <p key={line}>{line}</p>)}</div>
            </div>
          </div>

          <ActivationPanel token={token} activation={activation} />
        </div>

        <section className="border border-[#2b291f] bg-[#0d0c09]">
          <div className="flex flex-wrap gap-2 border-b border-[#2b291f] p-3">
            {["all", "social", "top10", "true-believers", "no-sells"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`border px-3 py-2 text-xs uppercase tracking-[0.16em] ${filter === item ? "border-[#f1c94b] text-[#f1c94b]" : "border-[#2b291f] text-[#8d886f]"}`}>{item}</button>)}
          </div>
          <div className="grid border-b border-[#2b291f] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#8d886f] sm:grid-cols-[0.45fr_1fr_0.7fr_0.7fr_1fr]"><span>Rank</span><span>Believer</span><span>Balance</span><span>Score</span><span>Why</span></div>
          {filteredHolders.map((holder) => {
            const score = scoreByWallet.get(holder.wallet);
            return <Link href={`/h/${holder.wallet}`} key={holder.wallet} className="grid gap-2 border-b border-[#201e17] px-4 py-4 text-sm transition hover:bg-[#15130e] sm:grid-cols-[0.45fr_1fr_0.7fr_0.7fr_1fr] sm:items-center"><span className="font-mono text-[#f1c94b]">#{holder.balanceRank}</span><span><strong className="block text-[#fff8d9]">{holder.xUsername ? `@${holder.xUsername}` : shortWallet(holder.wallet)}</strong><small className="font-mono text-[#77715d]">{shortWallet(holder.wallet)}</small></span><span className="font-mono">{holder.uiBalance.toLocaleString()}</span><span className="font-black text-[#fff8d9]">{score?.score ?? "—"}</span><span className="text-xs text-[#bdb69a]">{score?.badges.join(" / ") ?? "No score"}</span></Link>;
          })}
        </section>
        </section>
      )}
      </div>
    </main>
  );
}
