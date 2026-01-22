import { Router } from 'express';
import { CandidateController } from '../controllers/candidateController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { upload } from '../config/multer';
import { UserRole } from '../types';
import {
  applyToJobValidator,
  applicationIdValidator,
  browseJobsValidator,
  myApplicationsValidator,
} from '../validators/candidateValidators';
import { jobIdValidator } from '../validators/jobValidators';

const router = Router();

// All routes require authentication and candidate role
router.use(authenticate, authorize(UserRole.CANDIDATE));

/**
 * @route   POST /api/candidate/resume/upload
 * @desc    Upload resume
 * @access  Private (Candidate)
 */
router.post(
  '/resume/upload',
  upload.single('resume'),
  CandidateController.uploadResume
);

/**
 * @route   GET /api/candidate/resumes
 * @desc    Get candidate's resumes
 * @access  Private (Candidate)
 */
router.get('/resumes', CandidateController.getMyResumes);

/**
 * @route   GET /api/candidate/jobs
 * @desc    Browse jobs
 * @access  Private (Candidate)
 */
router.get(
  '/jobs',
  validate(browseJobsValidator),
  CandidateController.browseJobs
);

/**
 * @route   GET /api/candidate/jobs/:jobId
 * @desc    Get job details
 * @access  Private (Candidate)
 */
router.get(
  '/jobs/:jobId',
  validate(jobIdValidator),
  CandidateController.getJobDetails
);

/**
 * @route   POST /api/candidate/applications
 * @desc    Apply to job
 * @access  Private (Candidate)
 */
router.post(
  '/applications',
  validate(applyToJobValidator),
  CandidateController.applyToJob
);

/**
 * @route   GET /api/candidate/applications
 * @desc    Get candidate's applications
 * @access  Private (Candidate)
 */
router.get(
  '/applications',
  validate(myApplicationsValidator),
  CandidateController.getMyApplications
);

/**
 * @route   GET /api/candidate/applications/:applicationId
 * @desc    Get application status
 * @access  Private (Candidate)
 */
router.get(
  '/applications/:applicationId',
  validate(applicationIdValidator),
  CandidateController.getApplicationStatus
);

export default router;
