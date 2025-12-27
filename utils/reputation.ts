import { Application, Property } from '../types';

export interface Reputation {
  score: number;
  status: 'Trusted' | 'Neutral' | 'Caution';
  color: 'green' | 'yellow' | 'red';
}

export const getReputationBadge = (score: number): Reputation => {
  if (score >= 80) {
    return { score, status: 'Trusted', color: 'green' };
  }
  if (score >= 60) {
    return { score, status: 'Neutral', color: 'yellow' };
  }
  return { score, status: 'Caution', color: 'red' };
};

export const calculateTenantReputation = (tenantAddress: string, allApps: Application[]): Reputation => {
  const myApps = allApps.filter(a => a.tenantAddress.toLowerCase() === tenantAddress.toLowerCase());
  const total = myApps.length;

  if (total === 0) {
    return getReputationBadge(75); // Neutral starting score
  }

  const completed = myApps.filter(a => a.status === 'acknowledged').length;
  const docsSubmitted = myApps.filter(a => ['docs_submitted', 'approved', 'acknowledged'].includes(a.status)).length;
  const withdrawn = myApps.filter(a => a.status === 'withdrawn').length;
  const rejectedByLandlord = myApps.filter(a => a.status === 'rejected').length;

  // Simple scoring: start at 75, reward good actions, penalize negative ones.
  let score = 75;
  score += completed * 5;      // Strong positive signal
  score += docsSubmitted * 2;  // Good signal
  score -= withdrawn * 10;     // Strong negative signal
  score -= rejectedByLandlord * 2; // Minor negative signal (could be landlord's fault)

  const finalScore = Math.max(0, Math.min(100, score));
  return getReputationBadge(finalScore);
};

export const calculateLandlordReputation = (landlordPropertyIds: string[], allApps: Application[]): Reputation => {
  const landlordApps = allApps.filter(a => landlordPropertyIds.includes(a.propertyId));

  const verificationsRequested = landlordApps.filter(a => 
    ['verification_requested', 'docs_submitted', 'approved', 'acknowledged', 'rejected'].includes(a.status)
  ).length;

  if (verificationsRequested === 0) {
    return getReputationBadge(75); // Neutral starting score
  }

  const approved = landlordApps.filter(a => ['approved', 'acknowledged'].includes(a.status)).length;
  const rejectedAfterDocs = landlordApps.filter(a => a.status === 'rejected').length; // Simplified for demo

  // Ratio-based: a good landlord approves more than they reject after verification.
  const approvalRatio = approved / verificationsRequested;
  const rejectionPenalty = rejectedAfterDocs / verificationsRequested;

  let score = 50 + (approvalRatio * 50) - (rejectionPenalty * 25);
  
  const finalScore = Math.max(0, Math.min(100, score));
  return getReputationBadge(finalScore);
};
