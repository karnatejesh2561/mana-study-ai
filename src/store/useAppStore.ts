import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizAttempt, QuizPayload, SummaryOutput, UploadedDocument, UserProfile } from '../types/models';
import { fetchSummaries as apiFetchSummaries, deleteSummary as apiDeleteSummary } from '../services/summaryService';

interface AppState {
  profile: UserProfile;
  selectedDocument: UploadedDocument | null;
  summaries: SummaryOutput[];
  currentSummary: SummaryOutput | null;
  currentQuiz: QuizPayload | null;
  quizAttempts: QuizAttempt[];
  backendHost: string | null;
  backendPort: number;
  subscription: {
    plan: string;
    price: number;
    currency: string;
    renewal: string | null;
    features: string[];
  };
  setProfile: (profile: Partial<UserProfile>) => void;
  setSelectedDocument: (doc: UploadedDocument | null) => void;
  addSummary: (summary: SummaryOutput) => void;
  setCurrentSummary: (summary: SummaryOutput | null) => void;
  setCurrentQuiz: (quiz: QuizPayload | null) => void;
  addQuizAttempt: (attempt: QuizAttempt) => void;
  deleteSummary: (summaryId: string) => void;
  loadSummariesFromBackend: () => Promise<void>;
  syncLocalToBackend: () => Promise<void>;
  setBackendConfig: (host: string | null, port: number) => void;
  setSubscription: (sub: Partial<{ plan: string; price: number; currency: string; renewal: string | null; features: string[] }>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: {
    id: 'user-1',
    name: 'Student',
    full_name: 'Student',
    email: 'student@example.com',
    language: 'English',
    darkMode: false,
  },
  selectedDocument: null,
  summaries: [],
  currentSummary: null,
  currentQuiz: null,
  quizAttempts: [],
  backendHost: null,
  backendPort: 4000,
  subscription: {
    plan: 'Free',
    price: 0,
    currency: 'INR',
    renewal: null,
    features: ['Basic summaries', 'Limited uploads'],
  },
  setProfile: (profile) =>
    set((state) => ({
      profile: { ...state.profile, ...profile },
    })),
  setSelectedDocument: (doc) => set({ selectedDocument: doc }),
  addSummary: (summary) =>
    set((state) => {
      const newSummaries = [summary, ...state.summaries];
      // persist
      AsyncStorage.setItem('summaries', JSON.stringify(newSummaries)).catch(() => {});
      return { summaries: newSummaries, currentSummary: summary };
    }),
  setCurrentSummary: (summary) => set({ currentSummary: summary }),
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  addQuizAttempt: (attempt) =>
    set((state) => ({
      quizAttempts: [attempt, ...state.quizAttempts],
    })),
  deleteSummary: (summaryId) =>
    set((state) => {
      const remaining = state.summaries.filter((summary) => summary.id !== summaryId);
      AsyncStorage.setItem('summaries', JSON.stringify(remaining)).catch(() => {});
      // fire-and-forget backend delete
      apiDeleteSummary(summaryId).catch(() => {});
      return {
        summaries: remaining,
        currentSummary: state.currentSummary?.id === summaryId ? null : state.currentSummary,
      };
    }),
  loadSummariesFromBackend: async () => {
    try {
      const back = await apiFetchSummaries();
      if (back && back.length) {
        // replace local list with backend list and persist
        AsyncStorage.setItem('summaries', JSON.stringify(back)).catch(() => {});
        useAppStore.setState({ summaries: back });
      }
    } catch (e) {
      // ignore
    }
  },
  loadQuizAttemptsFromBackend: async () => {
    try {
      const { listQuizAttempts } = await import('../services/quizService');
      const back = await listQuizAttempts();
      if (back && Array.isArray(back)) {
        set({ quizAttempts: back });
      }
    } catch (e) {
      // ignore
    }
  },
  syncLocalToBackend: async () => {
    try {
      const state = useAppStore.getState();
      const local = state.summaries || [];
      // upload summaries that look local (id starts with 'sum-' or documentId starts with 'doc-')
      for (const s of local) {
        if (typeof s.id === 'string' && s.id.startsWith('sum-')) {
          try {
            await (await import('../services/summaryService')).uploadLocalSummary(s);
          } catch (e) {
            // continue
          }
        }
      }
      // refresh from backend after sync
      await apiFetchSummaries().then((back) => {
        if (back && back.length) {
          AsyncStorage.setItem('summaries', JSON.stringify(back)).catch(() => {});
          useAppStore.setState({ summaries: back });
        }
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  },
  setBackendConfig: (host, port) => {
    const config = { backendHost: host, backendPort: port };
    AsyncStorage.setItem('backendConfig', JSON.stringify(config)).catch(() => {});
    set(config);
  },
  setSubscription: (sub) => set((state) => ({ subscription: { ...state.subscription, ...sub } })),
}));

// Hydrate persisted summaries on startup
(async () => {
  try {
    const raw = await AsyncStorage.getItem('summaries');
    if (raw) {
      const parsed: SummaryOutput[] = JSON.parse(raw);
      // directly set the store state
      useAppStore.setState({ summaries: parsed });
    }
  } catch (e) {
    // ignore
  }
})();
