import { body, param, query } from 'express-validator';
import { ApplicationStatus, EmploymentType } from '../types';

export const applyToJobValidator = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot exceed 2000 characters'),
];

export const applicationIdValidator = [
  param('applicationId').isMongoId().withMessage('Invalid application ID'),
];

export const browseJobsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit'),
  query('experienceMin')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Invalid experience'),
  query('experienceMax')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Invalid experience'),
  query('salaryMin')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Invalid salary'),
  query('employmentType')
    .optional()
    .isIn(Object.values(EmploymentType))
    .withMessage('Invalid employment type'),
];

export const myApplicationsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit'),
  query('status')
    .optional()
    .isIn(Object.values(ApplicationStatus))
    .withMessage('Invalid status'),
];
