import { Router } from 'express';
import authRoutes from './authRoutes';
import recruiterRoutes from './recruiterRoutes';
import candidateRoutes from './candidateRoutes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/candidate', candidateRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
