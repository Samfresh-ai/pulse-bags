import test from "node:test";
import assert from "node:assert/strict";
import { computeTrueFanScore, scoreHolders } from "../src/lib/scoring";
import { demoHolders } from "../src/lib/demo-data";

test("True Fan Score weighting stays deterministic", () => {
  assert.equal(computeTrueFanScore({ amountScore: 100, durationScore: 100, loyaltyScore: 100, socialScore: 100, activityScore: 100 }), 100);
  assert.equal(computeTrueFanScore({ amountScore: 0, durationScore: 0, loyaltyScore: 0, socialScore: 0, activityScore: 0 }), 0);
  assert.equal(computeTrueFanScore({ amountScore: 100, durationScore: 0, loyaltyScore: 0, socialScore: 0, activityScore: 0 }), 35);
});

test("demo holder scores include badges and explanations", () => {
  const scores = scoreHolders(demoHolders, "2026-05-07T00:00:00.000Z");
  const top = scores[0];
  assert.equal(top.wallet, demoHolders[0].wallet);
  assert.ok(top.score >= 85);
  assert.ok(top.badges.includes("Genesis Holder"));
  assert.ok(top.badges.includes("Diamond Hands"));
  assert.ok(top.badges.includes("True Believer"));
  assert.ok(top.explanation.some((line) => line.includes("Matched to @")));
});
