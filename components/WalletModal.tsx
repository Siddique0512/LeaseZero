import React from 'react';
import { XIcon } from './Icons';

interface WalletModalProps {
  onClose: () => void;
  onConnect: (address: string) => void;
}

const WALLETS = [
  { name: 'MetaMask', icon: '🦊', desc: 'Popular browser extension' },
  { name: 'WalletConnect', icon: '🔗', desc: 'Scan with mobile wallet' },
  { name: 'Coinbase Wallet', icon: '🔵', desc: 'Coinbase ecosystem' },
  { name: 'Rainbow', icon: '🌈', desc: 'Modern mobile wallet' },
];

const WalletModal: React.FC<WalletModalProps> = ({ onClose, onConnect }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md glass border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Connect Wallet</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-slate-400 text-sm">Choose your preferred wallet provider to access the LocaPrivé dApp on the Fhenix network.</p>

          <div className="grid gap-3">
            {WALLETS.map((w) => (
              <button
                key={w.name}
                onClick={() => onConnect('0x' + Math.random().toString(16).slice(2, 42).toUpperCase())}
                className="group flex items-center justify-between p-4 bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-700 hover:border-indigo-500/50 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-slate-900 rounded-xl text-2xl group-hover:scale-110 transition-transform">
                    {w.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-slate-200 group-hover:text-white">{w.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{w.desc}</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors"></div>
              </button>
            ))}
          </div>

          <p className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-widest pt-2">
            New to Crypto? <span className="text-indigo-400 underline cursor-pointer">Learn about wallets</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;