import React from 'react';
import { Loader2, CheckCircle, XCircle, ExternalLink, X } from 'lucide-react';
import { getExplorerUrl } from '../utils/formatters';

export type TxStep = 'idle' | 'awaiting_signature' | 'confirming' | 'success' | 'error';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: TxStep;
  txHash?: string;
  errorMessage?: string;
  title?: string;
  successMessage?: string;
  chainId?: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  step,
  txHash,
  errorMessage,
  title = 'Processing Transaction',
  successMessage = 'Transaction completed successfully on BOT Chain!',
  chainId = 968,
}) => {
  if (!isOpen || step === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        {(step === 'success' || step === 'error') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center py-4">
          {/* Status Icons */}
          {step === 'awaiting_signature' && (
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
          )}

          {step === 'confirming' && (
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-spin" />
            </div>
          )}

          {step === 'success' && (
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          )}

          {step === 'error' && (
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
          )}

          {/* Titles & Descriptions */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {step === 'awaiting_signature' && (title || 'Confirm in Wallet')}
            {step === 'confirming' && 'Confirming on BOT Chain'}
            {step === 'success' && 'Transaction Confirmed!'}
            {step === 'error' && 'Transaction Failed'}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mb-4">
            {step === 'awaiting_signature' &&
              'Please check your connected wallet to approve the transaction.'}
            {step === 'confirming' &&
              'Broadcasting transaction to BOT Chain block producers. Awaiting confirmation...'}
            {step === 'success' && successMessage}
            {step === 'error' &&
              (errorMessage || 'An error occurred while executing the transaction. Please try again.')}
          </p>

          {/* Explorer Link */}
          {txHash && (
            <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 mb-4">
              <span className="text-xs text-slate-500 block mb-1">Transaction Hash</span>
              <a
                href={getExplorerUrl('tx', txHash, chainId)}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1.5 break-all"
              >
                <span>{txHash}</span>
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div className="w-full mt-2">
            {step === 'success' && (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
              >
                Close & View Details
              </button>
            )}

            {step === 'error' && (
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

