import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  variant?: 'info' | 'warning';
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  variant = 'info',
  className = '',
}) => {
  if (variant === 'warning') {
    return (
      <div
        className={`p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5 ${className}`}
      >
        <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Security Notice: </strong>
          Blockchain registration verifies that this serial hash was permanently recorded by the specified wallet.
          It does not guarantee physical product authenticity or eliminate risks of counterfeit labeling. Always verify the seller and inspect physical anti-tamper seals.
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5 ${className}`}
    >
      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <div>
        <strong className="font-semibold">Zero-Knowledge Serial Privacy: </strong>
        Plaintext serial numbers are never sent to the network. SerialCheck generates a local Keccak-256 cryptographic hash directly in your browser before querying or registering on BOT Chain.
      </div>
    </div>
  );
};

