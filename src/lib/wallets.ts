export function cleanWallet(value?: string | null) {
  const wallet = value?.trim();
  return wallet || undefined;
}

export function walletsEqual(a?: string | null, b?: string | null) {
  const left = cleanWallet(a);
  const right = cleanWallet(b);
  return Boolean(left && right && left === right);
}

export function uniqueWallets(wallets: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const wallet of wallets) {
    const cleaned = cleanWallet(wallet);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    result.push(cleaned);
  }
  return result;
}

export function isLikelySolanaPubkey(value?: string | null) {
  return Boolean(cleanWallet(value)?.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/));
}
