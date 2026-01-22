import { Router } from 'express';
import { RecruiterController } from '../controllers/recruiterController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';
import {
  generateJobDescriptionValidator,
  createJobValidator,
  jobIdValidator,
  applicationIdValidator,
  jobFiltersValidator,
  applicationFiltersValidator,
} from '../validators/jobValidators';

const router = Router();

// All routes require authentication and recruiter role
router.use(authenticate, authorize(UserRole.RECRUITER));

/**
 * @route   POST /api/recruiter/jobs/generate-description
 * @desc    Generate job description using AI
 * @access  Private (Recruiter)
 */
router.post(
  '/jobs/generate-description',
  validate(generateJobDescriptionValidator),
  RecruiterController.generateJobDescription
);

/**
 * @route   POST /api/recruiter/jobs
 * @desc    Create job post
 * @access  Private (Recruiter)
 */
router.post(
  '/jobs',
  validate(createJobValidator),
  RecruiterController.createJob
);

/**
 * @route   GET /api/recruiter/jobs
 * @desc    Get recruiter's jobs
 * @access  Private (Recruiter)
 */
router.get(
  '/jobs',
  validate(jobFiltersValidator),
  RecruiterController.getJobs
);

/**
 * @route   GET /api/recruiter/jobs/:jobId
 * @desc    Get job details
 * @access  Private (Recruiter)
 */
router.get(
  '/jobs/:jobId',
  validate(jobIdValidator),
  RecruiterController.getJobById
);

/**
 * @route   GET /api/recruiter/jobs/:jobId/applications
 * @desc    Get applications for a job
 * @access  Private (Recruiter)
 */
router.get(
  '/jobs/:jobId/applications',
  validate([...jobIdValidator, ...applicationFiltersValidator]),
  RecruiterController.getJobApplications
);

/**
 * @route   PUT /api/recruiter/applications/:applicationId/accept
 * @desc    Accept/Shortlist application
 * @access  Private (Recruiter)
 */
router.put(
  '/applications/:applicationId/accept',
  validate(applicationIdValidator),
  RecruiterController.acceptApplication
);

/**
 * @route   PUT /api/recruiter/applications/:applicationId/reject
 * @desc    Reject application
 * @access  Private (Recruiter)
 */
router.put(
  '/applications/:applicationId/reject',
  validate(applicationIdValidator),
  RecruiterController.rejectApplication
);

/**
 * @route   GET /api/recruiter/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Recruiter)
 */
router.get('/dashboard', RecruiterController.getDashboard);

export default router;
