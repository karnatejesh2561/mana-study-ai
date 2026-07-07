import { Request, Response } from 'express';
import { supabase } from '../services/supabaseClient';
import logger from '../logger';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import FileType from 'file-type';
import fs from 'fs';
import path from 'path';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = `${Date.now()}_${file.originalname}`;
    const bucket = process.env.SUPABASE_BUCKET || 'uploads';

    let uploadData: any = null;
    let publicUrl = '';
    let storageError: string | null = null;

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file.buffer, { contentType: file.mimetype });

      uploadData = data;
      if (error) {
        storageError = error.message;
        logger.warn('Storage upload warning', { uploadError: error });
      } else {
        publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
        if (!publicUrl) {
          try {
            const signed = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 60);
            publicUrl = signed?.data?.signedUrl || publicUrl;
          } catch (e) {
            logger.warn('Signed URL generation failed', { err: e });
          }
        }
      }
    } catch (err) {
      storageError = err instanceof Error ? err.message : 'Unknown storage error';
      logger.warn('Storage upload warning', { err });
    }

    // Try simple text extraction for PDF and DOCX, and plain text fallback.
    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const data = await pdf(file.buffer);
        extractedText = data.text;
      } catch (e) {
        logger.warn('PDF parse failed', { err: e });
      }
    } else if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
      } catch (e) {
        logger.warn('DOCX parse failed', { err: e });
      }
    } else if (file.mimetype.startsWith('image/')) {
      let worker: any = null;
      try {
        // Defensive checks: skip OCR for PDF buffers even if mimetype was set to image/*
        if (file.buffer && file.buffer.length >= 4) {
          const sig = file.buffer.slice(0, 4).toString('utf8');
          if (sig === '%PDF') {
            logger.warn('Skipping OCR: buffer appears to be a PDF');
            throw new Error('Uploaded file is a PDF, OCR skipped');
          }
        }

        // Use file-type sniffing to confirm the buffer is an image (avoid other mismatches)
        const detected = await FileType.fromBuffer(file.buffer as Buffer);
        if (!detected || !detected.mime.startsWith('image/')) {
          logger.warn('File-type mismatch: expected image but detected', { detected });
          throw new Error('Uploaded file is not a supported image');
        }

        // Use buffer-based recognition to avoid file-type/path issues (pdfs etc.)
        worker = await createWorker({ logger: (m) => logger.info('Tesseract', { message: (m as any)?.message }) });
        // newer tesseract versions may preload; attempt initialize safely
        try {
          // load/loadLanguage may be no-ops in some versions, keep guarded
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          worker.load && (await worker.load());
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          worker.loadLanguage && (await worker.loadLanguage('eng'));
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          worker.initialize && (await worker.initialize('eng'));
        } catch (inner) {
          // ignore initialization warnings
        }

        // Recognize directly from buffer to avoid native image readers attempting unsupported formats
        const { data } = await worker.recognize(file.buffer as any);
        extractedText = data?.text || '';
      } catch (e) {
        logger.warn('Image OCR failed', { err: e });
      } finally {
        try {
          if (worker) await worker.terminate();
        } catch (_) {
          // ignore termination errors
        }
      }
    } else if (file.mimetype.startsWith('text/') || file.mimetype === 'application/json') {
      extractedText = file.buffer.toString('utf8');
    }

    if (!extractedText) {
      extractedText = `Uploaded file: ${file.originalname}`;
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const fallbackPath = path.join(uploadsDir, filePath);
    fs.writeFileSync(fallbackPath, file.buffer);

    return res.json({ upload: uploadData, url: publicUrl, text: extractedText, storageError });
  } catch (err) {
    logger.error('Upload error', { err });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
