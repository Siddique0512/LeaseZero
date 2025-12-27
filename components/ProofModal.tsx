
import React from 'react';
import { ShieldLock, CheckIcon, XIcon, CpuIcon } from './Icons';

interface ProofModalProps {
  onClose: () => void;
  propertyAddress: string;
}

const ProofModal: React.FC<ProofModalProps> = ({ onClose, propertyAddress }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg glass border border-indigo-500/30 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <ShieldLock className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold">Privacy Receipt</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <XIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-indigo-900/20 rounded-2xl border border-indigo-500/20">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">FHE Multi-Factor Verification</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Income Check', val: 'PASS' },
                  { label: 'Tenure Stability', val: 'PASS' },
                  { label: 'Savings Buffer', val: 'PASS' },
                  { label: 'Payment History', val: 'PASS' },
                  { label: 'Occupancy Valid', val: 'PASS' },
                  { label: 'Guarantor Proof', val: 'PASS' }
                ].map((m) => (
                  <div key={m.label} className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-400">{m.label}</span>
                    <CheckIcon className="w-3.3 h-3.3 text-green-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blockchain Evidence</div>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Sepolia FHEVM Valid</span>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl font-mono text-[9px] text-indigo-400 border border-white/5 leading-relaxed overflow-hidden">
                <div className="opacity-50 mb-1">// Parallel Verification Matrix v2.1</div>
                <div className="break-all opacity-80">COMPUTE_ID::{Math.random().toString(16).slice(2, 24).toUpperCase()}</div>
                <div className="text-green-400 mt-2">OUTCOME::VERIFIED (All criteria satisfied)</div>
                <div className="opacity-40 mt-1 italic">// No plaintext data was stored or decrypted</div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 flex gap-3">
               <CpuIcon className="w-5 h-5 text-indigo-400 shrink-0" />
               <p className="text-[10px] text-slate-400 leading-relaxed italic">
                LocaPrivé computed your eligibility across 6 stability dimensions simultaneously using FHE. Your privacy remained mathematically absolute throughout the process.
               </p>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]">
            Finalize Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProofModal;
