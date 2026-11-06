import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { botChainTestnet, botChainMainnet } from './chains';

// Project ID from Reown Cloud (or default fallback for development)
export const projectId =
  (import.meta.env.VITE_REOWN_PROJECT_ID as string) ||
  'b56e18d47c72ab683b10814fe9495694';

// App metadata
export const metadata = {
  name: 'SerialCheck',
  description: 'BOT Chain Product Serial Number Verification Registry',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://serialcheck.io',
  icons: ['https://scan.bohr.life/favicon.ico'],
};

// Wagmi Adapter with BOT Chain networks
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [botChainTestnet, botChainMainnet],
});

// Create the AppKit modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [botChainTestnet, botChainMainnet],
  defaultNetwork: botChainTestnet,
  metadata,
  projectId,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6366f1',
    '--w3m-border-radius-master': '8px',
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

