
import React from 'react';
import { XIcon, CheckIcon, ShieldLock } from './Icons';
import { Property } from '../types';

interface EligibilityModalProps {
  onClose: () => void;
  result: {
    isEligible: boolean;
    breakdown: {
      income: boolean;
      seniority: boolean;
      savings: boolean;
      guarantor: boolean;
      reliability: boolean;
      capacity: boolean;
    };
  };
  property: Property;
  onApply?: () => void;
  userValues: {
    salary: number;
    seniority: number;
    savings: number;
    guarantorIncome: number;
    missedPayments: number;
    householdSize: number;
  };
}

const EligibilityModal: React.FC<EligibilityModalProps> = ({ onClose, result, property, onApply }) => {
  const { isEligible, breakdown } = result;

  const criteria = [
    { key: 'income', label: 'Monthly Income' },
    { key: 'seniority', label: 'Job Seniority' },
    { key: 'savings', label: 'Liquidity Buffer' },
    { key: 'guarantor', label: 'Guarantor Income' },
    { key: 'reliability', label: 'Payment History' },
    { key: 'capacity', label: 'Household Size' },
  ];

  const getRequirementDetails = (key: string) => {
    switch (key) {
      case 'income':
        return `Min €${property.minIncome}`;
      case 'seniority':
        return `Min ${property.minSeniorityMonths} months`;
      case 'savings':
        return property.requireSavingsBuffer ? `Min €${property.rent * 3}` : 'Not Required';
      case 'guarantor':
        return property.requireGuarantor ? `Min €${property.rent * 4}` : 'Not Required';
      case 'reliability':
        return `Max ${property.maxMissedPayments} missed`;
      case 'capacity':
        return `Max ${property.maxOccupants} people`;
      default:
        return '';
    }
  };

  const handleApplyClick = () => {
      if(onApply) {
          onApply();
          onClose();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-md glass border rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in duration-300 ${isEligible ? 'border-green-500/30' : 'border-red-500/30'}`}>
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${isEligible ? 'text-green-400' : 'text-red-400'}`}>
              {isEligible ? 'Eligibility Confirmed' : 'Requirements Not Met'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <XIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <p className="text-sm text-slate-400">
            Analysis result for <span className="text-white font-medium">{property?.address || 'Property'}</span> based on your encrypted profile.
          </p>

          <div className="space-y-3">
            {criteria.map((item) => {
              const passed = breakdown[item.key as keyof typeof breakdown];
              const requirement = getRequirementDetails(item.key);

              return (
                <div key={item.key} className={`flex flex-col p-3 rounded-xl border transition-all ${passed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${passed ? 'text-green-300' : 'text-red-300'}`}>
                      {item.label}
                    </span>
                    <div className={`p-1 rounded-full ${passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {passed ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                    </div>
                  </div>
                  
                  {!passed && property && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 flex justify-between text-[10px]">
                       <div className="text-slate-400">
                         Required: <span className="text-white font-bold">{requirement}</span>
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-white/5">
             {isEligible && onApply ? (
                 <button onClick={handleApplyClick} className="w-full py-4 bg-white text-black hover:bg-slate-200 rounded-2xl font-bold shadow-lg transition-all">
                     Submit Anonymized Application
                 </button>
             ) : (
                <div className="text-center text-[10px] text-slate-400">
                  <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 uppercase tracking-widest">
                    <ShieldLock className="w-3 h-3" />
                    <span>Zero-Knowledge Verification</span>
                  </div>
                  Note: Your specific financial data was kept private during this check.
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityModal;
