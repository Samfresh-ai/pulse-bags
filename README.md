# Pulse — Bags Fan CRM

Pulse is a Bags-native `discover → rank → reward` loop for the Bags hackathon.

A creator connects or launches a Bags token, Pulse imports the holder base, maps holders to social identities, computes a True Fan Score, and prepares a Bags fee-share bonus-window transaction for the strongest holders.

## Product loop

1. Creator signs in with Privy and connects a wallet.
2. Creator either enters an existing Bags token mint or generates a Bags `/launch` intent for a new Pulse token.
3. Pulse verifies creator/admin context through Bags token creator lookup.
4. Pulse imports token holders through Helius and ranks them by balance.
5. Pulse maps X followers to Bags fee-share wallets and joins those wallets against token holders.
6. Pulse computes explainable True Fan Scores and three badges.
7. Creator previews and creates a top-5 Bags fee-share admin update transaction.
8. Holder profile `/h/[wallet]` becomes public proof and distribution surface.

## Implemented

- Next.js App Router application
- Industrial Fan Ledger UI
- Privy login and wallet-aware creator session UI
- Local persisted demo state in `data/pulse-state.json`
- Creator upsert API
- Bags token connect API with creator/admin detection and demo fallback
- Bags launch-intent API for the no-token path
- Helius holder sync adapter with demo fallback
- X follower fetch adapter with demo-safe fallback when X credits/rate limits block live access
- Bags fee-share wallet bulk lookup adapter
- True Fan Score and badge engine
- Activation preview route
- Bags fee-share admin update transaction route using `/fee-share/admin/update-config`
- Live activation guard that refuses non-admin wallets
- Activation confirmation route
- Helius webhook ingestion route with signature/state update handling
- Public holder profile API and page
- Supabase schema draft in `supabase/schema.sql`
- Unit tests and workflow smoke script

## Environment

Demo mode works without keys. Live mode uses the following variables:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_ID=
BAGS_API_KEY=
HELIUS_API_KEY=
X_BEARER_TOKEN=
HELIUS_WEBHOOK_SECRET=
```

Optional X app credentials, kept server-side only if needed later:

```bash
X_API_KEY=
X_API_SECRET=
```

Optional Bags demo token/admin configuration after launching a real token:

```bash
PULSE_BAGS_TOKEN_MINT=
PULSE_BAGS_ADMIN_WALLET=
PULSE_BAGS_CREATOR_WALLET=
PULSE_BAGS_CREATOR_USERNAME=
PULSE_BAGS_TOKEN_SYMBOL=PULSE
PULSE_BAGS_TOKEN_NAME=Pulse Genesis
```

Optional Bags API override:

```bash
BAGS_BASE_URL=https://public-api-v2.bags.fm/api/v1
```

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run smoke # requires the app running on 127.0.0.1:3000
```

## API routes

- `POST /api/creator/upsert`
- `POST /api/bags/launch-intent`
- `POST /api/tokens/connect`
- `GET /api/tokens/[tokenId]/holders`
- `POST /api/tokens/[tokenId]/sync-holders`
- `POST /api/tokens/[tokenId]/sync-social`
- `POST /api/tokens/[tokenId]/recompute-scores`
- `POST /api/tokens/[tokenId]/activation/preview`
- `POST /api/tokens/[tokenId]/activation/create-txs`
- `POST /api/activations/[activationId]/confirm`
- `GET /api/public/holders/[wallet]`
- `POST /api/webhooks/helius`
- `POST /api/jobs/score-refresh`
- `POST /api/demo/reset`

## Demo status

The app is intentionally runnable without external services. With live keys present, unavailable services degrade safely instead of blocking the local demo. Current expected live limitations:

- X live follower lookup requires X API credits. Without credits, Pulse uses demo-safe follower handles.
- Live fee-share activation requires a real Bags token and the connected Privy wallet must match a Bags creator/admin wallet for that token.
- If no token exists yet, use the launch-intent flow to prefill Bags `/launch`, sign the launch manually in Bags, then paste the resulting mint back into Pulse.

## Production caveats

Before treating Pulse as production software, replace local JSON persistence with Supabase/Postgres, enforce server-side Privy token verification on API mutations, add monitoring/error reporting, deploy with managed environment variables, and connect CI for lint/test/build.
