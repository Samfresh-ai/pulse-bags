import assert from "node:assert/strict";
import { test } from "node:test";
import { buildBagsLaunchIntentUrl } from "../src/lib/bags-launch-intent";

test("Bags launch intent encodes Pulse token and fee sharing", () => {
  const url = new URL(buildBagsLaunchIntentUrl({ twitterUsername: "@Samfresh_", adminWallet: "11111111111111111111111111111111" }));
  assert.equal(url.origin, "https://bags.fm");
  assert.equal(url.pathname, "/launch");
  assert.equal(url.searchParams.get("intent"), "true");
  assert.equal(url.searchParams.get("ticker"), "PULSE");
  assert.equal(url.searchParams.get("feeShareEnabled"), "true");
  assert.equal(url.searchParams.get("admin"), "11111111111111111111111111111111");
  const feeShare = JSON.parse(url.searchParams.get("feeShare") || "[]");
  assert.deepEqual(feeShare, [{ allocationBps: 1000, platform: "twitter", username: "Samfresh_" }]);
});
