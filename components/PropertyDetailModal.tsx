
import React from 'react';
import { Property } from '../types';
import { XIcon, CheckIcon, BuildingIcon, CpuIcon } from './Icons';
import { APP_CONFIG } from '../config';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onVerify: () => void;
  profileEncrypted: boolean;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose, onVerify, profileEncrypted }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-4xl max-h-[90vh] glass border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-all"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Header Image */}
          <div className="relative h-64 sm:h-80 w-full">
            <img 
              src={property.images[0]} 
              alt={property.address} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent pt-24">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-indigo-600 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                      {property.type}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-600 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                      {property.availableFrom <= new Date().toISOString().split('T')[0] ? 'Available Now' : `Available ${new Date(property.availableFrom).toLocaleDateString()}`}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">{property.address}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-400">€{property.rent}</div>
                  <div className="text-sm text-slate-400">per month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">About this property</h3>
              <p className="text-slate-300 leading-relaxed text-lg font-light">
                {property.description}
              </p>
            </div>

            {/* Grid Layout for Details */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Specs */}
              <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BuildingIcon className="w-4 h-4" /> Property Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="text-xs text-slate-400">Bedrooms</div>
                    <div className="text-xl font-bold text-white">{property.specs.bedrooms}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="text-xs text-slate-400">Bathrooms</div>
                    <div className="text-xl font-bold text-white">{property.specs.bathrooms}</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="text-xs text-slate-400">Size</div>
                    <div className="text-xl font-bold text-white">{property.specs.sqFt} sq ft</div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-xl">
                    <div className="text-xs text-slate-400">Year Built</div>
                    <div className="text-xl font-bold text-white">{property.specs.yearBuilt}</div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <CpuIcon className="w-4 h-4" /> Rental Details
                </h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-slate-300">Minimum Tenancy</span>
                      <span className="text-sm font-bold text-white">{property.minTenancyDuration}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-slate-300">Available From</span>
                      <span className="text-sm font-bold text-white">{new Date(property.availableFrom).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-slate-300">Pet Policy</span>
                      <span className="text-sm font-bold text-white">{property.additionalInfo.petPolicy}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-slate-300">Furnishing</span>
                      <span className="text-sm font-bold text-white">{property.additionalInfo.furnishedStatus}</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-sm text-slate-300">Transport</span>
                      <span className="text-sm font-bold text-white truncate max-w-[150px]">{property.additionalInfo.transport}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
               <h3 className="text-lg font-bold text-white uppercase tracking-widest">Amenities</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                 {property.amenities.map(amenity => (
                   <div key={amenity} className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                     <CheckIcon className="w-4 h-4 text-emerald-400" />
                     <span className="text-xs font-medium text-slate-200">{amenity}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
        
        {/* Footer Action */}
        <div className="p-6 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
          <button 
             onClick={onVerify}
             disabled={!profileEncrypted}
             className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98] ${profileEncrypted ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}
          >
             {profileEncrypted ? 'Run Confidential Eligibility Check' : 'Lock Profile to Verify'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
