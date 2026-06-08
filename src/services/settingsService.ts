// Settings Service
// Mock implementation for business settings and logo management
// TODO: Replace with real API calls

export interface BusinessSettings {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  logo?: string; // Base64 or URL
  defaultTaxRate: number;
  paymentTerms: number;
  invoicePrefix?: string;
  receiptPrefix?: string;
  invoiceNotes: string;
  footerNote?: string;
}

const SETTINGS_KEY = 'paytraka_settings';

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'Demo Business',
  email: 'demo@business.com',
  phone: '+234 800 000 0000',
  address: 'Lagos, Nigeria',
  taxId: '',
  logo: '',
  defaultTaxRate: 7.5,
  paymentTerms: 30,
  invoicePrefix: 'INV',
  receiptPrefix: 'RCP',
  invoiceNotes: 'Thank you for your business',
  footerNote: 'This document was generated with Paytraka Invoice Nexus.'
};

/**
 * Get business settings
 * TODO: Replace with real API call
 */
export const getSettings = async (): Promise<BusinessSettings> => {
  const settingsStr = localStorage.getItem(SETTINGS_KEY);
  if (settingsStr) {
    try {
      return JSON.parse(settingsStr);
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

/**
 * Update business settings
 * TODO: Replace with real API call
 */
export const updateSettings = async (settings: Partial<BusinessSettings>): Promise<void> => {
  const currentSettings = await getSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
};

/**
 * Upload logo
 * TODO: Replace with real file upload API
 */
export const uploadLogo = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
