import React, { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import {
  Search,
  Calendar,
  User,
  Package,
  Layers,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { hashSerialNumber } from '../utils/hash';
import { HashPreview } from '../components/HashPreview';
import { StatusBadge } from '../components/StatusBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  DEFAULT_CONTRACT_ADDRESS,
  SERIAL_CHECK_ABI,
  RegistrationStatus,
  ProductDetails,
} from '../config/contracts';
import { shortenHash, formatTimestamp, getExplorerUrl } from '../utils/formatters';

interface VerifyPageProps {
  initialSerial?: string;
  onNavigate: (page: 'home' | 'register' | 'verify' | 'my-products') => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({ initialSerial = '', onNavigate }) => {
  const [inputSerial, setInputSerial] = useState(initialSerial);
  const [activeHash, setActiveHash] = useState<`0x${string}` | null>(null);
  const [hasQueried, setHasQueried] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  // Auto-hash and query if initialSerial provided
  useEffect(() => {
    if (initialSerial && initialSerial.trim()) {
      try {
        const computed = hashSerialNumber(initialSerial);
        setActiveHash(computed);
        setHasQueried(true);
      } catch {
        // ignore
      }
    }
  }, [initialSerial]);

  // Read status and product details from contract
  const {
    data: productData,
    isLoading,
    refetch,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: SERIAL_CHECK_ABI,
    functionName: 'getProduct',
    args: activeHash ? [activeHash] : undefined,
    query: {
      enabled: Boolean(activeHash && hasQueried),
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputSerial(val);
    setInputError(null);
    setHasQueried(false);
    if (val.trim()) {
      try {
        setActiveHash(hashSerialNumber(val));
      } catch {
        setActiveHash(null);
      }
    } else {
      setActiveHash(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const trimmed = inputSerial.trim();
    if (!trimmed) {
      setInputError('Please enter a serial number to verify.');
      return;
    }

    try {
      const computed = hashSerialNumber(trimmed);
      setActiveHash(computed);
      setHasQueried(true);
      refetch();
    } catch (err: any) {
      setInputError('Invalid serial number format.');
    }
  };

  // Extract returned tuple: [productName, model, registrant, registeredAt, revokedAt, status]
  const product: ProductDetails | null =
    productData && activeHash
      ? {
          serialHash: activeHash,
          productName: productData[0] as string,
          model: productData[1] as string,
          registrant: productData[2] as `0x${string}`,
          registeredAt: productData[3] as bigint,
          revokedAt: productData[4] as bigint,
          status: productData[5] as RegistrationStatus,
        }
      : null;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Search className="w-3.5 h-3.5" />
          <span>Product Verification Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Verify Serial on BOT Chain
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Audit the cryptographic state of any serial number. Query directly from the smart contract without exposing plaintext serial data.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Serial Number
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={inputSerial}
                onChange={handleInputChange}
                placeholder="Enter exact serial number (e.g. SN-8839-4491-002)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!inputSerial.trim() || isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Querying Ledger...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Serial</span>
                </>
              )}
            </button>
          </div>

          {inputError && (
            <div className="text-xs text-rose-500 font-medium">{inputError}</div>
          )}

          {activeHash && (
            <HashPreview serial={inputSerial} hash={activeHash} />
          )}
        </form>
      </div>

      {/* Query Result Section */}
      {hasQueried && !isLoading && product && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Status Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
              product.status === RegistrationStatus.Registered
                ? 'bg-emerald-500/5 border-emerald-500/30'
                : product.status === RegistrationStatus.Revoked
                ? 'bg-rose-500/5 border-rose-500/30'
                : 'bg-slate-500/5 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    product.status === RegistrationStatus.Registered
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : product.status === RegistrationStatus.Revoked
                      ? 'bg-rose-500/15 text-rose-500'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {product.status === RegistrationStatus.Registered && (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                  {product.status === RegistrationStatus.Revoked && (
                    <XCircle className="w-8 h-8" />
                  )}
                  {product.status === RegistrationStatus.Unregistered && (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                    Ledger Status
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <StatusBadge status={product.status} size="lg" />
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block mb-1">Network</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                  BOT Chain (Chain 968)
                </span>
              </div>
            </div>

            {/* If Registered or Revoked: Show Product Metadata */}
            {product.status !== RegistrationStatus.Unregistered ? (
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Product Name */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Package className="w-3.5 h-3.5" />
                    Product Name
                  </span>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    {product.productName}
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5" />
                    Model
                  </span>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-white">
                    {product.model}
                  </div>
                </div>

                {/* Registration Date */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Registered On
                  </span>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {formatTimestamp(product.registeredAt)}
                  </div>
                </div>

                {/* Registrant Wallet */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5" />
                    Registering Wallet Address
                  </span>
                  <a
                    href={getExplorerUrl('address', product.registrant, 968)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-mono text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                  >
                    <span>{product.registrant}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                </div>

                {/* Revocation Date (if revoked) */}
                {product.status === RegistrationStatus.Revoked && (
                  <div className="space-y-1 sm:col-span-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      Revocation Recorded At
                    </span>
                    <div className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                      {formatTimestamp(product.revokedAt)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If Unregistered */
              <div className="pt-6 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  No record was found on the BOT Chain ledger matching this serial number's Keccak-256 hash (<code className="font-mono text-xs">{shortenHash(product.serialHash)}</code>).
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors shadow-md shadow-indigo-500/20"
                  >
                    Register This Product Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Educational Disclaimer */}
          <DisclaimerBanner variant="warning" />
        </div>
      )}
    </div>
  );
};

