// Question related types and interfaces

export interface Question {
  Id: number;
  Title: string;
  Name: string;
  AnswerCount: number;
  ViewCount: number;
  [key: string]: string | number; // Add index signature for compatibility with Record<string, unknown>
}

export interface QuestionFormData {
  name: string;
  memberNumber: string;
  title: string;
  body: string;
  [key: string]: string; // Add index signature for compatibility with Record<string, unknown>
}

export interface QuestionFormErrors {
  title?: string;
  body?: string;
  [key: string]: string | undefined; // Add index signature for compatibility
}

export interface QuestionApiError {
  message?: string;
}

export interface QuestionApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}

export interface QuestionDetail {
  Id: number;
  Title: string;
  Body: string;
  CreatedAt: string;
  Name: string;
  MemberNumber: string;
  ViewCount: number;
  AnswerCount: number;
}

export interface Answer {
  Id: number;
  Body: string;
  Name: string;
  CreatedAt: string;
}

export interface QuestionDetailResponse {
  question: QuestionDetail;
  answers: Answer[];
}

export interface AnswerFormData {
  name: string;
  body: string;
  [key: string]: string; // Add index signature for compatibility with Record<string, unknown>
}

export interface AnswerFormErrors {
  body?: string;
  [key: string]: string | undefined; // Add index signature for compatibility
}