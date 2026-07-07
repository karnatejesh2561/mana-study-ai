import { Request, Response } from 'express';
import { generateSummary, generateImageSummary, generateQuiz } from '../services/aiService';
import logger from '../logger';
import { supabase } from '../services/supabaseClient';

const isUuid = (value: any): value is string => typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
const normalizeDocumentId = (value: any): string | null => (isUuid(value) ? value : null);

export const summary = async (req: Request, res: Response) => {
  try {
    const { text, image_url, document_id, title } = req.body;
    if (!text && !image_url) return res.status(400).json({ error: 'Missing text or image_url' });

    const s = image_url
      ? await generateImageSummary(image_url, text)
      : await generateSummary(text ?? '');
    const summaryText = typeof s === 'string' ? s : JSON.stringify(s);
    const safeSummaryText = summaryText || `SUMMARY: ${String(text).slice(0, 300)}...`;

    const result = {
      id: `sum-${Date.now()}`,
      document_id: document_id || `doc-${Date.now()}`,
      title: title || 'Generated Summary',
      subject: 'General',
      pages: 0,
      overview: summaryText,
      sections: [{ title: 'Summary', content: summaryText }],
      quick_revision: [],
      viva_questions: [],
      formulas: [],
      concepts: [],
      definitions: [],
      exam_tips: [],
      created_at: new Date().toISOString(),
    };

    // Persist summary to Supabase if possible
    try {
      let documentIdToUse = normalizeDocumentId(result.document_id);
      if (!documentIdToUse) {
        const docPayload: any = {
          file_name: result.title,
          file_type: image_url ? 'image' : 'unknown',
          storage_path: image_url || '',
          public_url: image_url || '',
          status: 'generated',
        };
        const { data: docData, error: docErr } = await supabase.from('documents').insert(docPayload).select('id').limit(1).single();
        if (!docErr && docData && (docData as any).id) {
          documentIdToUse = normalizeDocumentId((docData as any).id);
        }
      }

      const insertPayload: any = {
        title: result.title,
        subject: result.subject,
        pages: result.pages,
        overview: result.overview,
        sections: result.sections,
        quick_revision: result.quick_revision,
        viva_questions: result.viva_questions,
        formulas: result.formulas,
        concepts: result.concepts,
        definitions: result.definitions,
        exam_tips: result.exam_tips,
      };
      if (documentIdToUse) {
        insertPayload.document_id = documentIdToUse;
      } else {
        insertPayload.document_id = null;
      }

      const { data: inserted, error: insertErr } = await supabase.from('summaries').insert(insertPayload).select('*').limit(1).single();
      if (insertErr) {
        logger.warn('Failed to persist summary to Supabase', { error: insertErr });
        return res.json(result);
      }

      return res.json(inserted);
    } catch (e) {
      logger.warn('Error persisting summary', { err: e });
      return res.json(result);
    }
  } catch (err: any) {
    logger.error('Summary error', {
      message: err?.message ?? String(err),
      stack: err?.stack,
      err,
    });
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
};

export const submitQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { quiz_id, summary_id, score, total, answers } = req.body;
    if (!quiz_id || !summary_id || typeof score !== 'number' || typeof total !== 'number') {
      return res.status(400).json({ error: 'Missing required fields: quiz_id, summary_id, score, total' });
    }

    const insertPayload: any = {
      quiz_id,
      summary_id,
      score,
      total,
      percentage: Math.round((score / Math.max(total, 1)) * 100),
      answers: Array.isArray(answers) ? answers : [],
    };

    const { data, error } = await supabase.from('quiz_attempts').insert(insertPayload).select('*').limit(1).single();
    if (error) {
      logger.error('Failed to save quiz attempt', { error: JSON.stringify(error) });
      return res.status(500).json({ error: 'Failed to save quiz attempt', details: error });
    }

    return res.json({ success: true, data });
  } catch (err: any) {
    logger.error('Submit quiz attempt error', { message: err?.message, err });
    return res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
};

export const listQuizAttempts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('quiz_attempts').select('*').order('attempted_at', { ascending: false });
    if (error) {
      logger.warn('Failed to fetch quiz attempts', { error });
      return res.status(500).json({ error: 'Failed to fetch quiz attempts' });
    }
    return res.json(data || []);
  } catch (err: any) {
    logger.error('List quiz attempts error', { message: err?.message, err });
    return res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
};

