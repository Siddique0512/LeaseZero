import React from 'react';
import { Link } from 'react-router-dom';
import { EncryptedDataFlow, EncryptionLock } from './FHEVisuals';
import { AlertCircle, BuildingIcon, CpuIcon, CheckIcon, LeaseZeroLogo, WalletIcon } from './Icons';
import { UserRole } from '../types';

interface HomeProps {
  walletAddress: string | null;
  userRole: UserRole;
  onConnectClick: () => void;
}

const Home: React.FC<HomeProps> = ({ walletAddress, userRole, onConnectClick }) => {
  return (
    <div className="pt-24 pb-20 space-y-32">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Rent Without Revealing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Your Financials</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Privacy-first rental eligibility verification using Fully Homomorphic Encryption. Prove you're qualified without sharing sensitive documents.
        </p>
        
        <div className="pt-8">
          <EncryptedDataFlow />
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-10">
          {!walletAddress ? (
            <button 
              onClick={onConnectClick}
              className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-3 active:scale-95"
            >
              <WalletIcon className="w-6 h-6" />
              Connect Wallet to Start
            </button>
          ) : !userRole ? (
            <div className="px-10 py-4 bg-slate-800 text-slate-400 rounded-full font-bold text-lg border border-white/10">
              Please select a role...
            </div>
          ) : userRole === 'tenant' ? (
            <Link to="/tenant" className="px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-lg shadow-xl shadow-cyan-600/20 transition-all">
              Go to Tenant Portal &rarr;
            </Link>
          ) : (
            <Link to="/landlord" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all">
              Go to Landlord Portal &rarr;
            </Link>
          )}
        </div>

        <div className="flex justify-center items-center gap-8 pt-12 text-slate-500 text-sm font-medium uppercase tracking-widest">
           <span>GDPR Compliant</span>
           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
           <span>Zero Data Leakage</span>
           <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
           <span>Fhenix Protocol Powered</span>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">The Current Rental Problem</h2>
            <p className="text-lg text-slate-400">
              In traditional rentals, you are forced to share your most sensitive documents—ID, payslips, bank statements—with dozens of strangers just to see a property.
            </p>
            <div className="grid gap-4">
              {[
                "Discrimination based on employment type",
                "Massive privacy violations & data theft risk",
                "Illegal document hoarding by landlords",
                "Non-compliant manual GDPR processes"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-4xl font-bold text-indigo-400">70%</span>
              <p className="text-sm text-slate-400">of tenants share docs with 5+ landlords</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-4xl font-bold text-cyan-400">100+</span>
              <p className="text-sm text-slate-400">strangers see your sensitive data yearly</p>
            </div>
            <div className="col-span-2 p-6 bg-indigo-950/30 rounded-2xl border border-indigo-500/30 space-y-2">
              <span className="text-2xl font-bold text-white">Systematic privacy violations</span>
              <p className="text-slate-400">Current systems are fundamentally broken for European privacy standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-slate-900/50 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <h2 className="text-4xl font-bold">How LeaseZero Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <EncryptionLock active />, title: "Tenant Encrypts", desc: "Financial data is encrypted locally before upload." },
              { icon: <BuildingIcon className="w-8 h-8 text-indigo-400" />, title: "Landlord Sets", desc: "Rental requirements are encrypted & stored." },
              { icon: <CpuIcon className="w-8 h-8 text-cyan-400 animate-pulse" />, title: "FHE Compute", desc: "Smart contract compares data without decrypting it." },
              { icon: <CheckIcon className="w-8 h-8 text-green-400" />, title: "Result Revealed", desc: "Only the Pass/Fail result is visible to anyone." }
            ].map((step, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-center">{step.icon}</div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="p-6 bg-indigo-600/10 rounded-2xl border border-indigo-500/30 max-w-2xl mx-auto inline-block">
             <span className="text-indigo-300 font-medium">Your sensitive data is NEVER visible—even to the blockchain node operators</span>
          </div>
        </div>
      </section>

      {/* Comparison / Why FHE */}
      <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
        <div className="p-8 bg-slate-800/50 rounded-3xl border border-slate-700 space-y-6">
           <h3 className="text-2xl font-bold flex items-center gap-2">
             <span className="text-red-400">❌</span> Traditional Methods
           </h3>
           <ul className="space-y-4 text-slate-400">
             <li>• Decryption required at some point</li>
             <li>• Trusted parties needed</li>
             <li>• High risk of data breach</li>
             <li>• Complience is a manual nightmare</li>
           </ul>
        </div>
        <div className="p-8 bg-indigo-900/20 rounded-3xl border border-indigo-500/30 space-y-6 glow-indigo">
           <h3 className="text-2xl font-bold flex items-center gap-2">
             <span className="text-green-400">✅</span> FHE Benefits
           </h3>
           <ul className="space-y-4 text-slate-200">
             <li>• Data stays encrypted during computation</li>
             <li>• No decryption keys ever shared</li>
             <li>• GDPR "Privacy by Design" native</li>
             <li>• Mathematical certainty of privacy</li>
           </ul>
           <div className="p-4 bg-slate-950 rounded-xl border border-white/5 font-mono text-xs text-indigo-300 leading-relaxed">
              <code>{`// FHE Smart Contract Logic
Result result = FHE.verify(
    tenant.encryptedData,
    landlord.encryptedReqs
);
// Only 'true' or 'false' is ever revealed.`}</code>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-12">
          <div className="space-y-4 max-w-xs">
             <div className="flex items-center gap-2 text-xl font-bold">
               <LeaseZeroLogo className="w-7 h-7" />
               <span className="bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">LeaseZero</span>
             </div>
             <p className="text-slate-500 text-sm">
               The future of private rental markets. Built by <a href="https://github.com/Siddique0512" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">@Siddique0512</a>.
             </p>
          </div>
          <div className="flex gap-16">
            <div className="space-y-4">
              <h4 className="font-bold">Links</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="https://github.com/Siddique0512" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
                <li><a href="#" className="hover:text-white">Whitepaper</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold">Community</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="https://x.com/birdinsky005" target="_blank" rel="noopener noreferrer" className="hover:text-white">Twitter / X</a></li>
                <li><a href="#" title="Add 'echo_0512' on Discord" className="hover:text-white cursor-pointer">Discord</a></li>
                <li><a href="https://t.me/Siddique0512" target="_blank" rel="noopener noreferrer" className="hover:text-white">Telegram</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-slate-600 text-xs">
           GDPR Compliant • Open Source • © 2024 LeaseZero
        </div>
      </footer>
    </div>
  );
};

export default Home;