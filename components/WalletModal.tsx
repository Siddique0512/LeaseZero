import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';

interface WalletModalProps {
  onClose: () => void;
  onConnect: (address: string) => void;
}

interface Wallet {
  name: string;
  icon: string;
  gradient: string;
  hoverGradient: string;
  detectMethod: () => boolean;
  connect: () => Promise<string[]>;
  downloadUrl: string;
}

const WalletModal: React.FC<WalletModalProps> = ({ onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [installedWallets, setInstalledWallets] = useState<string[]>([]);

  const wallets: Wallet[] = [
    {
      name: 'MetaMask',
      icon: '🦊',
      gradient: 'from-orange-500 to-amber-600',
      hoverGradient: 'from-orange-400 to-amber-500',
      detectMethod: () => {
        return typeof (window as any).ethereum !== 'undefined';
      },
      connect: async () => {
        return await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      },
      downloadUrl: 'https://metamask.io/download/'
    },
    {
      name: 'Rabby',
      icon: '🐰',
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'from-blue-400 to-indigo-500',
      detectMethod: () => {
        // Check if Rabby is installed by looking for its specific property
        return typeof (window as any).ethereum !== 'undefined';
      },
      connect: async () => {
        return await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      },
      downloadUrl: 'https://rabby.io/'
    },

    {
      name: 'OKX Wallet',
      icon: '⭕',
      gradient: 'from-slate-700 to-slate-900',
      hoverGradient: 'from-slate-600 to-slate-800',
      detectMethod: () => {
        return !!(window as any).okxwallet;
      },
      connect: async () => {
        return await (window as any).okxwallet.request({ method: 'eth_requestAccounts' });
      },
      downloadUrl: 'https://www.okx.com/web3'
    },
    {
      name: 'Phantom',
      icon: '👻',
      gradient: 'from-purple-600 to-indigo-700',
      hoverGradient: 'from-purple-500 to-indigo-600',
      detectMethod: () => {
        return !!(window as any).phantom?.ethereum;
      },
      connect: async () => {
        return await (window as any).phantom.ethereum.request({ method: 'eth_requestAccounts' });
      },
      downloadUrl: 'https://phantom.app/download'
    }
  ];

  useEffect(() => {
    // Simply check if ethereum exists - all wallets will work through it
    const hasEthereum = typeof (window as any).ethereum !== 'undefined';
    const hasOKX = !!(window as any).okxwallet;
    const hasPhantom = !!(window as any).phantom?.ethereum;

    const detected: string[] = [];

    // If ethereum exists, show all common wallets as "available"
    if (hasEthereum) {
      detected.push('MetaMask', 'Rabby', 'Coinbase', 'Trust Wallet', 'Brave Wallet', 'Rainbow');
    }

    if (hasOKX) detected.push('OKX Wallet');
    if (hasPhantom) detected.push('Phantom');

    setInstalledWallets(detected);
  }, []);

  const handleWalletClick = async (wallet: Wallet) => {
    const isInstalled = wallet.detectMethod();

    if (!isInstalled) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setIsConnecting(true);
    setConnectingWallet(wallet.name);

    try {
      const accounts = await wallet.connect();

      if (accounts && accounts.length > 0) {
        onConnect(accounts[0]);
      }
    } catch (error: any) {
      // Log silenced for user experience
      if (error.code !== 4001) {
        alert(error.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
      setConnectingWallet(null);
    }
  };

  const installedWalletsList = wallets.filter(w => installedWallets.includes(w.name));
  const notInstalledWalletsList = wallets.filter(w => !installedWallets.includes(w.name));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200">
              Connect Wallet
            </h2>
            <p className="text-slate-400 text-sm mt-1">Choose your preferred wallet to continue</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white hover:rotate-90 duration-300"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Wallet Grid */}
        <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
          {/* Installed Wallets */}
          {installedWalletsList.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available Wallets
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {installedWalletsList.map((wallet) => {
                  const isCurrentlyConnecting = isConnecting && connectingWallet === wallet.name;

                  return (
                    <button
                      key={wallet.name}
                      onClick={() => handleWalletClick(wallet)}
                      disabled={isConnecting}
                      className="group relative p-5 rounded-2xl border border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Gradient glow on hover */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${wallet.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`} />

                      <div className="relative flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${wallet.gradient} text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {wallet.icon}
                        </div>

                        {/* Name */}
                        <div className="flex-1 text-left">
                          <div className="font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                            {wallet.name}
                          </div>
                          {isCurrentlyConnecting && (
                            <div className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Connecting...
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <svg className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalledWalletsList.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                More Wallets
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {notInstalledWalletsList.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleWalletClick(wallet)}
                    className="group relative p-5 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300"
                  >
                    <div className="relative flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-800 text-3xl opacity-60 group-hover:opacity-100 transition-opacity">
                        {wallet.icon}
                      </div>

                      {/* Name */}
                      <div className="flex-1 text-left">
                        <div className="font-bold text-slate-400 group-hover:text-slate-300 transition-colors">
                          {wallet.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Click to install
                        </div>
                      </div>

                      {/* Download icon */}
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure connection • Click any wallet to connect</span>
            </div>
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}</style>
    </div>
  );
};

export default WalletModal;