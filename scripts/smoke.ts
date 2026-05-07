const base = process.env.PULSE_BASE_URL ?? "http://127.0.0.1:3000";

async function post(path: string, body: unknown = {}) {
  const res = await fetch(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} failed: ${JSON.stringify(json)}`);
  return json;
}

async function get(path: string) {
  const res = await fetch(`${base}${path}`);
  const json = await res.json();
  if (!res.ok) throw new Error(`${path} failed: ${JSON.stringify(json)}`);
  return json;
}

async function main() {
  const mint = "PULSEDEMO111111111111111111111111111111BAGS";
  const holder = "Hldr9aKxTrueFanAlpha111111111111111111111";

  await post("/api/demo/reset");
  await post("/api/creator/upsert", { wallet: "Cr8tr9rQx4FhZ5QeV1mBagsCreatorWallet1111111", privyUserId: "smoke:test" });
  await post("/api/tokens/connect", { mint });
  await post(`/api/tokens/${mint}/sync-holders`);
  await post(`/api/tokens/${mint}/sync-social`, { maxFollowers: 20 });
  await post(`/api/tokens/${mint}/recompute-scores`);
  const activation = await post(`/api/tokens/${mint}/activation/create-txs`, { targetCount: 5, holderPoolBps: 1000 });
  if (!activation.activation?.id) throw new Error("activation id missing");
  await post(`/api/activations/${activation.activation.id}/confirm`, { signature: "DEMO_SIGNATURE_111" });
  const profile = await get(`/api/public/holders/${holder}`);
  if (!profile.score || profile.score.score < 80) throw new Error("profile score missing or too low");
  console.log(JSON.stringify({ ok: true, activationId: activation.activation.id, profileScore: profile.score.score }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
