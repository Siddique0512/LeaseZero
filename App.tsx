import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LandlordPortal from './components/Landlord';
import TenantPortal from './components/Tenant';
import WalletModal from './components/WalletModal';
import RoleSelectionModal from './components/RoleSelectionModal';
import { MOCK_PROPERTIES, generatePropertyDetails } from './constants';
import { Property, UserRole } from './types';
import { LOCA_PRIVE_ABI } from './abi';
import { APP_CONFIG } from './config';

declare global {
  interface Window {
    ethereum: any;
  }
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem('walletAddress');
  });
  
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return localStorage.getItem('userRole') as UserRole;
  });

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isRoleSelectionOpen, setIsRoleSelectionOpen] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  
  // Initialize properties from localStorage or fallback to MOCK_PROPERTIES
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('leasezero_properties');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all properties have the detailed fields, even if loaded from older storage
        return parsed.map((p: any) => {
             if (!p.specs || !p.description || !p.amenities || !p.additionalInfo) {
                 return { ...p, ...generatePropertyDetails(p.type, p.rent) };
             }
             return p;
        });
      } catch (e) {
        console.error("Failed to parse properties from local storage", e);
      }
    }
    return MOCK_PROPERTIES;
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('leasezero_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    } else {
      localStorage.removeItem('walletAddress');
    }
  }, [walletAddress]);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  // Effect: Trigger role selection if wallet connected but no role
  useEffect(() => {
    if (walletAddress && !userRole) {
      setIsRoleSelectionOpen(true);
    }
  }, [walletAddress, userRole]);

  // Mock FHEVM instance
  const [fhevm] = useState<any>({
    createEncryptedInput: (contractAddress: string, userAddress: string) => {
      const builder = {
        add32: (value: number) => builder,
        encrypt: async () => {
          const mockHandle = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          return {
            handles: [mockHandle, mockHandle, mockHandle, mockHandle, mockHandle, mockHandle],
            inputProof: '0x' + Array.from({length: 128}, () => Math.floor(Math.random()*16).toString(16)).join('')
          };
        }
      };
      return builder;
    }
  });

  // Mock Contract for UI Testing
  const getMockContract = () => ({
    createListing: async () => ({ 
      wait: async () => ({ logs: [{ fragment: { name: 'ListingCreated' }, args: [Math.floor(Math.random() * 10000)] }] }) 
    }),
    setProfile: async () => ({ 
      wait: async () => {} 
    }),
    checkEligibility: async () => ({ 
      wait: async () => ({ logs: [{ fragment: { name: 'EligibilityResult' }, args: [null, null, true] }] }) 
    }),
    submitDocumentHash: async () => ({
      wait: async () => {}
    }),
    approveAttestation: async () => ({
      wait: async () => {}
    }),
    // Mock runner for PaymentModal
    runner: { 
      sendTransaction: async () => ({ 
        hash: '0xMockTransactionHash' + Math.random().toString(16).slice(2), 
        wait: async () => {} 
      }) 
    }
  } as unknown as Contract);

  // Accessibility State
  const [isHighContrast, setIsHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });
  const [fontSize, setFontSize] = useState(() => {
    return parseInt(localStorage.getItem('fontSize') || '16');
  });

  // Hydrate connection on load if address exists
  useEffect(() => {
    if (walletAddress && !contract) {
       handleConnect(walletAddress);
    }
  }, []);

  const handleConnect = async (fallbackAddress: string) => {
    setIsWalletModalOpen(false);

    // Try Real Connection First if available
    if (window.ethereum) {
      try {
        const browserProvider = new BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        
        setWalletAddress(address);
        setProvider(browserProvider);
        
        // Try to connect to real contract
        try {
           const contractInstance = new Contract(APP_CONFIG.CONTRACT_ADDRESS, LOCA_PRIVE_ABI, signer);
           setContract(contractInstance);
        } catch (e) {
           console.warn("Contract init failed, using mock", e);
           setContract(getMockContract());
        }
        return;
      } catch (error) {
        console.warn("Real wallet connection failed/rejected, falling back to mock mode:", error);
      }
    }

    // Fallback to Mock Mode (for testing without wallet or on error)
    setWalletAddress(fallbackAddress);
    setContract(getMockContract());
  };

  const handleRoleSelect = (role: UserRole) => {
    if (!role) return;
    setUserRole(role);
    setIsRoleSelectionOpen(false);
    if (role === 'tenant') {
      navigate('/tenant');
    } else {
      navigate('/landlord');
    }
  };

  const handleSwitchRole = () => {
    setUserRole(null);
    setIsRoleSelectionOpen(true);
    navigate('/');
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setUserRole(null);
    setContract(null);
    setProvider(null);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const addProperty = (newProp: Property) => {
    setProperties(prev => [newProp, ...prev]);
  };

  const updateProperty = (updatedProp: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProp.id ? updatedProp : p));
  };

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
  };

  const updateFontSize = (size: number) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size.toString());
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return (
    <div 
      className="min-h-screen bg-[#0F172A] text-white selection:bg-indigo-500 selection:text-white transition-all duration-300"
      style={{ fontSize: `${fontSize}px` }}
    >
      <Navbar 
        walletAddress={walletAddress} 
        userRole={userRole}
        onConnectClick={() => walletAddress ? null : setIsWalletModalOpen(true)} 
        onDisconnect={handleDisconnect}
        onSwitchRole={handleSwitchRole}
        isHighContrast={isHighContrast}
        onToggleHighContrast={toggleHighContrast}
        fontSize={fontSize}
        onFontSizeChange={updateFontSize}
      />
      
      <main className="relative">
        {!isHighContrast && (
          <>
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </>
        )}

        <Routes>
          <Route path="/" element={
            <Home 
              walletAddress={walletAddress} 
              userRole={userRole}
              onConnectClick={() => setIsWalletModalOpen(true)}
            />
          } />
          
          <Route 
            path="/landlord" 
            element={
              walletAddress && userRole === 'landlord' ? (
                <LandlordPortal 
                  properties={properties} 
                  onAddProperty={addProperty} 
                  onUpdateProperty={updateProperty}
                  fhevm={fhevm}
                  contract={contract}
                  walletAddress={walletAddress}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          <Route 
            path="/tenant" 
            element={
              walletAddress && userRole === 'tenant' ? (
                <TenantPortal 
                  properties={properties} 
                  fhevm={fhevm} 
                  walletAddress={walletAddress}
                  contract={contract}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </main>

      {isWalletModalOpen && (
        <WalletModal 
          onClose={() => setIsWalletModalOpen(false)} 
          onConnect={handleConnect} 
        />
      )}

      {/* Role Selection Modal */}
      <RoleSelectionModal 
        isOpen={isRoleSelectionOpen}
        onSelect={handleRoleSelect}
        walletAddress={walletAddress}
      />
    </div>
  );
};

export default App;