// Home section specific types

// News types
export interface NewsItem {
  id: number;
  title: string;
  details: string;
  image: string;
  imagePath: string;
  pdffile: string;
  file: string;
  filepath: string;
  createDate: string;
}

// Slide types
export interface SlideItem {
  id: number;
  no: number;
  image: string;
  imagePath: string;
  url: string;
}

// Photo types
export interface PhotoItem {
  id: number;
  title: string;
  imagePath: string;
  albumId: number;
  description?: string;
  createDate: string;
}

// Video types
export interface VideoItem {
  id: number;
  title: string;
  videoPath: string;
  thumbnailPath?: string;
  description?: string;
  duration?: string;
  createDate: string;
}

// Interest rate types
export interface InterestItem {
  id: number;
  interestType: string;
  name: string;
  interestDate: string;
  conditions: string;
  interestRate: string;
  interestRateDual: string;
}

// Dialog box types
export interface DialogBoxItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  imagePath?: string;
  url?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

// Dialog box API response from backend
export interface DialogBoxApiResponse {
  Id: number;
  ImagePath: string | null;
  URLLink: string;
  IsActive: boolean;
}

// Election types
export interface ElectionItem {
  id: number;
  title: string;
  description: string;
  imagePath: string;
  documentPath?: string;
  electionDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  candidates?: CandidateItem[];
}

export interface CandidateItem {
  id: number;
  name: string;
  position: string;
  imagePath?: string;
  biography?: string;
  policies?: string[];
}

// Election search result types
export interface CandidateResult {
  Department: string;
  FieldNumber: string;
  FullName: string;
  Id: number;
  IdCard: string;
  Member: string;
  SequenceNumber: string;
}

// Support both old and new API response formats
export interface LegacyElectionApiResponse {
  data?: CandidateResult[];
  error?: string;
  message?: string;
}

export interface ModernElectionApiResponse {
  success: boolean;
  data: {
    data: CandidateResult[];
    total: number;
    search?: string;
  };
  message: string;
}

export type ElectionApiResponse = LegacyElectionApiResponse | ModernElectionApiResponse;

export interface ElectionFormErrors {
  search?: string;
}