// Common types shared across the application

// Question and Answer types
export interface QuestionItem {
  id: number;
  title: string;
  content: string;
  category: string;
  isAnswered: boolean;
  answerCount: number;
  createDate: string;
  author?: string;
}

export interface AnswerItem {
  id: number;
  questionId: number;
  content: string;
  isOfficial: boolean;
  createDate: string;
  author?: string;
}

// Contact and Complaint types
export interface ContactItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createDate: string;
}

export interface ComplaintItem {
  id: number;
  complainantName: string;
  email: string;
  phone?: string;
  subject: string;
  details: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'submitted' | 'investigating' | 'resolved' | 'closed';
  attachments?: string[];
  createDate: string;
  resolvedDate?: string;
}

// Operating Results types
export interface BusinessReportItem {
  id: number;
  title: string;
  image: string;
  imagePath: string;
  pdffile: string;
  file: string;
  filepath: string;
  reportYear: string;
  reportType: string;
  createDate: string;
}

export interface AssetsLiabilitiesItem {
  id: number;
  year: string;
  quarter?: string;
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
  netIncome: number;
  createDate: string;
}

// File and Document types
export interface FileItem {
  id: number;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: string;
  uploadDate: string;
  isPublic: boolean;
}

// Status and Configuration types
export interface StatusItem {
  id: number;
  feature: string;
  isEnabled: boolean;
  config?: Record<string, unknown>;
  lastModified: string;
}