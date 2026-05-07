export type BagsCreator = {
  wallet: string;
  provider?: string | null;
  providerUsername?: string | null;
  username?: string | null;
  twitterUsername?: string | null;
  bagsUsername?: string | null;
  pfp?: string | null;
  royaltyBps?: number | null;
  isCreator?: boolean;
  isAdmin?: boolean;
};

export type Creator = {
  id: string;
  privyUserId: string;
  wallet?: string;
  xUserId?: string;
  xUsername?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type TokenProfile = {
  id: string;
  creatorId?: string;
  mint: string;
  symbol: string;
  name: string;
  creatorWallet: string;
  adminWallet?: string;
  creatorWallets?: string[];
  adminWallets?: string[];
  creatorUsername?: string;
  creatorProvider?: string;
  creatorAvatarUrl?: string;
  verifiedAt?: string;
  access?: "admin" | "creator" | "view-only" | "demo-admin" | "view-only-demo";
  lastHolderSyncAt?: string;
  lastSocialSyncAt?: string;
  createdAt: string;
};

export type Holder = {
  wallet: string;
  tokenAccount?: string;
  uiBalance: number;
  balanceRank: number;
  balancePercent?: number;
  firstSeenAt: string;
  lastSeenAt: string;
  lastBuyAt?: string;
  lastSellAt?: string;
  buyCount: number;
  sellCount: number;
  totalBought: number;
  totalSold: number;
  xUsername?: string;
  displayName?: string;
  avatarUrl?: string;
};

export type SocialIdentity = {
  wallet: string;
  provider: "twitter" | string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  source: "bags" | "demo" | "x";
  lastCheckedAt: string;
};

export type TrueFanScore = {
  wallet: string;
  score: number;
  amountScore: number;
  durationScore: number;
  loyaltyScore: number;
  socialScore: number;
  activityScore: number;
  explanation: string[];
  badges: Badge[];
  updatedAt: string;
};

export type Badge = "Genesis Holder" | "Diamond Hands" | "True Believer";

export type ActivationPreview = {
  targetCount: number;
  creatorWallet: string;
  targetWallets: string[];
  claimersArray: string[];
  basisPointsArray: number[];
  creatorBps: number;
  holderPoolBps: number;
  holderBpsEach: number;
  warning?: string;
};

export type Activation = {
  id: string;
  tokenMint: string;
  creatorId?: string;
  activationType: "fee-share-bonus-window";
  status: "draft" | "created" | "signed" | "failed";
  targetCount: number;
  targetWallets: string[];
  claimersArray: string[];
  basisPointsArray: number[];
  bagsTransactions?: unknown;
  signedSignatures?: string[];
  previousConfig?: unknown;
  createdAt: string;
  completedAt?: string;
};

export type PulseState = {
  creators: Creator[];
  tokens: TokenProfile[];
  holdersByToken: Record<string, Holder[]>;
  socialIdentities: SocialIdentity[];
  scoresByToken: Record<string, TrueFanScore[]>;
  activations: Activation[];
  updatedAt: string;
};
