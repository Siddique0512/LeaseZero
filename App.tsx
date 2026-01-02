import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { ethers, Contract, BrowserProvider } from 'ethers';
import Navbar from './components/Navbar';
import Home from './components/Home';
import LandlordPortal from './components/Landlord';
import TenantPortal from './components/Tenant';
import WalletModal from './components/WalletModal';
import RoleSelectionModal from './components/RoleSelectionModal';
import { MOCK_PROPERTIES, generatePropertyDetails } from './constants';
import { Property, UserRole } from './types';
import { LEASE_ZERO_ABI } from './abi';
import { APP_CONFIG } from './config';
// Zama SDK loaded via CDN script tag in index.html
// Access via window object
declare global {
  interface Window {
    initSDK: () => Promise<void>;
    createInstance: (config: any) => Promise<any>;
    SepoliaConfig: any;
  }
}
import { Buffer } from 'buffer';

// Ensure Buffer is available for FHEVM WASM
window.Buffer = Buffer;

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
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [isSDKInitialized, setIsSDKInitialized] = useState(false);

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
        // Silently fail if storage is corrupt
        // console.warn("Failed to parse properties from local storage", e);
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

  // Initialize Zama SDK from CDN
  useEffect(() => {
    const init = async () => {
      try {
        // Wait for SDK to be available on window
        if (typeof window.initSDK === 'function') {
          await window.initSDK();
          setIsSDKInitialized(true);
          console.log('Zama SDK Initialized from CDN');
        } else {
          console.warn('Zama SDK not yet loaded from CDN');
        }
      } catch (err) {
        console.error('Failed to initialize Zama SDK:', err);
      }
    };
    // Small delay to ensure CDN script has loaded
    setTimeout(init, 100);
  }, []);

  // The real fhevm instance will be created upon wallet connection
  // using createInstance(SepoliaConfig)

  // Mock Contract for UI Testing (Ethers v6 Structure)
  const getMockContract = () => ({
    createListing: async () => ({
      wait: async () => ({
        logs: [{ fragment: { name: 'ListingCreated' }, args: [Math.floor(Math.random() * 10000)] }]
      })
    }),
    setProfile: async () => ({
      wait: async () => { }
    }),
    checkEligibility: async () => ({
      wait: async () => ({
        logs: [{ fragment: { name: 'EligibilityResult' }, args: [null, null, true] }]
      })
    }),
    submitDocumentHash: async () => ({
      wait: async () => { }
    }),
    approveAttestation: async () => ({
      wait: async () => { }
    }),
    // Ethers v6 uses `runner` to represent the connected Signer/Provider
    runner: {
      sendTransaction: async () => ({
        hash: '0xMockTransactionHash' + Math.random().toString(16).slice(2),
        wait: async () => { }
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
        // Request accounts FIRST - this triggers Rabby's wallet selector
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found');
        }

        // Now create provider and signer
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();

        // Create Zama Instance from CDN
        try {
          if (window.createInstance && window.SepoliaConfig) {
            const instance = await window.createInstance({ ...window.SepoliaConfig, network: window.ethereum });
            setFhevmInstance(instance);
          }
        } catch (fheErr) {
          console.error('Failed to create FHEVM instance:', fheErr);
        }

        // Check network and switch if necessary
        const network = await web3Provider.getNetwork();
        const currentChainId = Number(network.chainId);

        if (currentChainId !== APP_CONFIG.CHAIN_ID) {
          try {
            // Request network switch
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${APP_CONFIG.CHAIN_ID.toString(16)}` }],
            });

            // Reload provider after switch
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();
            setProvider(newProvider);

            // Initialize contract with new signer
            const contractInstance = new Contract(APP_CONFIG.CONTRACT_ADDRESS, LEASE_ZERO_ABI, newSigner);
            setContract(contractInstance);
            setWalletAddress(address);
            return;
          } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${APP_CONFIG.CHAIN_ID.toString(16)}`,
                    chainName: APP_CONFIG.NETWORK_NAME,
                    rpcUrls: ['https://rpc.sepolia.org'],
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    blockExplorerUrls: [APP_CONFIG.EXPLORER_URL]
                  }]
                });
              } catch (addError) {
                console.error('Failed to add network:', addError);
                throw new Error('Please add Sepolia network to MetaMask manually');
              }
            } else {
              console.error('Failed to switch network:', switchError);
              throw new Error('Please switch to Sepolia network manually');
            }
          }
        }

        setWalletAddress(address);
        setProvider(web3Provider);

        // Try to connect to real contract
        try {
          const contractInstance = new Contract(APP_CONFIG.CONTRACT_ADDRESS, LEASE_ZERO_ABI, signer);
          setContract(contractInstance);
        } catch (e) {
          // Silent fallback to mock for user experience
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
    setIsRoleSelectionOpen(false);
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
                  fhevm={fhevmInstance}
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
                  fhevm={fhevmInstance}
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
        onDisconnect={handleDisconnect}
      />
    </div>
  );
};

export default App;