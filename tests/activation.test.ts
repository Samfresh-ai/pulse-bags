import test from "node:test";
import assert from "node:assert/strict";
import { buildActivationPreview, assertValidActivation } from "../src/lib/activation";
import { demoHolders, demoToken } from "../src/lib/demo-data";

test("activation preview creates Bags-compatible BPS split", () => {
  const preview = buildActivationPreview({ holders: demoHolders, creatorWallet: demoToken.creatorWallet, targetCount: 5, holderPoolBps: 1000 });
  assert.equal(preview.claimersArray.length, 6);
  assert.equal(preview.basisPointsArray.reduce((sum, bps) => sum + bps, 0), 10_000);
  assert.equal(preview.basisPointsArray[0], 9000);
  assert.equal(preview.basisPointsArray[1], 200);
  assertValidActivation(preview);
});

test("activation warns when live demo exceeds no-LUT claimer count", () => {
  const preview = buildActivationPreview({ holders: demoHolders, creatorWallet: demoToken.creatorWallet, targetCount: 8, holderPoolBps: 1000 });
  assert.match(preview.warning ?? "", /lookup tables/i);
});

test("activation never adds creator/admin wallet as a rewarded holder", () => {
  const preview = buildActivationPreview({
    holders: [{ ...demoHolders[0], wallet: demoToken.creatorWallet }, ...demoHolders.slice(1)],
    creatorWallet: demoToken.creatorWallet,
    targetCount: 5,
    holderPoolBps: 1000,
  });

  assert.equal(preview.claimersArray[0], demoToken.creatorWallet);
  assert.equal(new Set(preview.claimersArray).size, preview.claimersArray.length);
  assert.ok(!preview.targetWallets.includes(demoToken.creatorWallet));
  assertValidActivation(preview);
});
