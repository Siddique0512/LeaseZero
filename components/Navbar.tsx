
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldLock, WalletIcon, AccessibilityIcon, UserIcon, BuildingIcon } from './Icons';
import { APP_CONFIG } from '../config';
import { UserRole } from '../types';

interface NavbarProps {
  walletAddress: string | null;
  userRole: UserRole;
  onConnectClick: () => void;
  onDisconnect: () => void;
  onSwitchRole: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  walletAddress, 
  userRole,
  onConnectClick, 
  onDisconnect,
  onSwitchRole,
  isHighContrast,
  onToggleHighContrast,
  fontSize,
  onFontSizeChange
}) => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showA11yMenu, setShowA11yMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const a11yRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (a11yRef.current && !a11yRef.current.contains(event.target as Node)) {
        setShowA11yMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <ShieldLock className="w-6 h-6 text-white" />
          </div>
          <span className={isHighContrast ? 'text-white' : ''}>LocaPrivé</span>
        </Link>

        {/* Dynamic Navigation - Only show if wallet is connected and role is selected */}
        <div className="hidden md:flex items-center gap-8 ml-8">
          {walletAddress && userRole === 'tenant' && (
            <>
              <Link to="/tenant" className={`transition-colors ${isActive('/tenant') ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}`}>
                Tenant Dashboard
              </Link>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500 text-sm cursor-not-allowed">My Applications</span>
            </>
          )}

          {walletAddress && userRole === 'landlord' && (
            <>
              <Link to="/landlord" className={`transition-colors ${isActive('/landlord') ? 'text-indigo-400 font-medium' : 'text-slate-400 hover:text-white'}`}>
                Landlord Portal
              </Link>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500 text-sm cursor-not-allowed">Active Listings</span>
            </>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-4">
          {/* Network Indicator */}
          {walletAddress && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-white/5 rounded-full">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{APP_CONFIG.NETWORK_NAME}</span>
            </div>
          )}

          {/* Accessibility Settings */}
          <div className="relative" ref={a11yRef}>
            <button
              onClick={() => setShowA11yMenu(!showA11yMenu)}
              className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-all active:scale-95"
              title="Accessibility Settings"
            >
              <AccessibilityIcon className="w-5 h-5" />
            </button>

            {showA11yMenu && (
              <div className="absolute right-0 mt-3 w-72 glass border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Display Settings</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <div className="text-sm font-bold">High Contrast</div>
                      <div className="text-[10px] text-slate-500">Boost text visibility</div>
                    </div>
                    <button 
                      onClick={onToggleHighContrast}
                      className={`w-12 h-6 rounded-full transition-all relative ${isHighContrast ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isHighContrast ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Text Size</div>
                      <span className="text-xs font-bold text-indigo-400">{fontSize}px</span>
                    </div>
                    <div className="flex gap-2">
                      {[14, 16, 18, 20].map(size => (
                        <button
                          key={size}
                          onClick={() => onFontSizeChange(size)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            fontSize === size 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {size === 16 ? 'Std' : `${size}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wallet / User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => walletAddress ? setShowDropdown(!showDropdown) : onConnectClick()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 font-medium group ${
                walletAddress 
                  ? 'bg-slate-800 text-indigo-400 border border-indigo-500/50 hover:bg-slate-700' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              <WalletIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>

            {showDropdown && walletAddress && (
              <div className="absolute right-0 mt-3 w-64 glass border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-1 pb-2 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Connected Wallet</span>
                    {userRole && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${userRole === 'tenant' ? 'bg-cyan-900 text-cyan-400' : 'bg-indigo-900 text-indigo-400'}`}>
                        {userRole}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-indigo-300 break-all">{walletAddress}</span>
                </div>
                
                <div className="space-y-1">
                  {userRole === 'tenant' && (
                    <Link to="/tenant" onClick={() => setShowDropdown(false)} className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors">
                      <div className="flex items-center gap-2"><UserIcon className="w-4 h-4" /> Tenant Portal</div>
                    </Link>
                  )}
                  {userRole === 'landlord' && (
                    <Link to="/landlord" onClick={() => setShowDropdown(false)} className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors">
                      <div className="flex items-center gap-2"><BuildingIcon className="w-4 h-4" /> Landlord Portal</div>
                    </Link>
                  )}
                  <a href={APP_CONFIG.EXPLORER_URL} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg text-sm text-slate-300 transition-colors">
                    <span>View on Explorer</span>
                    <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  <button 
                    onClick={() => { onSwitchRole(); setShowDropdown(false); }}
                    className="w-full text-left p-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-medium"
                  >
                    Switch Role
                  </button>
                  <button 
                    onClick={() => { onDisconnect(); setShowDropdown(false); }}
                    className="w-full text-left p-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
