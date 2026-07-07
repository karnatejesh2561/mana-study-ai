import dotenv from 'dotenv';
import { DEFAULT_GEMINI_MODEL, geminiClient } from '../lib/gemini';

dotenv.config();

const extractTextFromResponse = (response: any): string => {
  if (!response) return '';
  if (typeof response === 'string') return response;
  if (typeof response.text === 'string') return response.text;
  if (Array.isArray(response.candidates) && response.candidates[0]?.content?.parts) {
    return response.candidates[0].content.parts.map((part: any) => part.text || '').join('');
  }
  if (typeof response?.output_text === 'string') return response.output_text;
  return JSON.stringify(response);
};

const buildFallbackSummary = (inputText: string, prefix = 'FULL SUMMARY') => {
  const fallbackText = inputText.length <= 2000 ? inputText : `${inputText.slice(0, 2000)}...`;
  return `${prefix} (fallback): ${fallbackText}`;
};

const extractBalancedJson = (text: string): string | null => {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const firstBracketIndex = Math.min(
    trimmed.indexOf('['),
    trimmed.indexOf('{'),
  );
  if (firstBracketIndex < 0) return null;

  const opening = trimmed[firstBracketIndex];
  const closing = opening === '[' ? ']' : '}';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = firstBracketIndex; i < trimmed.length; i += 1) {
    const char = trimmed[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === opening) {
      depth += 1;
    } else if (char === closing) {
      depth -= 1;
      if (depth === 0) {
        return trimmed.slice(firstBracketIndex, i + 1);
      }
    }
  }

  return null;
};

const tryParseQuizJson = (rawText: string) => {
  const normalized = rawText.replace(/```(?:json)?/gi, '').trim();
  const candidate = extractBalancedJson(normalized) || normalized;
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    throw new Error('Parsed quiz response is not a supported shape');
  } catch (err) {
    throw err;
  }
};

export const generateSummary = async (text: string) => {
  const inputText = typeof text === 'string' ? text : String(text ?? '');
  if (!geminiClient) {
    return buildFallbackSummary(inputText);
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: `Summarize the following text in a detailed, full-length summary. Include all key points, major sections, and important details from the source. Use complete sentences and multiple paragraphs if needed. Do not cut the summary short and make it as comprehensive as possible:\n\n${inputText}`,
    });

    const parsed = extractTextFromResponse(response);
    if (!parsed || parsed.trim().length === 0) {
      return buildFallbackSummary(inputText);
    }
    return parsed;
  } catch (err) {
    console.warn('Gemini summary error', err);
    return buildFallbackSummary(inputText);
  }
};

export const generateImageSummary = async (imageUrl: string, ocrText?: string) => {
  const safeUrl = typeof imageUrl === 'string' ? imageUrl : String(imageUrl ?? '');
  const safeOcrText = typeof ocrText === 'string' ? ocrText : '';
  if (!geminiClient) {
    return `IMAGE SUMMARY (fallback): ${safeUrl}`;
  }

  try {
    const promptParts = [
      `Inspect the image at this URL: ${safeUrl}.`,
      'Generate a detailed summary of what is visible in the image.',
      'Describe the scene, people, objects, environment, text, and any emotions or activities visible.',
      'Write the summary in full sentences and include as much useful detail as possible.',
    ];

    if (safeOcrText.trim()) {
      promptParts.push(`The extracted OCR text from the image is: ${safeOcrText}`);
      promptParts.push('Use the OCR text as additional context when summarizing the image.');
    }

    const response = await geminiClient.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: promptParts.join(' '),
    });

    const parsed = extractTextFromResponse(response);
    if (!parsed || parsed.trim().length === 0) {
      return `IMAGE SUMMARY (fallback): ${safeUrl}`;
    }
    return parsed;
  } catch (err) {
    console.warn('Gemini image summary error', err);
    return `IMAGE SUMMARY (fallback): ${safeUrl}`;
  }
};

const buildFallbackQuestions = (count: number) => {
  const questions = [] as any[];
  for (let i = 0; i < count; i++) {
    questions.push({
      id: `q-${Date.now()}-${i}`,
      question: `What is the main idea of section ${i + 1}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
    });
  }
  return questions;
};

const normalizeQuizQuestion = (item: any, index: number): any => {
  // Handle various Gemini response formats
  const question = item.question || item.q || item.title || `Question ${index + 1}`;
  const options = item.options || item.choices || item.answers || ['A', 'B', 'C', 'D'];
  const answer = item.answer || item.correct_answer || item.correctAnswer || (options[0] || 'A');
  
  return {
    id: item.id || `q-${Date.now()}-${index}`,
    question: String(question).trim(),
    options: Array.isArray(options) ? options.map((o: any) => String(o).trim()) : ['Option A', 'Option B', 'Option C', 'Option D'],
    answer: String(answer).trim(),
  };
};

export const generateQuiz = async (text: string, count = 5) => {
  const inputText = typeof text === 'string' ? text : String(text ?? '');
  if (!geminiClient) {
    return buildFallbackQuestions(count);
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: `Create ${count} quiz questions from the following text. Return a JSON array where each item has: question, options (array of 4 strings), and answer (one of the options). Make sure to match the answer exactly with one of the options.\n\nText:\n${inputText}`,
    });

    const parsed = extractTextFromResponse(response);

    try {
      const json = tryParseQuizJson(parsed);
      if (!Array.isArray(json) || json.length === 0) {
        console.warn('Quiz JSON is empty or not an array');
        return buildFallbackQuestions(count);
      }
      // Normalize all questions to ensure consistent format
      return json.map((item: any, index: number) => normalizeQuizQuestion(item, index));
    } catch (e) {
      console.warn('Failed to parse quiz JSON, returning fallback questions', e);
      return buildFallbackQuestions(count);
    }
  } catch (err) {
    console.warn('Gemini quiz error', err);
    return buildFallbackQuestions(count);
  }
};
