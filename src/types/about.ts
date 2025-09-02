// About section specific types

// Processed Society data for About components
export interface Society {
  id: number;
  imagePath: string;
  societyType: string;
  status: boolean;
}

// Note: BoardMember interface moved to organizational.ts
// Import it from: import { BoardMember } from "@/types/organizational";

// Organizational structure types
export interface OrganizationalItem {
  id: number;
  title: string;
  imagePath: string;
  type: string;
  status: boolean;
  createDate: string;
}

// Message/Policy types
export interface MessageItem {
  id: number;
  title: string;
  content: string;
  imagePath?: string;
  type: string;
  status: boolean;
  createDate: string;
}

// Ethics and policy types
export interface EthicsItem {
  id: number;
  title: string;
  content: string;
  imagePath?: string;
  policyType: string;
  status: boolean;
  createDate: string;
}