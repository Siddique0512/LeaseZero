
import React from 'react';
import { UserIcon, BuildingIcon } from './Icons';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelect: (role: 'tenant' | 'landlord') => void;
  walletAddress: string | null;
  onDisconnect: () => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({ isOpen, onSelect, walletAddress, onDisconnect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isOpen && isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isDropdownOpen]);

  // Reset dropdown when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 backdrop-blur-xl animate-in fade-in duration-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-6xl animate-in zoom-in-95 duration-700 space-y-10">

        {/* Header Section */}
        <div className="space-y-6 text-center relative">
          {/* Wallet Connection Badge */}
          <div className="flex justify-center" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 rounded-full border border-indigo-400/30 text-indigo-200 text-sm font-mono hover:border-indigo-400/60 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer backdrop-blur-md"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-lg shadow-green-500/50"></span>
                </span>
                <span className="font-semibold">Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <button
                    onClick={onDisconnect}
                    className="w-full px-5 py-4 text-left text-sm hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 hover:text-red-400 transition-all flex items-center gap-3 group text-slate-300"
                  >
                    <svg className="w-5 h-5 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-200 tracking-tight leading-tight animate-in slide-in-from-bottom-4 duration-700">
              Choose Your Path
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
              Select your role to unlock your personalized dashboard. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-semibold">Privacy-first</span> technology protects your data.
            </p>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tenant Card */}
          <button
            onClick={() => onSelect('tenant')}
            className="group relative p-10 rounded-[32px] text-left transition-all duration-500 hover:scale-[1.03] animate-in slide-in-from-left duration-700"
            style={{ animationDelay: '200ms' }}
          >
            {/* Gradient Border */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-cyan-500/50 via-blue-500/50 to-indigo-500/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Card Content */}
            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-[32px] border border-cyan-500/20 group-hover:border-cyan-400/40 transition-all duration-500 p-8 h-full flex flex-col gap-6">
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all duration-500 border border-cyan-500/30 group-hover:border-cyan-400/50 group-hover:scale-110 group-hover:rotate-3">
                  <UserIcon className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-500" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-500">
                  I'm a Tenant
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors duration-500">
                  Create your encrypted financial profile, browse verified listings, and apply with zero-knowledge proof eligibility checks.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-4 group-hover:translate-x-0">
                <span>Enter Portal</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>

          {/* Landlord Card */}
          <button
            onClick={() => onSelect('landlord')}
            className="group relative p-10 rounded-[32px] text-left transition-all duration-500 hover:scale-[1.03] animate-in slide-in-from-right duration-700"
            style={{ animationDelay: '300ms' }}
          >
            {/* Gradient Border */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-indigo-500/50 via-purple-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Card Content */}
            <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-[32px] border border-indigo-500/20 group-hover:border-indigo-400/40 transition-all duration-500 p-8 h-full flex flex-col gap-6">
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center group-hover:from-indigo-500/30 group-hover:to-purple-600/30 transition-all duration-500 border border-indigo-500/30 group-hover:border-indigo-400/50 group-hover:scale-110 group-hover:rotate-3">
                  <BuildingIcon className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-500" />
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-4">
                <h3 className="text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-500">
                  I'm a Landlord
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 leading-relaxed transition-colors duration-500">
                  List properties with encrypted requirements, review anonymized applicants, and verify eligibility without seeing raw data.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-4 group-hover:translate-x-0">
                <span>Enter Portal</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;
