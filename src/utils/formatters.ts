/**
 * Shortens an Ethereum address for display (e.g. 0x1234...5678)
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Shortens a 32-byte hash for display (e.g. 0xabcd...1234)
 */
export function shortenHash(hash: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length < chars * 2 + 2) return hash;
  return `${hash.substring(0, chars + 2)}...${hash.substring(hash.length - chars)}`;
}

/**
 * Formats a unix timestamp (in seconds) to a human-readable string
 */
export function formatTimestamp(timestamp: bigint | number): string {
  const tsNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  if (!tsNum || tsNum <= 0) return 'N/A';
  
  const date = new Date(tsNum * 1000);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Formats a unix timestamp to a concise date string
 */
export function formatDate(timestamp: bigint | number): string {
  const tsNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  if (!tsNum || tsNum <= 0) return 'N/A';
  
  const date = new Date(tsNum * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate explorer URL based on chain ID and type
 */
export function getExplorerUrl(
  type: 'tx' | 'address' | 'token',
  value: string,
  chainId: number = 968
): string {
  const baseUrl = chainId === 677 ? 'https://scan.botchain.ai' : 'https://scan.bohr.life';
  return `${baseUrl}/${type}/${value}`;
}

