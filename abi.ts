
export const LEASE_ZERO_ABI = [
  {
    "inputs": [
      { "internalType": "uint32", "name": "incomeInput", "type": "uint32" },
      { "internalType": "uint32", "name": "seniorityInput", "type": "uint32" },
      { "internalType": "uint32", "name": "savingsInput", "type": "uint32" },
      { "internalType": "uint32", "name": "guarantorIncomeInput", "type": "uint32" },
      { "internalType": "uint32", "name": "missedPaymentsInput", "type": "uint32" },
      { "internalType": "uint32", "name": "householdSizeInput", "type": "uint32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "setProfile",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint32", "name": "minIncome", "type": "uint32" },
      { "internalType": "uint32", "name": "minSeniority", "type": "uint32" },
      { "internalType": "uint32", "name": "maxMissedPayments", "type": "uint32" },
      { "internalType": "uint32", "name": "maxOccupants", "type": "uint32" },
      { "internalType": "bool", "name": "requireSavings", "type": "bool" },
      { "internalType": "bool", "name": "requireGuarantor", "type": "bool" }
    ],
    "name": "createListing",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "listingId", "type": "uint256" }
    ],
    "name": "checkEligibility",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "applicationId", "type": "uint256" }
    ],
    "name": "requestPublicReveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "applicationId", "type": "uint256" },
      { "internalType": "bytes", "name": "abiEncodedResult", "type": "bytes" },
      { "internalType": "bytes", "name": "decryptionProof", "type": "bytes" }
    ],
    "name": "finalizePublicReveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "applicationId", "type": "uint256" }
    ],
    "name": "getEligibilityResult",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "tenant", "type": "address" }
    ],
    "name": "ProfileSealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256" }
    ],
    "name": "ListingCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "applicationId", "type": "uint256" }
    ],
    "name": "EligibilityChecked",
    "type": "event"
  }
];
