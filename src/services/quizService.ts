import type { QuizPayload, SummaryOutput } from '../types/models';
import { apiClient } from './apiClient';
import { mockQuiz } from '../constants/mockData';

type ApiQuizPayload = {
  quiz_id: string;
  summary_id: string;
  title: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    answer_index: number;
  }>;
};

const mapApiQuiz = (value: ApiQuizPayload): QuizPayload => ({
  quizId: value.quiz_id,
  summaryId: value.summary_id,
  title: value.title,
  questions: value.questions.map((question) => ({
    id: question.id,
    question: question.question,
    options: question.options,
    answerIndex: question.answer_index,
  })),
});

export async function generateQuiz(summary: SummaryOutput): Promise<QuizPayload> {
  try {
    const text = [summary.overview, ...summary.sections.map((section) => section.content)].join('\n\n');
    const response = await apiClient.post<{ quiz: ApiQuizPayload }>('/api/v1/ai/quiz', {
      text,
      summary_id: summary.id,
      title: summary.title,
    });
    return mapApiQuiz(response.data.quiz);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate quiz from backend.';
    throw new Error(message);
  }
}

export async function submitQuizAttempt(quizId: string, summaryId: string, score: number, total: number, answers: number[]) {
  try {
    const response = await apiClient.post('/api/v1/ai/quiz/submit', {
      quiz_id: quizId,
      summary_id: summaryId,
      score,
      total,
      answers,
    });
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit quiz attempt.';
    throw new Error(message);
  }
}

export async function listQuizAttempts() {
  try {
    const response = await apiClient.get('/api/v1/ai/quiz/attempts');
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch quiz attempts.';
    throw new Error(message);
  }
}
