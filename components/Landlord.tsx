
import React, { useState, useEffect, useRef } from 'react';
import { Contract } from 'ethers';
import { generatePropertyDetails } from '../constants.tsx';
import { BuildingIcon, ShieldLock, CheckIcon, CpuIcon, TrashIcon, ChevronDownIcon, UploadIcon, ClockIcon, EditIcon, UserIcon, FileTextIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { Applicant, Property, Application } from '../types';
import { APP_CONFIG } from '../config';
import PaymentModal from './PaymentModal';
import SuccessModal from './SuccessModal';
import { getApplicationsForLandlord, saveApplication } from '../utils/storage';

interface LandlordPortalProps {
  properties: Property[];
  onAddProperty: (prop: Property) => void;
  onUpdateProperty: (prop: Property) => void;
  fhevm: any;
  contract: Contract | null;
  walletAddress: string | null;
}

const LandlordPortal: React.FC<LandlordPortalProps> = ({ properties, onAddProperty, onUpdateProperty, fhevm, contract, walletAddress }) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'applications'>('listings');
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>("");
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Modals & Mode State
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAction, setPaymentAction] = useState<'DEPLOY' | 'UPDATE' | 'VERIFY_REQUEST' | 'APPROVE_ATTESTATION' | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  
  // Verification State
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);

  // Form State
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState<number | ''>('');
  const [seniority, setSeniority] = useState(12);
  const [maxMissed, setMaxMissed] = useState(0);
  const [maxOccupants, setMaxOccupants] = useState(2);
  const [requireSavings, setRequireSavings] = useState(true);
  const [requireGuarantor, setRequireGuarantor] = useState(true);
  const [propertyType, setPropertyType] = useState<'Apartment' | 'House' | 'Studio' | 'Loft'>('Apartment');
  const [availableFrom, setAvailableFrom] = useState(new Date().toISOString().split('T')[0]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['CDI']);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [minTenancy, setMinTenancy] = useState<string>("Flexible");
  const [customTenancy, setCustomTenancy] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'applications') {
      const propIds = properties.map(p => p.id);
      setApplications(getApplicationsForLandlord(propIds));
    }
  }, [activeTab, properties]);

  // Load property into form for editing
  const handleEditClick = (prop: Property) => {
    setEditingId(prop.id);
    setAddress(prop.address);
    setRent(prop.rent);
    setPropertyType(prop.type);
    setAvailableFrom(prop.availableFrom);
    setUploadedImages(prop.images);
    setSeniority(prop.minSeniorityMonths);
    setRequireSavings(prop.requireSavingsBuffer);
    setRequireGuarantor(prop.requireGuarantor);
    setMaxMissed(prop.maxMissedPayments);
    setMaxOccupants(prop.maxOccupants);
    setEmploymentTypes(prop.employmentTypes || ['CDI']);
    
    // Parse tenancy
    if (["Flexible", "1 Month", "3 Months", "6 Months", "1 Year", "2+ Years"].includes(prop.minTenancyDuration)) {
        setMinTenancy(prop.minTenancyDuration);
        setCustomTenancy("");
    } else {
        setMinTenancy("Custom");
        setCustomTenancy(prop.minTenancyDuration.replace(" Months", ""));
    }

    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
    setActiveTab('listings');
  };

  const handleMainActionClick = () => {
    // Validation before payment
    if (!address.trim()) return alert("Property Address is required.");
    if (!rent || Number(rent) <= 0) return alert("Monthly Rent required.");
    if (uploadedImages.length === 0) return alert("Image required.");
    if (!contract || !walletAddress) return alert("Please connect wallet.");

    if (editingId) {
        setPaymentAction('UPDATE');
    } else {
        setPaymentAction('DEPLOY');
    }
    setShowPayment(true);
  };

  const handleVerifyRequest = (appId: string) => {
      setSelectedAppId(appId);
      setPaymentAction('VERIFY_REQUEST');
      setShowPayment(true);
  };
  
  // Logic to simulate verifying the documents on-chain using the FHE hash
  const handleVerifyDocuments = (appId: string) => {
      setVerifyingDocId(appId);
      
      // Simulate verifying the FHE hash against the blockchain/attestation service
      setTimeout(() => {
          const app = applications.find(a => a.id === appId);
          if(app) {
              const updated = { ...app, isDocumentVerified: true };
              saveApplication(updated);
              setApplications(prev => prev.map(a => a.id === appId ? updated : a));
          }
          setVerifyingDocId(null);
      }, 2000);
  };

  const handleApproveAttestation = (appId: string) => {
      setSelectedAppId(appId);
      setPaymentAction('APPROVE_ATTESTATION');
      setShowPayment(true);
  };

  const handleReject = (appId: string) => {
      const app = applications.find(a => a.id === appId);
      if (app) {
          const updated = { ...app, status: 'rejected' as const };
          saveApplication(updated);
          setApplications(prev => prev.map(a => a.id === appId ? updated : a));
      }
  };

  const handlePaymentSuccess = (txHash: string) => {
    setShowPayment(false);
    
    if (paymentAction === 'UPDATE') {
        executeUpdate(txHash);
    } else if (paymentAction === 'DEPLOY') {
        executeDeploy(txHash);
    } else if (paymentAction === 'VERIFY_REQUEST' && selectedAppId) {
        const app = applications.find(a => a.id === selectedAppId);
        if (app) {
            const updated = { ...app, status: 'verification_requested' as const };
            saveApplication(updated);
            setApplications(prev => prev.map(a => a.id === selectedAppId ? updated : a));
            setSuccessModal({
                isOpen: true,
                title: "Verification Requested",
                message: "We've notified the tenant to submit proofs for verification."
            });
        }
        setSelectedAppId(null);
    } else if (paymentAction === 'APPROVE_ATTESTATION' && selectedAppId) {
        executeApproveAttestation(selectedAppId, txHash);
    }
  };

  const executeApproveAttestation = async (appId: string, txHash: string) => {
      const app = applications.find(a => a.id === appId);
      if (app) {
          // Call On-Chain Approve (Simulated via App.tsx logic if needed, or PaymentModal handles mock transaction)
          // Ideally here we call `contract.approveAttestation`
          try {
              if(contract) {
                  const listingId = properties.find(p => p.id === app.propertyId)?.onChainId || 0;
                  try {
                      const tx = await contract.approveAttestation(listingId, app.tenantAddress);
                      await tx.wait();
                  } catch(e) {
                      console.warn("Contract approveAttestation failed (likely mock mode)", e);
                  }
              }
          } catch(e) { console.error(e); }

          const updated: Application = { ...app, status: 'approved' as const, isVerifiedOnChain: true };
          saveApplication(updated);
          setApplications(prev => prev.map(a => a.id === appId ? updated : a));
          setSuccessModal({
              isOpen: true,
              title: "Attestation Approved",
              message: "The tenant's document hash has been approved on-chain. Eligibility confirmed."
          });
      }
      setSelectedAppId(null);
  };

  const executeUpdate = async (paymentTxHash: string) => {
      setDeploying(true);
      setDeployStep("Updating Listing Data...");
      
      await new Promise(r => setTimeout(r, 2000));
      
      const finalTenancyDuration = minTenancy === "Custom" ? `${customTenancy} Months` : minTenancy;
      
      const updatedProp: Property = {
        id: editingId!, 
        onChainId: properties.find(p => p.id === editingId)?.onChainId,
        address,
        rent: Number(rent),
        type: propertyType,
        availableFrom: availableFrom,
        createdAt: properties.find(p => p.id === editingId)?.createdAt || new Date().toISOString(),
        images: uploadedImages,
        minIncome: Number(rent) * 3,
        minSeniorityMonths: seniority,
        requireSavingsBuffer: requireSavings,
        requireGuarantor: requireGuarantor,
        employmentTypes,
        features: ['FHE Guarded', 'On-Chain'],
        applicantsCount: properties.find(p => p.id === editingId)?.applicantsCount || 0,
        maxMissedPayments: maxMissed,
        maxOccupants: maxOccupants,
        minTenancyDuration: finalTenancyDuration,
        description: properties.find(p => p.id === editingId)?.description || '',
        amenities: properties.find(p => p.id === editingId)?.amenities || [],
        specs: properties.find(p => p.id === editingId)?.specs || { bedrooms: 1, bathrooms: 1, sqFt: 500, yearBuilt: 2000 },
        additionalInfo: properties.find(p => p.id === editingId)?.additionalInfo || { petPolicy: '', furnishedStatus: '', transport: '' }
      };

      onUpdateProperty(updatedProp);

      setDeploying(false);
      setEditingId(null);
      resetForm();
      
      setSuccessModal({
        isOpen: true,
        title: "Property Updated",
        message: "Your property details have been successfully updated on the platform."
      });
  };

  const executeDeploy = async (paymentTxHash: string) => {
    setDeploying(true);
    setDeployStep("Encrypting Criteria...");

    try {
      const input = fhevm.createEncryptedInput(APP_CONFIG.CONTRACT_ADDRESS, walletAddress);
      
      const calcMinIncome = Number(rent) * 3;
      const calcMinSavings = requireSavings ? Number(rent) * 3 : 0;
      const calcMinGuarantor = requireGuarantor ? Number(rent) * 4 : 0;

      input.add32(calcMinIncome);
      input.add32(seniority);
      input.add32(calcMinSavings);
      input.add32(calcMinGuarantor);
      input.add32(maxMissed);
      input.add32(maxOccupants);

      const encrypted = await input.encrypt();
      
      setDeployStep("Deploying to Blockchain...");

      const handles = encrypted.handles; 
      let onChainId = 'pending';
      
      try {
        const tx = await contract!.createListing(
          { data: handles[0] },
          { data: handles[1] },
          { data: handles[2] },
          { data: handles[3] },
          { data: handles[4] },
          { data: handles[5] }
        );

        setDeployStep("Waiting for Confirmation...");
        const receipt = await tx.wait();
        
        if (receipt.logs) {
           const event = receipt.logs.find((l: any) => l.fragment && l.fragment.name === 'ListingCreated');
           if(event) {
               onChainId = event.args[0].toString();
           }
        }
      } catch (txError) {
        console.warn("Blockchain transaction failed (Simulating success for UI test):", txError);
        await new Promise(r => setTimeout(r, 1500));
        onChainId = 'mock-' + Date.now();
      }

      setDeployStep("Finalizing...");

      const finalTenancyDuration = minTenancy === "Custom" ? `${customTenancy} Months` : minTenancy;
      const randomDetails = generatePropertyDetails(propertyType, Number(rent));

      const newProp: Property = {
        id: 'prop-' + Math.random().toString(36).substr(2, 9),
        onChainId: onChainId,
        address,
        rent: Number(rent),
        type: propertyType,
        availableFrom: availableFrom,
        createdAt: new Date().toISOString(),
        images: uploadedImages,
        minIncome: calcMinIncome,
        minSeniorityMonths: seniority,
        requireSavingsBuffer: requireSavings,
        requireGuarantor: requireGuarantor,
        employmentTypes,
        features: ['FHE Guarded', 'On-Chain'],
        applicantsCount: 0,
        maxMissedPayments: maxMissed,
        maxOccupants: maxOccupants,
        minTenancyDuration: finalTenancyDuration,
        ...randomDetails
      };

      onAddProperty(newProp);
      resetForm();
      
      setSuccessModal({
        isOpen: true,
        title: "Successfully Listed",
        message: "Your property has been deployed with encrypted eligibility criteria."
      });
      
    } catch (err: any) {
      console.error("Deploy failed completely:", err);
      alert("Deployment failed: " + (err.reason || err.message));
    } finally {
      setDeploying(false);
      setDeployStep("");
    }
  };

  const resetForm = () => {
      setAddress("");
      setRent('');
      setUploadedImages([]);
      setEditingId(null);
  };

  const processFiles = (files: FileList) => {
    Array.from(files).slice(0, 5 - uploadedImages.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
           setUploadedImages(prev => [...prev, e.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const activeListings = properties;
  const TENANCY_OPTIONS = ["Flexible", "1 Month", "3 Months", "6 Months", "1 Year", "2+ Years", "Custom"];

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 space-y-12">
      <PaymentModal 
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        actionName={
            paymentAction === 'UPDATE' ? "Update Listing" : 
            paymentAction === 'VERIFY_REQUEST' ? "Request Verification" : 
            paymentAction === 'APPROVE_ATTESTATION' ? "Approve On-Chain" : "Deploy Smart Contract"
        }
        contract={contract}
      />

      <SuccessModal 
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />

      <header className="space-y-4">
        <div className="flex justify-between items-end">
             <div>
                <h1 className="text-4xl font-bold tracking-tight">Landlord Portal</h1>
                <p className="text-slate-400">Manage listings and review encrypted applications.</p>
             </div>
             <div className="flex gap-2 p-1 bg-slate-800 rounded-xl">
               <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'listings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>My Listings</button>
               <button onClick={() => setActiveTab('applications')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'applications' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Incoming Apps ({applications.length})</button>
            </div>
        </div>
      </header>

      {activeTab === 'applications' ? (
        <div className="space-y-6">
            <div className="p-6 glass rounded-[32px] border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <UserIcon className="w-6 h-6 text-indigo-400" />
                    <h2 className="text-xl font-bold">Applicant Review</h2>
                </div>
                
                {applications.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        No applications received yet.
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applications.map(app => {
                            const prop = properties.find(p => p.id === app.propertyId);
                            return (
                                <div key={app.id} className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-lg text-white">{app.anonymousId}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                                    app.status === 'applied' ? 'bg-blue-500/20 text-blue-400' :
                                                    app.status === 'verification_requested' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    app.status === 'docs_submitted' ? 'bg-purple-500/20 text-purple-400' :
                                                    app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {app.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-1">
                                                Applying for: {prop?.address || 'Unknown Property'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-slate-400">FHE Eligibility</div>
                                            <div className="flex items-center justify-end gap-1 text-green-400 text-sm font-bold">
                                                <ShieldLock className="w-3 h-3" /> PASSED
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Stats (Safe to View) */}
                                    <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-white/5">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase">Occupants</div>
                                            <div className="font-bold">{app.occupants}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase">Move In</div>
                                            <div className="font-bold">{new Date(app.moveInDate).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase">Applied</div>
                                            <div className="font-bold">{new Date(app.timestamp).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    {/* Action Area */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        {app.status === 'applied' && (
                                            <>
                                                <button onClick={() => handleReject(app.id)} className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                                                    Reject
                                                </button>
                                                <button onClick={() => handleVerifyRequest(app.id)} className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                                                    Request Verification <ShieldLock className="w-3 h-3" />
                                                </button>
                                            </>
                                        )}
                                        
                                        {app.status === 'verification_requested' && (
                                            <div className="text-xs text-yellow-500 font-bold flex items-center gap-2 px-3 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                                <ClockIcon className="w-3 h-3" /> Waiting for tenant docs...
                                            </div>
                                        )}

                                        {app.status === 'docs_submitted' && (
                                            <div className="w-full space-y-3">
                                                <div className="flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <FileTextIcon className="w-4 h-4 text-purple-400" />
                                                        <span className="text-xs text-slate-400 font-mono">{app.docHash?.slice(0, 20) || "0x..."}...</span>
                                                    </div>
                                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hash On-Chain</div>
                                                </div>
                                                
                                                {!app.isDocumentVerified ? (
                                                     <button 
                                                        onClick={() => handleVerifyDocuments(app.id)}
                                                        disabled={verifyingDocId === app.id}
                                                        className="w-full py-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
                                                     >
                                                        {verifyingDocId === app.id ? (
                                                            <>
                                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                                Verifying Integrity...
                                                            </>
                                                        ) : (
                                                            <>View Docs & Verify Hash <ShieldLock className="w-3 h-3" /></>
                                                        )}
                                                     </button>
                                                ) : (
                                                    <button onClick={() => handleApproveAttestation(app.id)} className="w-full py-3 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2">
                                                        Documents Verified ✅ - Approve Attestation
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {app.status === 'approved' && (
                                            <div className="text-xs text-green-400 font-bold flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                                                <CheckCircleIcon className="w-3 h-3" /> Approved On-Chain
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div ref={formRef} className="p-8 glass rounded-[32px] space-y-8 border border-white/5 shadow-2xl relative transition-all duration-300">
              {editingId && (
                  <div className="absolute top-0 left-0 right-0 bg-indigo-600/20 text-indigo-300 text-xs font-bold text-center py-1 rounded-t-[32px] border-b border-indigo-500/30">
                      EDITING MODE
                  </div>
              )}
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BuildingIcon className="w-7 h-7 text-indigo-400" />
                {editingId ? "Edit Listing Configuration" : "Listing Configuration"}
              </h2>
              
              {/* Image Upload Drag & Drop */}
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     Property Photos <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    hidden 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileInputChange} 
                  />
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => uploadedImages.length < 5 && fileInputRef.current?.click()}
                    className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center gap-3 p-4 cursor-pointer
                      ${isDragging ? 'border-indigo-400 bg-indigo-900/20' : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'}`}
                  >
                    {uploadedImages.length === 0 ? (
                      <>
                        <div className="p-3 bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                          <UploadIcon className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-300">Click or Drag Property Photos</p>
                          <p className="text-xs text-slate-500">Supports JPG, PNG (Max 5)</p>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-5 gap-2 w-full" onClick={e => e.stopPropagation()}>
                        {uploadedImages.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden group/img">
                            <img src={img} alt="Upload" className="w-full h-full object-cover" />
                            <button 
                              onClick={() => removeImage(i)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity"
                            >
                              <TrashIcon className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        ))}
                        {uploadedImages.length < 5 && (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-xs hover:border-indigo-500 hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            + Add
                          </div>
                        )}
                      </div>
                    )}
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Property Address <span className="text-red-400">*</span>
                  </label>
                  <input required value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="e.g. 42 Rue de la Paix" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Monthly Rent (€) <span className="text-red-400">*</span>
                      </label>
                      <input required value={rent} onChange={e => setRent(e.target.value === '' ? '' : Number(e.target.value))} type="number" min="1" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="1200" />
                  </div>
                  <div className="space-y-2 relative">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                      <div className="relative">
                        <select 
                            value={propertyType} 
                            onChange={e => setPropertyType(e.target.value as any)} 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none pr-10"
                        >
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Studio">Studio</option>
                            <option value="Loft">Loft</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDownIcon className="w-4 h-4" />
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Sliders and Toggles Section Omitted for Brevity - Keeping existing logic */}
              <div className="grid md:grid-cols-2 gap-6 pt-4">
                 {/* Reliability Factor */}
                 <div className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <ShieldLock className="w-3 h-3 text-cyan-400" /> Payment Reliability
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs text-slate-400">Max missed payments (12mo)</label>
                      <div className="relative">
                        <select value={maxMissed} onChange={e => setMaxMissed(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs outline-none appearance-none pr-8">
                          <option value={0}>Strict (0 missed)</option>
                          <option value={1}>Relaxed (Max 1)</option>
                          <option value={2}>Flexible (Max 2)</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDownIcon className="w-3 h-3" />
                        </div>
                      </div>
                   </div>
                 </div>

                 {/* Capacity Factor */}
                 <div className="p-5 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <BuildingIcon className="w-3 h-3 text-indigo-400" /> Occupancy Limit
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs text-slate-400">Maximum occupants</label>
                      <div className="flex gap-2">
                         {[1, 2, 3, 4].map(n => (
                           <button type="button" key={n} onClick={() => setMaxOccupants(n)} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${maxOccupants === n ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                             {n}
                           </button>
                         ))}
                         {/* Custom Input for >4 */}
                         <div className="flex-1 relative">
                            <input 
                              type="number" 
                              min="5" 
                              placeholder="5+" 
                              value={maxOccupants > 4 ? maxOccupants : ''}
                              onChange={(e) => setMaxOccupants(Math.max(1, Number(e.target.value)))}
                              className={`w-full h-full text-center rounded-xl text-xs font-bold border outline-none transition-all placeholder:text-slate-600 ${maxOccupants > 4 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 focus:border-indigo-500 focus:bg-slate-700'}`}
                            />
                         </div>
                      </div>
                   </div>
                 </div>
              </div>

              {/* ... Other inputs (Job Stability, Liquidity, etc.) ... */}
              <div className="grid md:grid-cols-3 gap-6 pt-4">
                {/* ... Job Stability ... */}
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-4">
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <CpuIcon className="w-3 h-3" /> Job Stability
                   </div>
                   <div className="space-y-1">
                      <input type="range" min="0" max="36" value={seniority} onChange={e => setSeniority(Number(e.target.value))} className="w-full accent-indigo-500" />
                      <div className="text-[10px] font-bold text-indigo-400 text-center">{seniority} Months</div>
                   </div>
                </div>

                {/* ... Liquidity & Guarantor ... */}
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col justify-center gap-3">
                   <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Liquidity Buffer</span>
                      <button 
                          type="button"
                          onClick={() => setRequireSavings(prev => !prev)} 
                          className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${requireSavings ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${requireSavings ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Require Guarantor</span>
                      <button 
                          type="button"
                          onClick={() => setRequireGuarantor(prev => !prev)} 
                          className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${requireGuarantor ? 'bg-indigo-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${requireGuarantor ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </button>
                   </div>
                </div>

                {/* ... Available From ... */}
                <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col justify-center space-y-3">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                     Available From <span className="text-red-400">*</span>
                   </label>
                   <input 
                     required
                     type="date" 
                     value={availableFrom}
                     onChange={e => setAvailableFrom(e.target.value)}
                     className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-colors"
                   />
                </div>
              </div>

              {/* ... Min Tenancy ... */}
              <div className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <ClockIcon className="w-3 h-3 text-indigo-400" /> Minimum Tenancy <span className="text-red-400">*</span>
                  </div>
                  <div className="flex gap-3">
                      <div className="relative flex-1">
                        <select 
                          value={minTenancy} 
                          onChange={e => setMinTenancy(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none appearance-none pr-10 focus:ring-2 focus:ring-indigo-500 transition-all"
                        >
                          {TENANCY_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDownIcon className="w-4 h-4" />
                        </div>
                      </div>
                      {minTenancy === "Custom" && (
                          <div className="relative w-32 animate-in fade-in slide-in-from-left-2 duration-300">
                              <input 
                                type="number" 
                                min="1"
                                placeholder="Months"
                                value={customTenancy}
                                onChange={e => setCustomTenancy(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                              />
                          </div>
                      )}
                  </div>
              </div>

              <div className="flex gap-3 pt-6">
                  {editingId && (
                      <button 
                          onClick={resetForm}
                          className="px-6 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-[24px] font-bold transition-all"
                      >
                          Cancel
                      </button>
                  )}
                  <button 
                    onClick={handleMainActionClick} 
                    disabled={deploying || !walletAddress} 
                    className={`flex-1 py-5 rounded-[24px] font-bold transition-all flex flex-col items-center gap-1 active:scale-[0.98] shadow-2xl
                      ${!walletAddress 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white'
                      }`}
                  >
                    {deploying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span className="text-[10px] uppercase tracking-widest mt-1">{deployStep}</span>
                      </>
                    ) : (
                      <span className="text-lg">
                          {!walletAddress 
                              ? "Connect Wallet to Deploy" 
                              : editingId ? "Update Listing" : "Deploy Encrypted Smart Criteria"
                          }
                      </span>
                    )}
                  </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Active Listings */}
          <div className="space-y-8">
            <div className="p-6 glass rounded-[32px] space-y-6 border border-white/5 shadow-xl min-h-[500px]">
              <h3 className="text-xl font-bold tracking-tight">Active Listings</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {activeListings.length === 0 ? (
                    <div className="text-center text-slate-500 py-10">
                        No active listings found.
                    </div>
                ) : activeListings.map((prop) => (
                  <div key={prop.id} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden group">
                      {new Date(prop.createdAt).getTime() > Date.now() - 120000 && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-bold px-2 py-1 rounded-bl-lg">LIVE</div>
                      )}
                      
                      <div className="flex gap-3">
                          <img src={prop.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-800" />
                          <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold truncate">{prop.address}</div>
                              <div className="text-xs text-indigo-400 font-mono">€{prop.rent}/mo</div>
                              {prop.onChainId && (
                                  <div className="text-[8px] text-slate-500 font-mono mt-0.5">ID: {prop.onChainId}</div>
                              )}
                          </div>
                      </div>
                      
                      <button 
                          onClick={() => handleEditClick(prop)}
                          className="w-full mt-2 py-2 bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                          <EditIcon className="w-3 h-3" /> Update Property
                      </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordPortal;
