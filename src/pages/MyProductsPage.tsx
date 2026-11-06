import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, usePublicClient } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import {
  FolderLock,
  Wallet,
  PlusCircle,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
  XCircle,
} from 'lucide-react';
import {
  DEFAULT_CONTRACT_ADDRESS,
  SERIAL_CHECK_ABI,
  RegistrationStatus,
  ProductDetails,
} from '../config/contracts';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionModal, TxStep } from '../components/TransactionModal';
import { shortenHash, shortenAddress, formatTimestamp, getExplorerUrl } from '../utils/formatters';

interface MyProductsPageProps {
  onNavigate: (page: 'home' | 'register' | 'verify' | 'my-products') => void;
}

export const MyProductsPage: React.FC<MyProductsPageProps> = ({ onNavigate }) => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const [products, setProducts] = useState<ProductDetails[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Revocation state
  const [revokingProduct, setRevokingProduct] = useState<ProductDetails | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [customError, setCustomError] = useState<string | null>(null);

  // Read list of serial hashes registered by connected wallet
  const {
    data: registeredHashes,
    isLoading: isLoadingHashes,
    refetch: refetchHashes,
  } = useReadContract({
    address: DEFAULT_CONTRACT_ADDRESS,
    abi: SERIAL_CHECK_ABI,
    functionName: 'getProductsByRegistrant',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(isConnected && address),
    },
  });

  const { writeContractAsync, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Fetch full details for each registered serial hash
  const fetchAllProductDetails = async (hashes: readonly `0x${string}`[]) => {
    if (!hashes || hashes.length === 0 || !publicClient) {
      setProducts([]);
      return;
    }

    setIsLoadingDetails(true);
    try {
      const detailsList: ProductDetails[] = [];
      for (const hash of hashes) {
        try {
          const result = await publicClient.readContract({
            address: DEFAULT_CONTRACT_ADDRESS,
            abi: SERIAL_CHECK_ABI,
            functionName: 'getProduct',
            args: [hash],
          });

          if (result) {
            detailsList.push({
              serialHash: hash,
              productName: result[0] as string,
              model: result[1] as string,
              registrant: result[2] as `0x${string}`,
              registeredAt: result[3] as bigint,
              revokedAt: result[4] as bigint,
              status: result[5] as RegistrationStatus,
            });
          }
        } catch (err) {
          console.error(`Failed to fetch product for hash ${hash}:`, err);
        }
      }
      // Sort newest first
      detailsList.sort((a, b) => Number(b.registeredAt - a.registeredAt));
      setProducts(detailsList);
    } catch (err) {
      console.error('Error fetching registered product details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (registeredHashes && Array.isArray(registeredHashes)) {
      fetchAllProductDetails(registeredHashes);
    } else {
      setProducts([]);
    }
  }, [registeredHashes]);

  // Sync revocation confirmation
  useEffect(() => {
    if (isConfirming) {
      setTxStep('confirming');
    }
    if (isConfirmed) {
      setTxStep('success');
      refetchHashes();
    }
  }, [isConfirming, isConfirmed]);

  const handleRevokeClick = (prod: ProductDetails) => {
    setRevokingProduct(prod);
    setShowConfirmModal(true);
  };

  const handleConfirmRevocation = async () => {
    if (!revokingProduct) return;
    setShowConfirmModal(false);
    setModalOpen(true);
    setTxStep('awaiting_signature');
    setCustomError(null);

    try {
      await writeContractAsync({
        address: DEFAULT_CONTRACT_ADDRESS,
        abi: SERIAL_CHECK_ABI,
        functionName: 'revokeProduct',
        args: [revokingProduct.serialHash],
      });
      setTxStep('confirming');
    } catch (err: any) {
      console.error('Revocation failed:', err);
      setTxStep('error');
      const msg = err?.shortMessage || err?.message || 'Failed to revoke product';
      if (msg.includes('NotAuthorized')) {
        setCustomError('Unauthorized: Only the registering wallet can revoke this product.');
      } else if (msg.includes('AlreadyRevoked')) {
        setCustomError('This serial registration has already been revoked.');
      } else {
        setCustomError(msg);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <FolderLock className="w-3.5 h-3.5" />
            <span>Registrant Portfolio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            My Registered Products
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your registered serial numbers and execute on-chain revocations if needed.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetchHashes()}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDetails || isLoadingHashes ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New</span>
            </button>
          </div>
        )}
      </div>

      {/* Disconnected State */}
      {!isConnected ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Connect Your Wallet
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please connect the wallet address you used to register products on BOT Chain to review your portfolio.
          </p>
          <button
            onClick={() => open()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Wallet</span>
          </button>
        </div>
      ) : isLoadingHashes || isLoadingDetails ? (
        /* Loading Skeleton */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl bg-slate-100 dark:bg-slate-900/60 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <FolderLock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No Registered Products Found
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Your connected address (<span className="font-mono text-xs text-indigo-500">{shortenAddress(address || '')}</span>) has not registered any serial numbers on this contract yet.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Your First Product</span>
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => {
            const isRegistered = prod.status === RegistrationStatus.Registered;
            return (
              <div
                key={prod.serialHash}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  {/* Card Header: Status & Explorer Link */}
                  <div className="flex items-center justify-between">
                    <StatusBadge status={prod.status} size="sm" />
                    <a
                      href={getExplorerUrl('address', DEFAULT_CONTRACT_ADDRESS, 968)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 font-mono"
                      title="View Contract"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Product Title & Model */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {prod.productName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>Model: {prod.model}</span>
                    </div>
                  </div>

                  {/* Serial Hash */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                      Serial Hash (Keccak-256)
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 break-all select-all">
                      {shortenHash(prod.serialHash, 10)}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Registered:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatTimestamp(prod.registeredAt)}
                      </span>
                    </div>
                    {prod.status === RegistrationStatus.Revoked && (
                      <div className="flex items-center justify-between text-rose-500">
                        <span>Revoked:</span>
                        <span className="font-medium">
                          {formatTimestamp(prod.revokedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  {isRegistered ? (
                    <button
                      onClick={() => handleRevokeClick(prod)}
                      className="w-full py-2 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Revoke Registration</span>
                    </button>
                  ) : (
                    <div className="text-center text-xs text-rose-500/80 font-medium py-1">
                      Registration Revoked
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Revocation */}
      {showConfirmModal && revokingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Revoke Registration?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You are about to permanently mark the serial registration for{' '}
                <strong className="text-slate-900 dark:text-white">
                  {revokingProduct.productName} ({revokingProduct.model})
                </strong>{' '}
                as <strong className="text-rose-500">Revoked</strong> on BOT Chain.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 break-all text-left">
                {revokingProduct.serialHash}
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Notice: Revocation is irreversible. Once revoked, this serial number can never be re-registered on this contract.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setRevokingProduct(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevocation}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-md shadow-rose-500/20"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Lifecycle Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setRevokingProduct(null);
        }}
        step={txStep}
        txHash={txHash}
        errorMessage={customError || undefined}
        successMessage={`Product "${revokingProduct?.productName}" has been successfully revoked on BOT Chain.`}
        chainId={chainId}
      />
    </div>
  );
};

