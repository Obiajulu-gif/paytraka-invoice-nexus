"use client";

export type OnboardingStep = "signup" | "verify-email" | "business-details" | "tax-profile" | "bank-details" | "preferences" | "review" | "complete";

export type SignupData = {
  userId?: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  phoneNumber: string;
  companyName: string;
  tradingName: string;
  emailVerified: boolean;
};

export type BusinessDetailsData = {
  businessName: string;
  tradingName: string;
  businessType: string;
  industry: string;
  businessDescription: string;
  companySize: string;
  annualTurnover: string;
  taxId: string;
  rcNumber: string;
  contactPerson: string;
  businessEmail: string;
  city: string;
  state: string;
  country: string;
  lga: string;
  postalCode: string;
  phoneNumber: string;
  businessAddress: string;
};

export type TaxProfileData = {
  tin: string;
  cacNumber: string;
  vatStatus: string;
  vatRate: string;
  businessSector: string;
  taxOffice: string;
  environmentPreference: string;
  submissionPreference: string;
  providerPreference: string;
  nrsBusinessIdTest: string;
  nrsBusinessIdLive: string;
  nrsApiKey: string;
  nrsApiSecret: string;
  nrsEntityId: string;
  nrsPublicKey: string;
  nrsCertificate: string;
};

export type BankDetailsData = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  paymentMethod: string;
  generatePaymentLink: boolean;
  displayBankDetails: boolean;
};

export type PreferencesData = {
  accentColor: string;
  invoiceTemplate: string;
  confirmedAccuracy: boolean;
};

export type OnboardingState = {
  currentStep: OnboardingStep;
  completed: boolean;
  verificationCode: string;
  signup: SignupData;
  businessDetails: BusinessDetailsData;
  taxProfile: TaxProfileData;
  bankDetails: BankDetailsData;
  preferences: PreferencesData;
  updatedAt: string;
};

export type OnboardingStateUpdate = Partial<Omit<OnboardingState, "signup" | "businessDetails" | "taxProfile" | "bankDetails" | "preferences">> & {
  signup?: Partial<SignupData>;
  businessDetails?: Partial<BusinessDetailsData>;
  taxProfile?: Partial<TaxProfileData>;
  bankDetails?: Partial<BankDetailsData>;
  preferences?: Partial<PreferencesData>;
};

const STORAGE_KEY = "paytraka_onboarding_workspace";

export const defaultOnboardingState: OnboardingState = {
  currentStep: "signup",
  completed: false,
  verificationCode: "246810",
  signup: {
    userId: "",
    firstName: "",
    lastName: "",
    workEmail: "",
    phoneNumber: "",
    companyName: "",
    tradingName: "",
    emailVerified: false,
  },
  businessDetails: {
    businessName: "",
    tradingName: "",
    businessType: "Limited Liability Company",
    industry: "",
    businessDescription: "",
    companySize: "",
    annualTurnover: "",
    taxId: "",
    rcNumber: "",
    contactPerson: "",
    businessEmail: "",
    city: "Somolu",
    state: "Lagos",
    country: "Nigeria",
    lga: "",
    postalCode: "",
    phoneNumber: "",
    businessAddress: "",
  },
  taxProfile: {
    tin: "",
    cacNumber: "",
    vatStatus: "Registered",
    vatRate: "7.5%",
    businessSector: "",
    taxOffice: "",
    environmentPreference: "Test/Sandbox first",
    submissionPreference: "Submit manually after review",
    providerPreference: "",
    nrsBusinessIdTest: "",
    nrsBusinessIdLive: "",
    nrsApiKey: "",
    nrsApiSecret: "",
    nrsEntityId: "",
    nrsPublicKey: "",
    nrsCertificate: "",
  },
  bankDetails: {
    bankName: "",
    accountNumber: "",
    accountName: "",
    paymentMethod: "Bank Transfer (Instant Settlement)",
    generatePaymentLink: false,
    displayBankDetails: true,
  },
  preferences: {
    accentColor: "Blue",
    invoiceTemplate: "Modern",
    confirmedAccuracy: false,
  },
  updatedAt: "",
};

export function getOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return defaultOnboardingState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultOnboardingState;
    }

    return {
      ...defaultOnboardingState,
      ...JSON.parse(stored),
      signup: { ...defaultOnboardingState.signup, ...JSON.parse(stored).signup },
      businessDetails: { ...defaultOnboardingState.businessDetails, ...JSON.parse(stored).businessDetails },
      taxProfile: { ...defaultOnboardingState.taxProfile, ...JSON.parse(stored).taxProfile },
      bankDetails: { ...defaultOnboardingState.bankDetails, ...JSON.parse(stored).bankDetails },
      preferences: { ...defaultOnboardingState.preferences, ...JSON.parse(stored).preferences },
    };
  } catch {
    return defaultOnboardingState;
  }
}

export function saveOnboardingState(update: OnboardingStateUpdate): OnboardingState {
  const current = getOnboardingState();
  const next = {
    ...current,
    ...update,
    signup: { ...current.signup, ...update.signup },
    businessDetails: { ...current.businessDetails, ...update.businessDetails },
    taxProfile: { ...current.taxProfile, ...update.taxProfile },
    bankDetails: { ...current.bankDetails, ...update.bankDetails },
    preferences: { ...current.preferences, ...update.preferences },
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

export function resetOnboardingState() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function maskAccountNumber(value: string) {
  if (!value) return "Not provided";
  return value.length <= 4 ? value : `******${value.slice(-4)}`;
}
