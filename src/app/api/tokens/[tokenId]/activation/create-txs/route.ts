import { NextResponse } from "next/server";
import { assertValidActivation } from "@/lib/activation";
import { createFeeShareAdminUpdateConfig } from "@/lib/bags";
import { isFallbackDemoMint } from "@/lib/demo-data";
import { getActivation, makeDemoTransaction } from "@/lib/pulse-state";
import { addActivation, readPulseState } from "@/lib/store";
import type { Activation } from "@/lib/types";
import { cleanWallet, uniqueWallets, walletsEqual } from "@/lib/wallets";

function extractBagsTransactions(result: unknown) {
  if (!result || typeof result !== "object") return [];
  if ("transactions" in result && Array.isArray((result as { transactions?: unknown[] }).transactions)) {
    return (result as { transactions: unknown[] }).transactions;
  }
  if ("response" in result) return extractBagsTransactions((result as { response?: unknown }).response);
  return [];
}

export async function POST(request: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  const body = await request.json().catch(() => ({}));
  const targetCount = Number(body.targetCount ?? 5);
  const holderPoolBps = Number(body.holderPoolBps ?? 1000);
  const activationPreview = getActivation(targetCount, holderPoolBps, tokenId);
  assertValidActivation(activationPreview);
  if (activationPreview.targetWallets.length === 0) {
    return NextResponse.json({ error: "No eligible holder wallets found. Sync holders before creating a Bags fee-share activation.", tokenId }, { status: 400 });
  }
  const payer = cleanWallet(typeof body.payer === "string" ? body.payer : undefined);
  const id = `act_${Date.now()}`;

  function demoTransactionResponse(mode: "demo" | "demo-fallback", warning?: string) {
    const tx = makeDemoTransaction(tokenId, targetCount, holderPoolBps);
    const activation: Activation = addActivation({
      id,
      tokenMint: tokenId,
      activationType: "fee-share-bonus-window",
      status: "created",
      targetCount: activationPreview.targetCount,
      targetWallets: activationPreview.targetWallets,
      claimersArray: activationPreview.claimersArray,
      basisPointsArray: activationPreview.basisPointsArray,
      bagsTransactions: tx.transactions,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ ...tx, tokenId, mode, warning, activation });
  }

  if (!process.env.BAGS_API_KEY || isFallbackDemoMint(tokenId) || body.mode === "demo") return demoTransactionResponse("demo");

  const state = readPulseState();
  const token = state.tokens.find((item) => item.mint === tokenId);
  if (!token) {
    return NextResponse.json({ error: "Connect and verify this Bags token before creating a live activation transaction.", tokenId }, { status: 404 });
  }
  const authorityWallets = uniqueWallets([...(token?.adminWallets ?? []), token?.adminWallet, ...(token?.creatorWallets ?? []), token?.creatorWallet]);
  if (!payer) {
    return NextResponse.json(
      { error: "A connected Bags creator/admin wallet is required as payer before creating a live admin update transaction.", tokenId, requiredWallets: authorityWallets },
      { status: 400 },
    );
  }
  if (!authorityWallets.some((wallet) => walletsEqual(wallet, payer))) {
    return NextResponse.json(
      { error: "Connected wallet is not a Bags creator/admin wallet for this token.", tokenId, payer, requiredWallets: authorityWallets },
      { status: 403 },
    );
  }
  if (activationPreview.claimersArray.length > 7 && !Array.isArray(body.additionalLookupTables)) {
    return NextResponse.json(
      { error: "Bags requires additional lookup tables when more than 7 fee claimers are included. Use top 5 for the live demo.", tokenId, claimers: activationPreview.claimersArray.length },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await createFeeShareAdminUpdateConfig({
      baseMint: tokenId,
      claimersArray: activationPreview.claimersArray,
      basisPointsArray: activationPreview.basisPointsArray,
      payer,
      additionalLookupTables: Array.isArray(body.additionalLookupTables) ? body.additionalLookupTables : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown Bags fee-share error";
    return NextResponse.json(
      {
        error: `Bags fee-share transaction creation failed: ${message}`,
        tokenId,
        bagsRequest: { baseMint: tokenId, claimersArray: activationPreview.claimersArray, basisPointsArray: activationPreview.basisPointsArray, payer },
      },
      { status: 502 },
    );
  }
  const transactions = extractBagsTransactions(result);
  const activation: Activation = addActivation({
    id,
    tokenMint: tokenId,
    activationType: "fee-share-bonus-window",
    status: "created",
    targetCount: activationPreview.targetCount,
    targetWallets: activationPreview.targetWallets,
    claimersArray: activationPreview.claimersArray,
    basisPointsArray: activationPreview.basisPointsArray,
    bagsTransactions: transactions.length ? transactions : result,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    tokenId,
    mode: "live",
    status: "created",
    activation,
    bagsRequest: { baseMint: tokenId, claimersArray: activationPreview.claimersArray, basisPointsArray: activationPreview.basisPointsArray, payer },
    transactions,
    result,
  });
}
