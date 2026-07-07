import { pick, types } from '@react-native-documents/picker';
import { apiClient, waitForBackendReady } from './apiClient';
import { supabase } from './supabaseClient';
import type { SummaryOutput, UploadedDocument } from '../types/models';

type ApiSummary = {
  id: string;
  document_id: string;
  title: string;
  subject?: string;
  pages?: number;
  overview: string;
  sections: Array<{ title: string; content: string }>;
  quick_revision: string[];
  viva_questions: string[];
  formulas: string[];
  concepts: string[];
  definitions: string[];
  exam_tips: string[];
  created_at: string;
};

const mapApiSummary = (value: ApiSummary): SummaryOutput => ({
  id: value.id,
  documentId: value.document_id,
  title: value.title,
  subject: value.subject,
  pages: value.pages,
  overview: value.overview,
  sections: value.sections,
  quickRevision: value.quick_revision,
  vivaQuestions: value.viva_questions,
  formulas: value.formulas,
  concepts: value.concepts,
  definitions: value.definitions,
  examTips: value.exam_tips,
  createdAt: value.created_at,
});

const toUploadFileType = (name: string): UploadedDocument['type'] => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  if (ext === 'pptx' || ext === 'ppt') return 'pptx';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'bmp') return 'bmp';
  if (ext === 'tiff' || ext === 'tif') return 'tiff';
  if (ext === 'webp') return 'webp';
  return 'png';
};

export async function pickStudyFile(): Promise<UploadedDocument | null> {
  try {
    const [file] = await pick({
      presentationStyle: 'fullScreen',
      type: [
        types.pdf,
        types.docx,
        types.pptx,
        types.images,
      ],
    });

    return {
      id: `doc-${Date.now()}`,
      name: file.name ?? 'study-material',
      size: file.size ?? 0,
      createdAt: new Date().toISOString(),
      type: toUploadFileType(file.name ?? ''),
      storagePath: file.uri,
    };
  } catch {
    return null;
  }
}

const getMimeType = (type: UploadedDocument['type']) => {
  switch (type) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'bmp':
      return 'image/bmp';
    case 'tiff':
      return 'image/tiff';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
};

export async function generateSummary(document: UploadedDocument): Promise<SummaryOutput> {
  const storagePath = document.storagePath ?? document.id;
  if (!storagePath) {
    throw new Error('No file selected');
  }

  try {
    await waitForBackendReady();
  } catch (e) {
    // ignore - the request will report if backend is unavailable
  }

  // Upload the file to the backend, extract text, then call Gemini summary.
  const uploadForm = new FormData();
  uploadForm.append('file', {
    uri: storagePath,
    name: document.name,
    type: getMimeType(document.type),
  } as any);

  const uploadResponse = await apiClient.post<{ upload: any; url: string; text: string }>('/api/v1/upload', uploadForm);

  const extractedText = uploadResponse.data?.text || `Uploaded document: ${document.name}`;
  const imageUrl = uploadResponse.data?.url;
  const isImageDocument = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp'].includes(document.type);

  const payload: Record<string, any> = {
    document_id: document.id,
    title: document.name,
  };

  if (isImageDocument && imageUrl) {
    payload.image_url = imageUrl;
  }

  if (!payload.image_url || extractedText) {
    payload.text = extractedText;
  }

  const summaryResponse = await apiClient.post('/api/v1/ai/summary', payload);

  const apiSummary = summaryResponse.data;

  if (apiSummary && typeof apiSummary === 'object' && 'title' in apiSummary) {
    return mapApiSummary(apiSummary as ApiSummary);
  }

  const rawSummary = typeof apiSummary === 'string' ? apiSummary : apiSummary?.summary ?? JSON.stringify(apiSummary);

  return {
    id: `sum-${Date.now()}`,
    documentId: document.id,
    title: document.name,
    subject: 'General',
    pages: 0,
    overview: rawSummary,
    sections: [{ title: 'Summary', content: rawSummary }],
    quickRevision: [],
    vivaQuestions: [],
    formulas: [],
    concepts: [],
    definitions: [],
    examTips: [],
    createdAt: new Date().toISOString(),
  } as SummaryOutput;
}

export async function generateSummaryFromText(text: string, title?: string): Promise<SummaryOutput | { raw?: string } > {
  try {
    const body = { text, title };
    // Edge function path - adjust base path as needed when deployed.
    const response = await apiClient.post('/edge/generate_summary', body);
    // If the edge function returned parsed summary fields, map to SummaryOutput-like shape
    const data = response.data;
    if (data && data.title) {
      return {
        id: `sum-${Date.now()}`,
        documentId: `doc-${Date.now()}`,
        title: data.title,
        subject: data.subject ?? 'General',
        pages: data.pages ?? 0,
        overview: data.overview ?? '',
        sections: data.sections ?? [],
        quickRevision: data.quick_revision ?? data.quickRevision ?? [],
        vivaQuestions: data.viva_questions ?? data.vivaQuestions ?? [],
        formulas: data.formulas ?? [],
        concepts: data.concepts ?? [],
        definitions: data.definitions ?? [],
        examTips: data.exam_tips ?? data.examTips ?? [],
        createdAt: new Date().toISOString(),
      } as SummaryOutput;
    }

    // raw fallback
    return { raw: data?.raw ?? JSON.stringify(data) };
  } catch (err) {
    console.error('Edge generate failed', err);
    throw err;
  }
}

/**
 * Fallback summary generation path.
 * Currently uses the same backend upload and summary flow as the primary generateSummary path.
 */
export async function uploadToSupabaseAndProcess(document: UploadedDocument): Promise<SummaryOutput | { raw?: string } > {
  try {
    return await generateSummary(document);
  } catch (err) {
    console.error('uploadToSupabaseAndProcess failed', err);
    throw err;
  }
}

export async function directUploadToWorker(document: UploadedDocument): Promise<SummaryOutput | { raw?: string } > {
  return generateSummary(document);
}
export async function fetchSummaries(): Promise<SummaryOutput[]> {
  try {
    const response = await apiClient.get<ApiSummary[]>('/api/v1/ai/summaries');
    return response.data.map(mapApiSummary);
  } catch {
    return [];
  }
}

export async function deleteSummary(summaryId: string): Promise<void> {
  await apiClient.delete(`/api/v1/ai/summary/${summaryId}`);
}

export async function uploadLocalSummary(summary: SummaryOutput): Promise<any> {
  // Map to server format expected by import endpoint
  const payload = {
    documentId: summary.documentId,
    title: summary.title,
    subject: summary.subject,
    pages: summary.pages,
    overview: summary.overview,
    sections: summary.sections,
    quickRevision: summary.quickRevision,
    vivaQuestions: summary.vivaQuestions,
    formulas: summary.formulas,
    concepts: summary.concepts,
    definitions: summary.definitions,
    examTips: summary.examTips,
    createdAt: summary.createdAt,
  };

  const resp = await apiClient.post('/api/v1/ai/summaries/import', payload);
  return resp.data;
}

export function getSummaryPdfUrl(summaryId: string): string {
  return `${apiClient.defaults.baseURL?.replace(/\/$/, '') || ''}/api/v1/ai/summary/${encodeURIComponent(summaryId)}/pdf`;
}
