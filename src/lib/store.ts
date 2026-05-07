import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { demoCreator, demoHolders, demoSocialIdentities, demoToken, isFallbackDemoMint } from "./demo-data";
import { scoreHolders } from "./scoring";
import type { Activation, Creator, Holder, PulseState, SocialIdentity, TokenProfile } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "pulse-state.json");

function now() {
  return new Date().toISOString();
}

function initialState(): PulseState {
  const seedDemoRows = isFallbackDemoMint(demoToken.mint);
  const holders = seedDemoRows ? demoHolders : [];
  return {
    creators: [demoCreator],
    tokens: [demoToken],
    holdersByToken: { [demoToken.mint]: holders },
    socialIdentities: seedDemoRows ? demoSocialIdentities : [],
    scoresByToken: { [demoToken.mint]: scoreHolders(holders, now()) },
    activations: [],
    updatedAt: now(),
  };
}

function ensureConfiguredToken(state: PulseState) {
  if (isFallbackDemoMint(demoToken.mint) || state.tokens.some((token) => token.mint === demoToken.mint)) {
    return { state, changed: false };
  }

  return {
    state: {
      ...state,
      creators: state.creators.some((creator) => creator.id === demoCreator.id) ? state.creators : [demoCreator, ...state.creators],
      tokens: [demoToken, ...state.tokens],
      holdersByToken: { ...state.holdersByToken, [demoToken.mint]: state.holdersByToken[demoToken.mint] ?? [] },
      scoresByToken: { ...state.scoresByToken, [demoToken.mint]: state.scoresByToken[demoToken.mint] ?? [] },
    },
    changed: true,
  };
}

export function readPulseState(): PulseState {
  mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STATE_FILE)) {
    const state = initialState();
    writePulseState(state);
    return state;
  }
  try {
    const { state, changed } = ensureConfiguredToken(JSON.parse(readFileSync(STATE_FILE, "utf8")) as PulseState);
    if (changed) writePulseState(state);
    return state;
  } catch {
    const state = initialState();
    writePulseState(state);
    return state;
  }
}

export function writePulseState(state: PulseState) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(STATE_FILE, `${JSON.stringify({ ...state, updatedAt: now() }, null, 2)}\n`);
}

export function upsertCreator(input: Partial<Creator> & { privyUserId?: string; wallet?: string }) {
  const state = readPulseState();
  const privyUserId = input.privyUserId ?? `demo:${input.wallet ?? "anonymous"}`;
  const existing = state.creators.find((creator) => creator.privyUserId === privyUserId || (input.wallet && creator.wallet === input.wallet));
  const creator: Creator = {
    id: existing?.id ?? `creator_${Date.now()}`,
    privyUserId,
    wallet: input.wallet ?? existing?.wallet,
    xUserId: input.xUserId ?? existing?.xUserId,
    xUsername: input.xUsername ?? existing?.xUsername,
    displayName: input.displayName ?? existing?.displayName,
    avatarUrl: input.avatarUrl ?? existing?.avatarUrl,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  state.creators = existing ? state.creators.map((item) => (item.id === existing.id ? creator : item)) : [creator, ...state.creators];
  writePulseState(state);
  return creator;
}

export function upsertToken(token: TokenProfile) {
  const state = readPulseState();
  const existing = state.tokens.find((item) => item.mint === token.mint);
  state.tokens = existing ? state.tokens.map((item) => (item.mint === token.mint ? { ...item, ...token } : item)) : [token, ...state.tokens];
  state.holdersByToken[token.mint] ??= [];
  state.scoresByToken[token.mint] ??= [];
  writePulseState(state);
  return token;
}

export function setTokenHolders(tokenMint: string, holders: Holder[]) {
  const state = readPulseState();
  const ranked = holders
    .slice()
    .sort((a, b) => b.uiBalance - a.uiBalance)
    .map((holder, index, all) => ({
      ...holder,
      balanceRank: index + 1,
      balancePercent: all.length <= 1 ? 100 : Math.round((1 - index / (all.length - 1)) * 100),
    }));
  state.holdersByToken[tokenMint] = ranked;
  state.scoresByToken[tokenMint] = scoreHolders(ranked, now());
  state.tokens = state.tokens.map((token) => (token.mint === tokenMint ? { ...token, lastHolderSyncAt: now() } : token));
  writePulseState(state);
  return ranked;
}

export function mergeSocialMatches(tokenMint: string, identities: SocialIdentity[]) {
  const state = readPulseState();
  const existingKey = (identity: SocialIdentity) => `${identity.provider}:${identity.username.toLowerCase()}`;
  const map = new Map(state.socialIdentities.map((identity) => [existingKey(identity), identity]));
  for (const identity of identities) map.set(existingKey(identity), identity);
  state.socialIdentities = Array.from(map.values());

  const byWallet = new Map(identities.map((identity) => [identity.wallet, identity]));
  const holders = (state.holdersByToken[tokenMint] ?? []).map((holder) => {
    const identity = byWallet.get(holder.wallet);
    return identity
      ? { ...holder, xUsername: identity.username, displayName: identity.displayName, avatarUrl: identity.avatarUrl }
      : holder;
  });
  state.holdersByToken[tokenMint] = holders;
  state.scoresByToken[tokenMint] = scoreHolders(holders, now());
  state.tokens = state.tokens.map((token) => (token.mint === tokenMint ? { ...token, lastSocialSyncAt: now() } : token));
  writePulseState(state);
  return { identities, holders };
}

export function recomputeTokenScores(tokenMint: string) {
  const state = readPulseState();
  const holders = state.holdersByToken[tokenMint] ?? [];
  const scores = scoreHolders(holders, now());
  state.scoresByToken[tokenMint] = scores;
  writePulseState(state);
  return scores;
}

export function addActivation(activation: Activation) {
  const state = readPulseState();
  state.activations = [activation, ...state.activations.filter((item) => item.id !== activation.id)];
  writePulseState(state);
  return activation;
}

export function confirmActivation(id: string, signatures: string[]) {
  const state = readPulseState();
  const activation = state.activations.find((item) => item.id === id);
  if (!activation) return null;
  const updated: Activation = { ...activation, status: "signed", signedSignatures: signatures, completedAt: now() };
  state.activations = state.activations.map((item) => (item.id === id ? updated : item));
  writePulseState(state);
  return updated;
}

export function resetDemoState() {
  const state = initialState();
  writePulseState(state);
  return state;
}
