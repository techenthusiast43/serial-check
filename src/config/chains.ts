import { defineChain } from 'viem';

/**
 * BOT Chain Testnet (Bohr Testnet)
 * Chain ID: 968
 * RPC: https://rpc.bohr.life
 * Native Token: BOT
 * Total Supply: 150 Million
 * Explorer: https://scan.bohr.life/
 */
export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BohrScan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

/**
 * BOT Chain Mainnet
 * Chain ID: 677
 * RPC: https://rpc.botchain.ai
 * Native Token: BOT
 * Explorer: https://scan.botchain.ai
 */
export const botChainMainnet = defineChain({
  id: 677,
  name: 'BOT Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'],
    },
    public: {
      http: ['https://rpc.botchain.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOTScan',
      url: 'https://scan.botchain.ai',
    },
  },
  testnet: false,
});

