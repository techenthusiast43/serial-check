import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { PlusCircle, Wallet, ShieldAlert } from 'lucide-react';
import { hashSerialNumber } from '../utils/hash';
import { HashPreview } from '../components/HashPreview';
import { TransactionModal, TxStep } from '../components/TransactionModal';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { DEFAULT_CONTRACT_ADDRESS, SERIAL_CHECK_ABI } from '../config/contracts';
import { botChainTestnet, botChainMainnet } from '../config/chains';

interface RegisterPageProps {
  onNavigate: (page: 'home' | 'register' | 'verify' | 'my-products', initialSerial?: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { open } = useAppKit();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [productName, setProductName] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [clientHash, setClientHash] = useState<`0x${string}` | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Transaction state
  const [modalOpen, setModalOpen] = useState(false);
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [customError, setCustomError] = useState<string | null>(null);

  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isSupportedChain = chainId === botChainTestnet.id || chainId === botChainMainnet.id;

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSerialNumber(val);
    setValidationError(null);
    if (val.trim()) {
      try {
        const computed = hashSerialNumber(val);
        setClientHash(computed);
      } catch {
        setClientHash(null);
      }
    } else {
      setClientHash(null);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setCustomError(null);

    if (!isConnected) {
      open();
      return;
    }

    if (!isSupportedChain) {
      switchChain?.({ chainId: botChainTestnet.id });
      return;
    }

    const trimmedName = productName.trim();
    const trimmedModel = model.trim();
    const trimmedSerial = serialNumber.trim();

    if (!trimmedName) {
      setValidationError('Please enter a valid product name.');
      return;
    }

    if (!trimmedModel) {
      setValidationError('Please enter a product model.');
      return;
    }

    if (!trimmedSerial) {
      setValidationError('Please enter a product serial number.');
      return;
    }

    try {
      const serialHash = hashSerialNumber(trimmedSerial);
      setModalOpen(true);
      setTxStep('awaiting_signature');

      await writeContractAsync({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: SERIAL_CHECK_ABI,
        functionName: 'registerProduct',
        args: [serialHash, trimmedName, trimmedModel],
      });

      setTxStep('confirming');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setTxStep('error');
      
      const errorMsg = err?.message || '';
      if (errorMsg.includes('AlreadyRegistered')) {
        setCustomError('This serial number has already been registered or revoked on BOT Chain. Duplicate registrations are strictly forbidden.');
      } else if (errorMsg.includes('User rejected') || errorMsg.includes('denied')) {
        setCustomError('Transaction was canceled in your wallet.');
      } else {
        setCustomError(err?.shortMessage || err?.message || 'Transaction submission failed.');
      }
    }
  };

  // Sync confirmation status
  React.useEffect(() => {
    if (isConfirming) {
      setTxStep('confirming');
    }
    if (isConfirmed) {
      setTxStep('success');
    }
  }, [isConfirming, isConfirmed]);

  const handleResetForm = () => {
    setProductName('');
    setModel('');
    setSerialNumber('');
    setClientHash(null);
    setTxStep('idle');
    setModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Product Registration Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Register New Product Serial
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Record your product serial hash permanently on the BOT Chain ledger. The original serial number is hashed in your browser and never disclosed on-chain.
        </p>
      </div>

      {/* Network / Wallet Warning if disconnected */}
      {!isConnected && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Wallet Not Connected
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                Connect your Web3 wallet to sign and broadcast the registration on BOT Chain.
              </div>
            </div>
          </div>
          <button
            onClick={() => open()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        </div>
      )}

      {isConnected && !isSupportedChain && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                Unsupported Network
              </div>
              <div className="text-xs text-rose-700 dark:text-rose-300">
                Please switch your wallet to BOT Chain Bohr Testnet (Chain ID 968).
              </div>
            </div>
          </div>
          <button
            onClick={() => switchChain?.({ chainId: botChainTestnet.id })}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors flex-shrink-0"
          >
            Switch to Bohr (968)
          </button>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Apex Drone Pro Max"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Product Model *
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. DRONE-X9-2026"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm"
            />
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Physical Serial Number *
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={handleSerialChange}
              placeholder="e.g. SN-8839-4491-002"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-mono"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              Case-sensitive. Leading and trailing spaces are automatically trimmed.
            </span>
          </div>

          {/* Real-time Hash Preview */}
          <HashPreview serial={serialNumber} hash={clientHash} />

          {/* Validation message */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {validationError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!productName || !model || !serialNumber}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Submit Registration to BOT Chain</span>
          </button>
        </form>

        <DisclaimerBanner variant="info" />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (txStep === 'success') {
            handleResetForm();
            onNavigate('my-products');
          }
        }}
        step={txStep}
        txHash={txHash}
        errorMessage={customError || undefined}
        successMessage={`Product "${productName}" has been successfully recorded on BOT Chain Bohr Testnet!`}
        chainId={chainId}
      />
    </div>
  );
};

