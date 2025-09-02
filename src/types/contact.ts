export interface Contact {
  Id: number;
  Name: string;
  Doh: number;
  Coop: number;
  Mobile: string;
}

export interface ContactClientProps {
  initialData: Contact[];
}