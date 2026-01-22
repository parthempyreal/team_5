import { Response, NextFunction } from 'express';
import { JobPost } from '../models/JobPost';
import { Application } from '../models/Application';
import { JobMatchScore } from '../models/JobMatchScore';
import { ResumeAnalysis } from '../models/ResumeAnalysis';
import { User } from '../models/User';
import { RecruiterProfile } from '../models/RecruiterProfile';
import { AIService } from '../services/aiService';
import { NotificationService } from '../services/notificationService';
import { AuthRequest, ApplicationStatus, JobStatus, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class RecruiterController {
  /**
   * Generate job description using AI
   */
  static async generateJobDescription(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { jobTitle } = req.body;

      const aiResult = await AIService.generateJobDescription(jobTitle);

      res.json({
        success: true,
        message: 'Job description generated successfully',
        data: aiResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create job post
   */
  static async createJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recruiterId = req.user?.userId;
      const jobData = req.body;

      // Get recruiter's company name
      const recruiterProfile = await RecruiterProfile.findOne({
        userId: recruiterId,
      });

      const job = await JobPost.create({
        ...jobData,
        recruiterId,
        companyName: jobData.companyName || recruiterProfile?.companyName || 'Company',
      });

      // Send notification to all candidates
      try {
        const candidates = await User.find({ role: UserRole.CANDIDATE }).select('_id');
        const candidateIds = candidates.map(user => user._id.toString());
        
        if (candidateIds.length > 0) {
            await NotificationService.sendToUsers(
                candidateIds,
                'New Job Opportunity!',
                `A new job "${job.title}" at ${job.companyName} has been posted. Check it out now!`,
                { jobId: job._id.toString(), type: 'NEW_JOB' }
            );
        }
      } catch (notifyError) {
        console.error('Failed to send new job notifications:', notifyError);
        // Don't block the response if notification fails
      }

      res.status(201).json({
        success: true,
        message: 'Job post created successfully',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recruiter's jobs
   */
  static async getJobs(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recruiterId = req.user?.userId;
      const { page, limit, status } = req.query;

      const pagination = getPaginationParams(
        page as string,
        limit as string
      );

      const filter: any = { recruiterId };
      if (status) {
        filter.status = status;
      }

      const [jobs, total] = await Promise.all([
        JobPost.find(filter)
          .sort({ createdAt: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        JobPost.countDocuments(filter),
      ]);

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        jobs.map(async (job) => {
          const applicationCounts = await Application.aggregate([
            { $match: { jobId: job._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ]);

          const counts = applicationCounts.reduce(
            (acc, item) => {
              acc[item._id.toLowerCase()] = item.count;
              return acc;
            },
            {
              applied: 0,
              shortlisted: 0,
              rejected: 0,
              hired: 0,
              total: 0,
            }
          );

          counts.total = applicationCounts.reduce(
            (sum, item) => sum + item.count,
            0
          );

          return {
            ...job,
            applicationCounts: counts,
          };
        })
      );

      res.json({
        success: true,
        data: jobsWithCounts,
        meta: getPaginationMeta(total, pagination.page, pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job details
   */
  static async getJobById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { jobId } = req.params;
      const recruiterId = req.user?.userId;

      const job = await JobPost.findOne({ _id: jobId, recruiterId });

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get applications for a job
   */
  static async getJobApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { jobId } = req.params;
      const recruiterId = req.user?.userId;
      const {
        page,
        limit,
        status,
        minMatchScore,
        maxMatchScore,
        skills,
        techStack,
        experienceMin,
        experienceMax,
      } = req.query;

      // Verify job belongs to recruiter
      const job = await JobPost.findOne({ _id: jobId, recruiterId });
      if (!job) {
        throw new AppError('Job not found', 404);
      }

      const pagination = getPaginationParams(
        page as string,
        limit as string
      );

      // Build filters
      const applicationFilter: any = { jobId };
      if (status) {
        applicationFilter.status = status;
      }

      // Get applications
      let applications = await Application.find(applicationFilter)
        .populate('candidateId', 'fullName email')
        .populate('resumeId')
        .sort({ appliedDate: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();

      const total = await Application.countDocuments(applicationFilter);

      // Enrich with match scores and resume analysis
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const [matchScore, resumeAnalysis] = await Promise.all([
            JobMatchScore.findOne({ applicationId: app._id }).lean(),
            ResumeAnalysis.findOne({ resumeId: app.resumeId }).lean(),
          ]);

          return {
            ...app,
            matchScore,
            resumeAnalysis,
          };
        })
      );

      // Apply filters
      let filteredApplications = enrichedApplications;

      if (minMatchScore) {
        filteredApplications = filteredApplications.filter(
          (app) => app.matchScore && app.matchScore.overallScore >= Number(minMatchScore)
        );
      }

      if (maxMatchScore) {
        filteredApplications = filteredApplications.filter(
          (app) => app.matchScore && app.matchScore.overallScore <= Number(maxMatchScore)
        );
      }

      if (skills) {
        const skillsArray = (skills as string).split(',').map(s => s.toLowerCase());
        filteredApplications = filteredApplications.filter((app) =>
          skillsArray.some((skill) =>
            app.resumeAnalysis?.extractedSkills.includes(skill)
          )
        );
      }

      if (techStack) {
        const techArray = (techStack as string).split(',').map(t => t.toLowerCase());
        filteredApplications = filteredApplications.filter((app) =>
          techArray.some((tech) =>
            app.resumeAnalysis?.extractedTechStack.includes(tech)
          )
        );
      }

      if (experienceMin) {
        filteredApplications = filteredApplications.filter(
          (app) =>
            app.resumeAnalysis &&
            app.resumeAnalysis.totalExperience >= Number(experienceMin)
        );
      }

      if (experienceMax) {
        filteredApplications = filteredApplications.filter(
          (app) =>
            app.resumeAnalysis &&
            app.resumeAnalysis.totalExperience <= Number(experienceMax)
        );
      }

      res.json({
        success: true,
        data: filteredApplications,
        meta: getPaginationMeta(total, pagination.page, pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept/Shortlist application
   */
  static async acceptApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { applicationId } = req.params;
      const recruiterId = req.user?.userId;
      const { notes } = req.body;

      const application = await Application.findById(applicationId).populate(
        'jobId'
      );

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Verify job belongs to recruiter
      const job = application.jobId as any;
      if (job.recruiterId.toString() !== recruiterId) {
        throw new AppError('Unauthorized', 403);
      }

      application.status = ApplicationStatus.SHORTLISTED;
      application.statusHistory.push({
        status: ApplicationStatus.SHORTLISTED,
        changedAt: new Date(),
        changedBy: req.user?.userId as any,
        notes,
      });

      await application.save();

      res.json({
        success: true,
        message: 'Application shortlisted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject application
   */
  static async rejectApplication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { applicationId } = req.params;
      const recruiterId = req.user?.userId;
      const { notes } = req.body;

      const application = await Application.findById(applicationId).populate(
        'jobId'
      );

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      // Verify job belongs to recruiter
      const job = application.jobId as any;
      if (job.recruiterId.toString() !== recruiterId) {
        throw new AppError('Unauthorized', 403);
      }

      application.status = ApplicationStatus.REJECTED;
      application.statusHistory.push({
        status: ApplicationStatus.REJECTED,
        changedAt: new Date(),
        changedBy: req.user?.userId as any,
        notes,
      });

      await application.save();

      res.json({
        success: true,
        message: 'Application rejected',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboard(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const recruiterId = req.user?.userId;

      const [
        totalJobs,
        activeJobs,
        totalApplications,
        applicationsByStatus,
      ] = await Promise.all([
        JobPost.countDocuments({ recruiterId }),
        JobPost.countDocuments({ recruiterId, status: JobStatus.ACTIVE }),
        Application.countDocuments({
          jobId: { $in: await JobPost.find({ recruiterId }).distinct('_id') },
        }),
        Application.aggregate([
          {
            $lookup: {
              from: 'jobposts',
              localField: 'jobId',
              foreignField: '_id',
              as: 'job',
            },
          },
          {
            $match: {
              'job.recruiterId': recruiterId as any,
            },
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const statusCounts = applicationsByStatus.reduce(
        (acc, item) => {
          acc[item._id.toLowerCase()] = item.count;
          return acc;
        },
        {
          applied: 0,
          shortlisted: 0,
          rejected: 0,
          hired: 0,
        }
      );

      res.json({
        success: true,
        data: {
          totalJobs,
          activeJobs,
          totalApplications,
          ...statusCounts,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
