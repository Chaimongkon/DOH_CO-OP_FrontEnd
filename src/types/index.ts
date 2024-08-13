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
    createDate: string;
  }