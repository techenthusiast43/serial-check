export enum RegistrationStatus {
  Unregistered = 0,
  Registered = 1,
  Revoked = 2,
}

export interface ProductDetails {
  serialHash: `0x${string}`;
  productName: string;
  model: string;
  registrant: `0x${string}`;
  registeredAt: bigint;
  revokedAt: bigint;
  status: RegistrationStatus;
}

// Default contract address on BOT Chain Testnet (Chain ID 968)
// Can be overridden by VITE_CONTRACT_ADDRESS environment variable
export const DEFAULT_CONTRACT_ADDRESS: `0x${string}` =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x9683557CF4218B24F29F032E6BfE8395D7111E5b';

export const SERIAL_CHECK_ABI = [
  {
    type: 'function',
    name: 'registerProduct',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'serialHash', type: 'bytes32' },
      { name: 'productName', type: 'string' },
      { name: 'model', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'checkSerial',
    stateMutability: 'view',
    inputs: [{ name: 'serialHash', type: 'bytes32' }],
    outputs: [{ name: 'status', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'getProduct',
    stateMutability: 'view',
    inputs: [{ name: 'serialHash', type: 'bytes32' }],
    outputs: [
      { name: 'productName', type: 'string' },
      { name: 'model', type: 'string' },
      { name: 'registrant', type: 'address' },
      { name: 'registeredAt', type: 'uint64' },
      { name: 'revokedAt', type: 'uint64' },
      { name: 'status', type: 'uint8' },
    ],
  },
  {
    type: 'function',
    name: 'revokeProduct',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'serialHash', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getProductsByRegistrant',
    stateMutability: 'view',
    inputs: [{ name: 'registrant', type: 'address' }],
    outputs: [{ name: 'hashes', type: 'bytes32[]' }],
  },
  {
    type: 'event',
    name: 'ProductRegistered',
    inputs: [
      { name: 'serialHash', type: 'bytes32', indexed: true },
      { name: 'registrant', type: 'address', indexed: true },
      { name: 'productName', type: 'string', indexed: false },
      { name: 'model', type: 'string', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ProductRevoked',
    inputs: [
      { name: 'serialHash', type: 'bytes32', indexed: true },
      { name: 'registrant', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'error',
    name: 'InvalidSerialHash',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyProductName',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyModel',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyRegistered',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotRegistered',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyRevoked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotAuthorized',
    inputs: [],
  },
] as const;

