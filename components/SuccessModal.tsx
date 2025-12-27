
import React from 'react';
import { CheckIcon, XIcon } from './Icons';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm glass border border-green-500/30 rounded-[32px] p-8 text-center space-y-6 animate-in zoom-in duration-300 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
        
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckIcon className="w-10 h-10 text-green-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
