// Service section specific types

// Service item types
export interface ServiceItem {
  id: number;
  subcategories: string;
  imagePath: string;
  urlLink: string;
  status: string;
  urlLinks: string[];
  createDate: string;
}

// Application types
export interface ApplicationItem {
  id: number;
  title: string;
  detail: string;
  imageNumber: number;
  imagePath: string;
  applicationMainType: string;
  applicationType: string;
  createDate: string;
}

// Download form types
export interface DownloadFormItem {
  id: number;
  title: string;
  typeForm: string;
  typeMember: string;
  pdffile: string;
  filePath: string;
  file: string;
  createDate: string;
}

// Membership types
export interface MembershipItem {
  id: number;
  memberType: string;
  title: string;
  description: string;
  benefits: string[];
  requirements: string[];
  fees: string;
  status: boolean;
}

// Loan types
export interface LoanItem {
  id: number;
  loanType: string;
  title: string;
  description: string;
  interestRate: string;
  maxAmount: string;
  requirements: string[];
  conditions: string[];
  status: boolean;
}

// Deposit types
export interface DepositItem {
  id: number;
  depositType: string;
  title: string;
  description: string;
  interestRate: string;
  minAmount: string;
  terms: string[];
  conditions: string[];
  status: boolean;
}

// Insurance types
export interface InsuranceItem {
  id: number;
  insuranceType: string;
  title: string;
  description: string;
  coverage: string;
  premium: string;
  benefits: string[];
  conditions: string[];
  status: boolean;
}

// Welfare types
export interface WelfareItem {
  id: number;
  welfareType: string;
  title: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  amount: string;
  status: boolean;
}