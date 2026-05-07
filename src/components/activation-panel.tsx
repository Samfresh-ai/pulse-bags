"use client";

import { useState } from "react";
import { useWallets, useSignTransaction } from "@privy-io/react-auth/solana";
import type { Activation, ActivationPreview, TokenProfile } from "@/lib/types";
import { uniqueWallets, walletsEqual } from "@/lib/wallets";

type TxResult = {
  mode: "demo" | "live" | "demo-fallback";
  status: string;
  note?: string;
  activation?: Activation;
  bagsRequest?: {
    baseMint: string;
    claimersArray: string[];
    basisPointsArray: number[];
    payer: string;
  };
  transactions?: Array<{ type?: string; serialized?: string; transaction?: string; signers?: string[]; blockhash?: unknown }>;
  result?: unknown;
};

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function shortWallet(wallet: string) {
  return `${wallet.slice(0, 5)}…${wallet.slice(-5)}`;
}

export function ActivationPanel({ token, activation }: { token: TokenProfile; activation: ActivationPreview }) {
  const [result, setResult] = useState<TxResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "signing" | "signed" | "error">("idle");
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const solanaWallet = wallets[0];
  const authorityWallets = uniqueWallets([...(token.adminWallets ?? []), token.adminWallet, ...(token.creatorWallets ?? []), token.creatorWallet]);
  const isDemoAuthority = token.access === "demo-admin" || token.access === "view-only-demo";
  const connectedWalletIsAuthority = authorityWallets.some((wallet) => walletsEqual(wallet, solanaWallet?.address));
  const canCreateTransaction = isDemoAuthority || connectedWalletIsAuthority;

  async function createTx() {
    setStatus("loading");
    setResult(null);
    try {
      const response = await fetch(`/api/tokens/${encodeURIComponent(token.mint)}/activation/create-txs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetCount: activation.targetCount, holderPoolBps: 1000, payer: solanaWallet?.address }),
      });
      const json = (await response.json()) as TxResult;
      if (!response.ok) throw new Error(JSON.stringify(json));
      setResult(json);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setResult({ mode: "demo", status: "error", note: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  async function signLiveTransaction() {
    if (!result?.activation?.id) throw new Error("Create an activation first");
    const serialized = result.transactions?.[0]?.serialized ?? result.transactions?.[0]?.transaction;
    if (!serialized) {
      setStatus("error");
      setResult({ ...result, note: "No serialized transaction found in Bags response." });
      return;
    }
    if (!solanaWallet) {
      setStatus("error");
      setResult({ ...result, note: "Connect a Solana wallet with Privy before signing." });
      return;
    }
    if (serialized.startsWith("DEMO_")) {
      setStatus("error");
      setResult({ ...result, note: "Demo placeholder cannot be signed. Use live BAGS_API_KEY response." });
      return;
    }

    try {
      setStatus("signing");
      const signed = await signTransaction({ transaction: decodeBase64(serialized), wallet: solanaWallet });
      const signatureMarker = `signed_tx_bytes_${signed.signedTransaction.length}`;
      await fetch(`/api/activations/${result.activation.id}/confirm`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signature: signatureMarker }),
      });
      setStatus("signed");
      setResult({ ...result, status: "signed", note: `Signed transaction captured: ${signatureMarker}` });
    } catch (error) {
      setStatus("error");
      setResult({ ...result, note: error instanceof Error ? error.message : "Signing failed" });
    }
  }

  return (
    <aside className="border border-[#4a3b1b] bg-[#171207] p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-[#f1c94b]">Activation preview</p>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">Reward top {activation.targetCount}</h2>
      <p className="mt-3 text-sm leading-6 text-[#bdb69a]">
        Live demo keeps the fee-share update small: {activation.creatorBps / 100}% creator, {activation.holderBpsEach / 100}% per top holder.
      </p>
      <div className="mt-5 border border-[#332b18] bg-[#0d0b07] p-3 text-xs leading-5 text-[#bdb69a]">
        <p className="uppercase tracking-[0.18em] text-[#77715d]">Bags admin wallet</p>
        <p className="mt-2 break-all font-mono text-[#d8d0aa]">{authorityWallets[0] ?? "Connect token to verify admin"}</p>
        <p className={connectedWalletIsAuthority || isDemoAuthority ? "mt-2 text-[#89d185]" : "mt-2 text-[#ff9f6e]"}>
          {isDemoAuthority ? "Demo authority enabled" : connectedWalletIsAuthority ? "Connected wallet can create the Bags admin update" : "Connect the Bags creator/admin wallet before live activation"}
        </p>
      </div>
      <div className="mt-6 space-y-2 font-mono text-xs text-[#d8d0aa]">
        {activation.claimersArray.map((claimer, index) => (
          <div key={claimer} className="flex items-center justify-between border border-[#332b18] bg-[#0d0b07] px-3 py-3">
            <span>{index === 0 ? "creator" : `holder ${index}`}</span>
            <span>{activation.basisPointsArray[index]} bps</span>
          </div>
        ))}
      </div>
      <button onClick={createTx} disabled={!canCreateTransaction || status === "loading" || status === "signing"} className="mt-6 w-full border border-[#f1c94b] bg-[#f1c94b] px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#131007] disabled:opacity-60">
        {status === "loading" ? "Creating transaction…" : "Create Bags transaction"}
      </button>
      <button onClick={signLiveTransaction} disabled={!result || status === "signing"} className="mt-3 w-full border border-[#f1c94b] px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#f1c94b] disabled:opacity-40">
        {status === "signing" ? "Signing…" : "Sign with Privy wallet"}
      </button>
      <p className="mt-3 text-xs leading-5 text-[#8d886f]">Wallet: {solanaWallet?.address ? shortWallet(solanaWallet.address) : "connect through Privy"}. Live activation requires the Bags creator/admin wallet.</p>
      {result && (
        <div className="mt-5 border border-[#332b18] bg-[#0b0a08] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#f1c94b]">{result.mode} transaction result</p>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#d8d0aa]">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </aside>
  );
}
