import React from 'react';
import { ShieldCheck, ExternalLink, Cpu, Globe } from 'lucide-react';
import { DEFAULT_CONTRACT_ADDRESS } from '../config/contracts';
import { shortenAddress, getExplorerUrl } from '../utils/formatters';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 mt-16 text-slate-500 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">SerialCheck</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Tamper-proof serial registration and verification ledger deployed on BOT Chain.
          </p>
          <div className="text-[11px] text-slate-400">
            Powered by Keccak-256 local client hashing.
          </div>
        </div>

        {/* Network Parameters */}
        <div className="space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            BOT Chain Networks
          </div>
          <ul className="space-y-1.5">
            <li className="flex items-center justify-between py-0.5">
              <span>Bohr Testnet:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">Chain ID 968</span>
            </li>
            <li className="flex items-center justify-between py-0.5">
              <span>Native Token:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">BOT (150M Supply)</span>
            </li>
            <li className="flex items-center justify-between py-0.5">
              <span>BOT Mainnet:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">Chain ID 677</span>
            </li>
          </ul>
        </div>

        {/* Explorers & Resources */}
        <div className="space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Resources
          </div>
          <ul className="space-y-1.5">
            <li>
              <a
                href="https://scan.bohr.life"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Bohr Testnet Explorer</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>BOT Mainnet Explorer</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
            <li>
              <a
                href="https://faucet.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>BOT Chain Faucet</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </li>
          </ul>
        </div>

        {/* Smart Contract info */}
        <div className="space-y-2">
          <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            Contract Registry
          </div>
          <div className="bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Testnet Registry Contract
            </span>
            <a
              href={getExplorerUrl('address', DEFAULT_CONTRACT_ADDRESS, 968)}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 break-all"
            >
              <span>{shortenAddress(DEFAULT_CONTRACT_ADDRESS, 6)}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
          <div className="text-[11px] text-slate-400 leading-normal">
            Direct on-chain read & writes via official RPC: <code className="font-mono text-[10px]">https://rpc.bohr.life</code>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
        <div>
          SerialCheck &copy; {new Date().getFullYear()} – Open Decentralized Serial Verification Ledger
        </div>
        <div className="text-slate-400">
          Security standard: Serial hashes are recorded immutably on BOT Chain.
        </div>
      </div>
    </footer>
  );
};

