
import React from 'react';
import { UserIcon, BuildingIcon } from './Icons';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelect: (role: 'tenant' | 'landlord') => void;
  walletAddress: string | null;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onSelect, walletAddress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-4xl animate-in zoom-in-95 duration-500 space-y-8 text-center">
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-900/30 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            Connected: {walletAddress?.slice(0,6)}...{walletAddress?.slice(-4)}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Who are you looking for?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Select your role to access the appropriate dashboard. Your privacy is protected in both modes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Tenant Option */}
          <button 
            onClick={() => onSelect('tenant')}
            className="group relative p-8 glass rounded-[40px] border border-white/5 hover:border-cyan-400/50 text-left transition-all duration-300 hover:bg-slate-800/50 hover:scale-[1.02] flex flex-col gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors border border-cyan-500/20">
              <UserIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">I'm a Tenant</h3>
              <p className="text-slate-400 leading-relaxed">
                Create your encrypted financial profile, browse verified listings, and apply with zero-knowledge proof eligibility checks.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-cyan-400 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
              Enter Tenant Portal &rarr;
            </div>
          </button>

          {/* Landlord Option */}
          <button 
            onClick={() => onSelect('landlord')}
            className="group relative p-8 glass rounded-[40px] border border-white/5 hover:border-indigo-500/50 text-left transition-all duration-300 hover:bg-slate-800/50 hover:scale-[1.02] flex flex-col gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center group-hover:bg-indigo-600/20 transition-colors border border-indigo-500/20">
              <BuildingIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">I'm a Landlord</h3>
              <p className="text-slate-400 leading-relaxed">
                List properties with encrypted requirements, review anonymized applicants, and verify eligibility without seeing raw data.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center text-indigo-400 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
              Enter Landlord Portal &rarr;
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoleSelectionModal;
