# Pulse Frontend Approach

Owner branch: `frontend`

This branch is for frontend design work. Do not push directly to `main`; open a PR when ready. `main` requires PR + passing CI.

## Reference screens

Reference images live in `docs/frontend-reference/`:

1. `01_landing_page.png`
2. `02_connect_wallet_token.png`
3. `03_token_connect.png`
4. `04_dashboard_overview.png`
5. `05_holders_list.png`
6. `06_holder_detail_score_breakdown.png`
7. `07_activation_reward_flow.png`
8. `08_holder_public_profile.png`

Treat these as **flow, hierarchy, and density references**, not as final pixel-perfect styling. The current product already works; the frontend pass should improve clarity and demo quality without breaking API routes or wallet flows.

## Aesthetic direction

**Industrial Fan Ledger — proof-heavy creator ops, not decorative crypto UI — dark hard-edged pages with one violet/amber signal layer, dense ranked rows, and a clear launch/connect/reward path.**

Use the references for:

- page sequence
- sidebar/dashboard structure
- onboarding stepper shape
- holder table density
- score breakdown hierarchy
- activation wizard flow
- public profile hero layout

Avoid:

- generic glassmorphism everywhere
- purple gradient blobs as the main design idea
- crowded badge/pill soup
- decorative charts that do not support the demo
- hiding broken or unimplemented live states behind pretty mock data

## Required pages / surfaces

### 1. Landing page

Goal: explain Pulse in one screen.

Must communicate:

- Pulse maps Bags token holders to real social followers.
- Pulse ranks strongest believers.
- Pulse lets creators reward holders through Bags fee-share.

Primary CTA:

- `Connect your Bags token`

Secondary CTA:

- `See demo` or `Launch Pulse token on Bags`

Reference: `01_landing_page.png`

Implementation notes:

- Keep first viewport strong and clear.
- Do not overbuild marketing sections before the app flow is polished.

### 2. Connect / onboarding

Goal: make token setup feel safe and sequential.

Steps:

1. Sign in/connect wallet through Privy.
2. Enter Bags token mint or generate Bags launch intent.
3. Verify creator/admin context.

References:

- `02_connect_wallet_token.png`
- `03_token_connect.png`

Implementation notes:

- Current app has a combined console; it can be split into clearer sections or routes.
- Keep the no-token path visible: the creator can generate a Bags `/launch` intent and launch later.
- Show admin/view-only status plainly.

### 3. Creator dashboard overview

Goal: show that Pulse has imported and understood the community.

Must show:

- token identity
- total holders
- social matches
- top True Fan score
- activation status
- quick actions: sync holders, match social, recompute scores, preview reward

Reference: `04_dashboard_overview.png`

Implementation notes:

- Avoid fake analytics depth. One simple holder-growth block is okay, but the demo value is holder ranking + activation.
- Keep action buttons obvious.

### 4. Holders list

Goal: make the “discover → rank” part undeniable.

Must show:

- rank
- wallet / X handle
- balance
- days held
- True Fan Score
- badges
- filters: all, social matched, top 10, true believers, no sells

Reference: `05_holders_list.png`

Implementation notes:

- Table density is good. Preserve scannability.
- Scores should feel explainable, not magic.

### 5. Holder detail / score breakdown

Goal: explain why someone is a top fan.

Must show:

- holder identity
- rank
- final score
- score components: amount, duration, loyalty, social, activity
- badge reasons
- balance/history summary

Reference: `06_holder_detail_score_breakdown.png`

Implementation notes:

- Prefer horizontal bars over circular/radial progress if implementation time is short.
- The score explanation is more important than chart decoration.

### 6. Activation reward flow

Goal: prove Pulse can turn ranking into a Bags-native reward action.

Must show steps:

1. Select target group.
2. Configure bonus pool.
3. Review claimers/BPS.
4. Create Bags transaction.
5. Sign transaction.
6. Activation complete.

Reference: `07_activation_reward_flow.png`

Implementation notes:

- Live activation requires the connected wallet to be Bags creator/admin.
- Top 5 should be the default live path.
- Top 10/50 can be preview-only if lookup tables are not configured.
- Never imply instant payout; phrase as “fee-share bonus window.”

### 7. Public holder profile

Goal: create the share/distribution surface.

Must show:

- holder identity
- rank
- True Fan Score
- days held
- badges
- creator token card
- recent activations
- share CTA

Reference: `08_holder_public_profile.png`

Implementation notes:

- This screen is a demo asset. It should look shareable and high-status.
- Keep wallet/social identity privacy clear enough for a hackathon demo.

## Current technical constraints

Do not break these working pieces:

- Privy provider and Solana wallet hooks
- `/api/bags/launch-intent`
- `/api/tokens/connect`
- `/api/tokens/[tokenId]/sync-holders`
- `/api/tokens/[tokenId]/sync-social`
- `/api/tokens/[tokenId]/activation/create-txs`
- `/h/[wallet]`

Known limitations:

- X API currently returns `CreditsDepleted`; the UI should show demo-safe/fallback language instead of treating that as fatal.
- Live reward signing needs a real Bags token and admin wallet.
- Supabase schema exists, but persistence is still local JSON for the demo.

## Acceptance checklist for frontend PR

Before opening PR:

- [ ] Landing page first viewport is clear.
- [ ] Connect/token flow is understandable without explanation.
- [ ] No-token Bags launch-intent path is visible.
- [ ] Creator/admin vs view-only state is obvious.
- [ ] Holder table is readable on desktop and not broken on mobile.
- [ ] Score breakdown explains the score.
- [ ] Activation flow shows Bags fee-share BPS clearly.
- [ ] Public holder profile feels shareable.
- [ ] Empty/loading/error/fallback states are human-readable.
- [ ] `npm run lint` passes.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.

## PR rules

- Work on `frontend` or a branch off `frontend`.
- Open PR into `main` when ready.
- CI must pass.
- Do not commit `.env*`, `.next`, `node_modules`, or local data files.
