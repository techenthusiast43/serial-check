import { keccak256, toHex } from 'viem';

/**
 * Normalizes a serial number by trimming whitespace.
 * Preserves exact casing for strict manufacturer match.
 */
export function normalizeSerialNumber(serial: string): string {
  return serial.trim();
}

/**
 * Computes the Keccak-256 hash of a serial number string.
 * This is performed strictly client-side to ensure plaintext serial numbers
 * are NEVER broadcasted over the blockchain network.
 * 
 * @param serial Plaintext serial number
 * @returns bytes32 hex string starting with 0x
 */
export function hashSerialNumber(serial: string): `0x${string}` {
  const normalized = normalizeSerialNumber(serial);
  if (!normalized) {
    throw new Error('Serial number cannot be empty');
  }
  return keccak256(toHex(normalized));
}

/**
 * Verifies if a given string is a valid 32-byte hex hash (0x + 64 hex characters)
 */
export function isValidBytes32(hash: string): hash is `0x${string}` {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

