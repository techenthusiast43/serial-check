import React, { useState } from 'react';
import { Copy, Check, Hash, Lock } from 'lucide-react';

interface HashPreviewProps {
  serial: string;
  hash: `0x${string}` | null;
  className?: string;
}

export const HashPreview: React.FC<HashPreviewProps> = ({ serial, hash, className = '' }) => {
  const [copied, setCopied] = useState(false);

  if (!serial || !hash) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-3.5 space-y-2 text-xs transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <Lock className="w-3.5 h-3.5" />
          Client-Side Keccak-256 Hash
        </span>
        <span className="text-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-mono">
          bytes32
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <code className="font-mono text-slate-800 dark:text-slate-200 truncate select-all">
            {hash}
          </code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
          title="Copy Hash"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
        Only this cryptographic hash is transmitted or searched on BOT Chain. The original serial number never leaves your browser.
      </div>
    </div>
  );
};

