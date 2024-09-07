// types/index.ts
export interface Slide {
  id: number;
  no: number;
  image: string;
  url: string;
}

export interface News {
  id: number;
  title: string;
  details: string;
  image: string;
  pdffile: string;
  File: string;
  Title: string;
  createDate: string;
}
export interface Interest {
  id: number;
  interestType: string;
  name: string;
  interestDate: string;
  conditions: string;
  interestRate: string;
  interesrRateDual: string;
}

export interface DownloadForm {
  id: number;
  title: string;
  typeForm: string;
  typeMember: string;
  pdffile: string;
  File: string;
  createDate: string;
}