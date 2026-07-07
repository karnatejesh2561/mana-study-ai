import multer from 'multer';

// Use memory storage so files can be uploaded to Supabase directly from buffer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});