export const quiz = async (req: Request, res: Response) => {
  try {
    const { text, count, summary_id, title } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const quizItems = await generateQuiz(text, count || 5);
    
    if (!Array.isArray(quizItems) || quizItems.length === 0) {
      logger.warn('generateQuiz returned empty or non-array result', { quizItems });
      return res.status(500).json({ error: 'Failed to generate quiz questions' });
    }

    const questions = quizItems.map((item: any, index: number) => {
      try {
        const question = item.question || `Question ${index + 1}`;
        const options = Array.isArray(item.options) ? item.options : ['Option A', 'Option B', 'Option C', 'Option D'];
        const answer = item.answer || (options[0] || 'Option A');
        
        // Find the index of the correct answer in the options
        const answerIndex = options.findIndex((option: any) => 
          String(option).trim().toLowerCase() === String(answer).trim().toLowerCase()
        );
        
        return {
          id: item.id || `q-${Date.now()}-${index}`,
          question: String(question).trim(),
          options: options.map((o: any) => String(o).trim()),
          answer_index: answerIndex >= 0 ? answerIndex : 0,
        };
      } catch (mapErr) {
        logger.warn(`Failed to map quiz item ${index}`, { item, error: mapErr });
        return {
          id: `q-${Date.now()}-${index}`,
          question: `Question ${index + 1}`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer_index: 0,
        };
      }
    });

    // Store quiz in database to get a real UUID
    const quizPayload: any = {
      title: title || 'Generated Quiz',
      questions,
    };
    if (summary_id) {
      quizPayload.summary_id = summary_id;
    }

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .insert(quizPayload)
      .select('*')
      .limit(1)
      .single();

    if (quizError) {
      logger.error('Failed to save quiz', { error: quizError });
      // Return fallback response without saving
      return res.json({
        quiz: {
          quiz_id: `quiz-${Date.now()}`,
          summary_id: summary_id || `sum-${Date.now()}`,
          title: title || 'Generated Quiz',
          questions,
        },
      });
    }

    return res.json({
      quiz: {
        quiz_id: quizData.id,
        summary_id: quizData.summary_id || summary_id,
        title: quizData.title,
        questions,
      },
    });
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    logger.error('Quiz error', { 
      message: errorMsg,
      stack: err?.stack,
      err 
    });
    return res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

export const listSummaries = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('summaries').select('*').order('created_at', { ascending: false });
    if (error) {
      logger.warn('Failed to fetch summaries', { error });
      return res.status(500).json({ error: 'Failed to fetch summaries' });
    }
    return res.json(data || []);
  } catch (err) {
    logger.error('List summaries error', { err });
    return res.status(500).json({ error: 'Failed to fetch summaries' });
  }
};

export const deleteSummaryController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing summary id' });
    const { error } = await supabase.from('summaries').delete().eq('id', id);
    if (error) {
      logger.warn('Failed to delete summary', { id, error });
      return res.status(500).json({ error: 'Failed to delete summary' });
    }
    return res.json({ success: true });
  } catch (err) {
    logger.error('Delete summary error', { err });
    return res.status(500).json({ error: 'Failed to delete summary' });
  }
};

export const importSummary = async (req: Request, res: Response) => {
  try {
    const summary = req.body;
    if (!summary || !summary.title) return res.status(400).json({ error: 'Missing summary payload' });

    const payload: any = {
      document_id: normalizeDocumentId(summary.documentId),
      title: summary.title,
      subject: summary.subject || null,
      pages: summary.pages || 0,
      overview: summary.overview || '',
      sections: summary.sections || [],
      quick_revision: summary.quickRevision || [],
      viva_questions: summary.vivaQuestions || [],
      formulas: summary.formulas || [],
      concepts: summary.concepts || [],
      definitions: summary.definitions || [],
      exam_tips: summary.examTips || [],
      created_at: summary.createdAt || new Date().toISOString(),
    };

    const { data, error } = await supabase.from('summaries').insert(payload).select('*').limit(1).single();
    if (error) {
      logger.warn('Failed to import summary', { error });
      return res.status(500).json({ error: 'Failed to import summary' });
    }
    return res.json(data);
  } catch (err) {
    logger.error('Import summary error', { err });
    return res.status(500).json({ error: 'Failed to import summary' });
  }
};

export const downloadSummaryPdf = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data, error } = await supabase.from('summaries').select('*').eq('id', id).limit(1).single();
    if (error || !data) return res.status(404).json({ error: 'Summary not found' });

    // Lazy import PDFKit to avoid loading it when not needed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${(data.title || 'summary').replace(/\s+/g, '_')}.pdf"`);

    doc.pipe(res);
    doc.fontSize(20).text(data.title || 'Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Pages: ${data.pages || 0}`);
    doc.moveDown();
    doc.fontSize(14).text('Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(data.overview || '');
    if (Array.isArray(data.sections)) {
      data.sections.forEach((s: any) => {
        doc.addPage();
        doc.fontSize(16).text(s.title || 'Section', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(s.content || '');
      });
    }

    doc.end();
  } catch (err) {
    logger.error('PDF generation error', { err });
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
