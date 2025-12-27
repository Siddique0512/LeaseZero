import { Application } from '../types';

const APP_STORAGE_KEY = 'leasezero_applications';

export const getApplications = (): Application[] => {
  const data = localStorage.getItem(APP_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveApplication = (app: Application) => {
  const apps = getApplications();
  const index = apps.findIndex(a => a.id === app.id);
  if (index >= 0) {
    apps[index] = app;
  } else {
    apps.push(app);
  }
  localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(apps));
};

export const getApplicationsForLandlord = (propertyIds: string[]): Application[] => {
  const apps = getApplications();
  return apps.filter(a => propertyIds.includes(a.propertyId));
};

export const getApplicationsForTenant = (tenantAddress: string): Application[] => {
  const apps = getApplications();
  // Simple case-insensitive match for addresses
  return apps.filter(a => a.tenantAddress.toLowerCase() === tenantAddress.toLowerCase());
};
