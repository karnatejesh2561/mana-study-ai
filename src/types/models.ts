export type UploadFileType = 'pdf' | 'docx' | 'pptx' | 'jpg' | 'jpeg' | 'png' | 'bmp' | 'tiff' | 'webp';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: UploadFileType;
  createdAt: string;
  storagePath?: string;
}

export interface SummarySection {
  title: string;
  content: string;
}

export interface SummaryOutput {
  id: string;
  documentId: string;
  title: string;
  subject?: string;
  pages?: number;
  overview: string;
  sections: SummarySection[];
  quickRevision: string[];
  vivaQuestions: string[];
  formulas: string[];
  concepts: string[];
  definitions: string[];
  examTips: string[];
  createdAt: string;
}

export interface SummaryListItem {
  id: string;
  fileName: string;
  sizeMb: number;
  date: string;
  snippet: string;
  extension: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export interface QuizAttempt {
  quizId: string;
  summaryId: string;
  score: number;
  total: number;
  selectedAnswers: number[];
  createdAt: string;
}

export interface QuizPayload {
  quizId: string;
  summaryId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface UserProfile {
  id: string;
  name: string;
  full_name?: string;
  email: string;
  language: string;
  darkMode: boolean;
}
