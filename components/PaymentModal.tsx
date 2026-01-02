import React, { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { XIcon, ShieldLock, WalletIcon, CheckIcon, AlertCircle } from './Icons';
import { APP_CONFIG } from '../config';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  actionName: string;
  contract: Contract | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionName,
  contract
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStatus('idle');
        setTxHash(null);
        setErrorMessage('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (status === 'success' && txHash) {
      const timer = setTimeout(() => {
        onSuccess(txHash);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, txHash, onSuccess]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    // Ethers v6 uses `runner` property on Contract to access the Signer
    if (!contract || !contract.runner) {
      setErrorMessage("Wallet not connected properly.");
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    try {
      const signer = contract.runner as any; // Cast to any to access sendTransaction on the runner/signer
      // Ethers v6 syntax: parseEther
      const feeValue = ethers.parseEther(APP_CONFIG.TRANSACTION_FEE);

      const tx = await signer.sendTransaction({
        to: APP_CONFIG.DEVELOPER_WALLET,
        value: feeValue
      });

      await tx.wait(1);

      setTxHash(tx.hash);
      setStatus('success');

    } catch (err: any) {
      console.error("Payment failed:", err);
      setStatus('error');

      if (err.code === 'INSUFFICIENT_FUNDS') {
        setErrorMessage("Insufficient funds for fee + gas.");
      } else if (err.code === 'ACTION_REJECTED') {
        setErrorMessage("Transaction rejected by user.");
      } else {
        setErrorMessage(err.message || "Transaction failed.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md glass border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <WalletIcon className="w-6 h-6 text-indigo-400" />
              Confirm Transaction
            </h2>
            {status !== 'processing' && (
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <XIcon className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Action</span>
              <span className="text-white font-medium">{actionName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Network Fee</span>
              <span className="text-white font-medium">{APP_CONFIG.TRANSACTION_FEE} ETH</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-white/5">
              <span>+ Estimated Gas</span>
              <span>~0.00005 ETH</span>
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50">
                <CheckIcon className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Payment Successful!</h3>
                <a
                  href={`${APP_CONFIG.EXPLORER_URL}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:underline mt-1 block"
                >
                  View on Explorer ↗
                </a>
              </div>
              <p className="text-xs text-slate-400">Proceeding to action...</p>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Pay {APP_CONFIG.TRANSACTION_FEE} ETH & Continue
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-medium transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-300 font-medium animate-pulse">Processing Transaction...</p>
              <p className="text-xs text-slate-500">Please confirm in your wallet</p>
            </div>
          )}

          <div className="text-center text-[10px] text-slate-600 uppercase tracking-widest">
            Secured by Sepolia Blockchain
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;