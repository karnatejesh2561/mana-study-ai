import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import { upload } from '../middleware/multerConfig';

const router = Router();

router.post('/', upload.single('file'), uploadFile);

export default router;
