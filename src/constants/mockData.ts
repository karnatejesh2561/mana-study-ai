import type { QuizPayload, SummaryOutput } from '../types/models';

export const mockSummary: SummaryOutput = {
  id: 'sum-1',
  documentId: 'doc-1',
  title: 'Data Structures',
  subject: 'Computer Science',
  pages: 8,
  overview: 'Data structures help in organizing data for efficient storage, retrieval, and processing.',
  createdAt: new Date().toISOString(),
  sections: [
    {
      title: '1. Introduction',
      content: 'Data structures are ways to organize and store data so operations are faster and predictable.',
    },
    {
      title: '2. Types of Data Structures',
      content: 'Linear: Array, Linked List, Stack, Queue. Non-linear: Trees, Graphs, Hash tables.',
    },
    {
      title: '3. Array',
      content: 'A fixed-size collection of similar elements stored in contiguous memory locations.',
    },
  ],
  quickRevision: [
    'Linear: Array, Linked List, Stack, Queue',
    'Non-Linear: Tree, Graph, Hash map',
    'Stack follows LIFO and Queue follows FIFO',
  ],
  vivaQuestions: [
    'Difference between stack and queue?',
    'When should you use linked list over array?',
  ],
  formulas: ['Array Address = Base + (index * element_size)'],
  concepts: ['Abstraction', 'Traversal', 'Time Complexity'],
  definitions: ['Stack: Last In First Out data structure'],
  examTips: ['Always state time complexity and space complexity.'],
};

export const mockQuiz: QuizPayload = {
  quizId: 'quiz-1',
  summaryId: 'sum-1',
  title: 'Data Structures Notes.pdf',
  questions: [
    {
      id: 'q1',
      question: 'What are Data Structures?',
      options: ['Ways to organize and store data', 'Programming language', 'Type of computer', 'None'],
      answerIndex: 0,
    },
    {
      id: 'q2',
      question: 'Which of the following is a Linear Data Structure?',
      options: ['Tree', 'Graph', 'Stack', 'Hash Table'],
      answerIndex: 2,
    },
    {
      id: 'q3',
      question: 'Stack follows which principle?',
      options: ['FIFO', 'LIFO', 'Both', 'None'],
      answerIndex: 1,
    },
  ],
};
