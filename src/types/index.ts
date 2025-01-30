// types/index.ts
export interface Slide {
  id: number;
  no: number;
  image: string;
  imagePath: string;
  url: string;
}

export interface News {
  id: number;
  title: string;
  details: string;
  image: string;
  imagePath: string;
  pdffile: string;
  File: string;
  filepath: string;
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
  filePath: string;
  File: string;
  createDate: string;
}

export interface ReportBusiness {
  id: number;
  title: string;
  image: string;
  imagePath: string;
  pdffile: string;
  File: string;
  filepath: string;
  Title: string;
  createDate: string;
}
export interface Services {
  Id: number;
  Subcategories: string;
  ImagePath: string;
  URLLink: string;
  createDate: string;
  id: number;
  imagePath: string;
  subcategories: string;
  urlLink: string;
  status: string;
  urlLinks: string[];
}

export interface Application {
  Id: number;
  Title: string;
  Detail: string;
  ImageNumber: number;
  ImagePath: string;
  ApplicationMainType: string;
  ApplicationType: string;
  CreateDate: string;
  id: number;
  title: string;
  detail: string;
  imageNumber: number;
  imagePath: string;
  applicationMainType: string;
  applicationType: string;
  createDate: string;
  
}