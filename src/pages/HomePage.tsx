import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { HashPreview } from '../components/HashPreview';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { hashSerialNumber } from '../utils/hash';

interface HomePageProps {
  onNavigate: (page: 'home' | 'register' | 'verify' | 'my-products', initialSerial?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [quickSerial, setQuickSerial] = useState('');
  const [previewHash, setPreviewHash] = useState<`0x${string}` | null>(null);

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickSerial(val);
    if (val.trim()) {
      try {
        setPreviewHash(hashSerialNumber(val));
      } catch {
        setPreviewHash(null);
      }
    } else {
      setPreviewHash(null);
    }
  };

  const handleQuickCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSerial.trim()) {
      onNavigate('verify', quickSerial.trim());
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decentralized Serial Registry on BOT Chain</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Verify Product Authenticity with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
            Cryptographic Certainty
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          SerialCheck empowers manufacturers, brands, and buyers to register and audit product serial numbers on the BOT Chain blockchain. Plaintext serials never leave your device.
        </p>

        {/* Quick Search Bar */}
        <div className="max-w-2xl mx-auto pt-4">
          <form
            onSubmit={handleQuickCheck}
            className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5 focus-within:border-indigo-500 transition-all"
          >
            <div className="relative flex-grow flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={quickSerial}
                onChange={handleSerialChange}
                placeholder="Enter serial number (e.g. SN-2026-X99)"
                className="w-full px-3 py-2.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!quickSerial.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Check Serial</span>
            </button>
          </form>

          {/* Real-time local hash preview */}
          {previewHash && (
            <div className="mt-3 text-left">
              <HashPreview serial={quickSerial} hash={previewHash} />
            </div>
          )}

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Product</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('verify')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Advanced Verification</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="max-w-2xl mx-auto pt-2">
          <DisclaimerBanner variant="warning" />
        </div>
      </section>

      {/* Value Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Client-Side Keccak-256 Hashing
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Plaintext serial numbers are hashed locally in your browser before broadcast. Only irreversible 32-byte cryptographic hashes are stored on BOT Chain.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Duplicate Registration Defense
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Smart contract constraints prevent duplicate registration of active or revoked serial hashes, guaranteeing each recorded unit has a unique on-chain footprint.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Owner Revocation Rights
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Registered brands can revoke stolen, recycled, or recalled serials at any time. Only the original registering wallet possesses on-chain revocation authority.
          </p>
        </div>
      </section>

      {/* Network Specifications Card */}
      <section className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 border border-indigo-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-800/40 pb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-1">
                Connected Infrastructure
              </div>
              <h2 className="text-2xl font-bold">BOT Chain Bohr Testnet</h2>
            </div>
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-medium transition-colors"
            >
              <span>Bohr Block Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">Chain ID</span>
              <span className="text-lg font-mono font-bold text-cyan-300">968</span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">Native Token</span>
              <span className="text-lg font-mono font-bold text-indigo-300">BOT</span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">Total Supply</span>
              <span className="text-lg font-mono font-bold text-white">150 Million</span>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-slate-400 block mb-1">RPC Endpoint</span>
              <span className="text-xs font-mono font-bold text-slate-300 truncate block">rpc.bohr.life</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

