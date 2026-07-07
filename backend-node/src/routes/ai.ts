import { Router } from 'express';
import { summary, quiz, listSummaries, deleteSummaryController, importSummary, downloadSummaryPdf, submitQuizAttempt, listQuizAttempts } from '../controllers/aiController';
import { supabaseAuth } from '../middleware/auth';

const router = Router();

router.post('/summary', supabaseAuth, summary);
router.post('/quiz', supabaseAuth, quiz);
router.post('/quiz/submit', supabaseAuth, submitQuizAttempt);
router.get('/quiz/attempts', supabaseAuth, listQuizAttempts);
router.get('/summaries', supabaseAuth, listSummaries);
router.delete('/summary/:id', supabaseAuth, deleteSummaryController);
router.post('/summaries/import', supabaseAuth, importSummary);
router.get('/summary/:id/pdf', supabaseAuth, downloadSummaryPdf);

export default router;
