
import React from 'react';

export const EncryptedDataFlow = () => {
  return (
    <div className="relative w-full max-w-2xl h-48 mx-auto flex items-center justify-between px-10">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500/20 -translate-y-1/2 -z-10"></div>
      {[...Array(5)].map((_, i) => (
        <div 
          key={i}
          className="absolute top-1/2 w-3 h-3 bg-cyan-400 rounded-sm shadow-[0_0_10px_#22d3ee] -translate-y-1/2 animate-flow"
          style={{ 
            animationDelay: `${i * 0.8}s`,
            animation: `flow 4s infinite linear ${i * 0.8}s`
          }}
        />
      ))}
      <style>{`
        @keyframes flow {
          0% { left: 10%; opacity: 0; transform: translateY(-50%) rotate(0deg); }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 90%; opacity: 0; transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
      <div className="flex flex-col items-center gap-2">
        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-indigo-400">👤</div>
        </div>
        <span className="text-xs text-slate-400 font-medium text-center">Tenant<br/>Profile</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="p-5 bg-indigo-900/40 rounded-full border border-indigo-500/50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-indigo-500/20 animate-pulse"></div>
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400 animate-spin-slow" viewBox="0 0 24 24" fill="none">
               <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="15 15" />
            </svg>
          </div>
        </div>
        <span className="text-xs text-indigo-300 font-bold">FHEVM Engine</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-indigo-400">🏠</div>
        </div>
        <span className="text-xs text-slate-400 font-medium text-center">Landlord<br/>Dashboard</span>
      </div>
    </div>
  );
};

export const MultiVariableCompute = ({ active = false }) => {
  const variables = ['Income', 'Seniority', 'Savings', 'Guarantor'];
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {variables.map((v, i) => (
        <div key={v} className={`p-2 rounded-lg border text-[10px] font-bold flex items-center justify-between transition-all duration-500 ${active ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-slate-900/50 border-white/5 text-slate-600'}`}>
          <span>{v}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'}`}></div>
        </div>
      ))}
    </div>
  );
};

export const EncryptionLock = ({ active = false }) => (
  <div className={`relative transition-all duration-700 ${active ? 'scale-110' : 'scale-100'}`}>
    <div className={`p-4 rounded-xl border transition-all duration-700 ${active ? 'bg-indigo-600/20 border-indigo-400 glow-indigo' : 'bg-slate-800 border-slate-700'}`}>
       <svg className={`w-8 h-8 ${active ? 'text-indigo-400' : 'text-slate-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
         <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
         <path d={active ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.9-1"} />
       </svg>
    </div>
    {active && (
      <div className="absolute -inset-1 rounded-xl border border-cyan-400/50 animate-ping opacity-30"></div>
    )}
  </div>
);
