
export interface Property {
  id: string;
  onChainId?: string; // Links to the smart contract listing ID
  address: string;
  rent: number;
  type: 'Apartment' | 'House' | 'Studio' | 'Loft';
  availableFrom: string;
  createdAt: string; // New: Date of addition
  images: string[];
  minIncome: number;
  minSeniorityMonths: number;
  requireSavingsBuffer: boolean;
  requireGuarantor: boolean;
  employmentTypes: string[];
  features: string[];
  applicantsCount: number;
  // New Criteria
  maxMissedPayments: number; // Reliability threshold
  maxOccupants: number; // Capacity threshold
  minTenancyDuration: string; // New: Length of Stay Preference
  
  // Detailed View Fields
  description: string;
  amenities: string[];
  specs: {
    bedrooms: number;
    bathrooms: number;
    sqFt: number;
    yearBuilt: number;
  };
  additionalInfo: {
    petPolicy: string;
    furnishedStatus: string;
    transport: string;
  };
}

export interface Applicant {
  id: string;
  anonymousId: string;
  status: 'qualified' | 'not-qualified';
  appliedDate: string;
  stabilityScore: number; // 0-100 calculated via FHE
  reliabilityIndex: number; // New: 0-100 score based on payment history
  metricsPassed: {
    income: boolean;
    seniority: boolean;
    savings: boolean;
    guarantor: boolean;
    reliability: boolean;
    capacity: boolean;
  };
}

export type ApplicationStatus = 'applied' | 'verification_requested' | 'docs_submitted' | 'approved' | 'rejected';

export interface Application {
  id: string;
  propertyId: string;
  tenantAddress: string;
  landlordAddress?: string; // Optional if we knew who owns the prop
  status: ApplicationStatus;
  timestamp: string;
  // Shared non-sensitive data visible to landlord
  anonymousId: string;
  occupants: number;
  moveInDate: string;
  isEligibleFHE: boolean;
  
  // Verification Attestation Fields
  docHash?: string; // Cryptographic hash of the documents
  verificationTx?: string; // Transaction hash where verification was submitted
  isVerifiedOnChain?: boolean; // If true, landlord approved via blockchain
  isDocumentVerified?: boolean; // If true, landlord verified documents (off-chain check before on-chain approval)
}

export type UserRole = 'tenant' | 'landlord' | null;

export interface UserProfile {
  address: string;
  isConnected: boolean;
  type: UserRole;
  salary: number;
  seniorityMonths: number;
  savingsTotal: number;
  guarantorIncome: number;
  missedPayments: number; // New: payment history
  householdSize: number; // New: family/roommate count
}

export enum ViewState {
  HOME = '/',
  LANDLORD = '/landlord',
  TENANT = '/tenant',
}