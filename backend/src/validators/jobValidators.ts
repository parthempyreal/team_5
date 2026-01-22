import { body, param, query } from 'express-validator';
import { EmploymentType, JobStatus } from '../types';

export const generateJobDescriptionValidator = [
  body('jobTitle')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),
];

export const createJobValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Job title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('experienceMin')
    .isInt({ min: 0, max: 50 })
    .withMessage('Minimum experience must be between 0 and 50 years'),
  body('experienceMax')
    .isInt({ min: 0, max: 50 })
    .withMessage('Maximum experience must be between 0 and 50 years')
    .custom((value, { req }) => {
      if (value < req.body.experienceMin) {
        throw new Error(
          'Maximum experience must be greater than or equal to minimum'
        );
      }
      return true;
    }),
  body('salaryMin')
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salaryMax')
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number')
    .custom((value, { req }) => {
      if (value < req.body.salaryMin) {
        throw new Error(
          'Maximum salary must be greater than or equal to minimum'
        );
      }
      return true;
    }),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('employmentType')
    .isIn(Object.values(EmploymentType))
    .withMessage('Invalid employment type'),
  body('requiredSkills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('requiredSkills.*')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  body('techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('techStack.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tech item must be between 1 and 50 characters'),
  body('status')
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage('Invalid job status'),
  body('aiGenerated')
    .optional()
    .isBoolean()
    .withMessage('AI generated must be a boolean'),
];

export const jobIdValidator = [
  param('jobId').isMongoId().withMessage('Invalid job ID'),
];

export const applicationIdValidator = [
  param('applicationId').isMongoId().withMessage('Invalid application ID'),
];

export const jobFiltersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit'),
  query('status')
    .optional()
    .isIn(Object.values(JobStatus))
    .withMessage('Invalid status'),
];

export const applicationFiltersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit'),
  query('minMatchScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Invalid match score'),
  query('maxMatchScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Invalid match score'),
  query('experienceMin')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Invalid experience'),
  query('experienceMax')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Invalid experience'),
];
