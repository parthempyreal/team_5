import { Response, NextFunction } from 'express';
import { JobPost } from '../models/JobPost';
import { Application } from '../models/Application';
import { Resume } from '../models/Resume';
import { ResumeAnalysis } from '../models/ResumeAnalysis';
import { JobMatchScore } from '../models/JobMatchScore';
import { AIService } from '../services/aiService';
import { extractTextFromPDF } from '../utils/pdfParser';
import { AuthRequest, JobStatus, ApplicationStatus } from '../types';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination';

export class CandidateController {
  /**
   * Upload resume
   */
  static async uploadResume(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const candidateId = req.user?.userId;

      if (!req.file) {
        throw new AppError('Please upload a PDF file', 400);
      }

      // Save resume record
      const resume = await Resume.create({
        candidateId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        isPrimary: true,
      });

      // Extract text from PDF
      const resumeText = await extractTextFromPDF(req.file.path);

      // Parse resume with AI
      const aiAnalysis = await AIService.parseResume(resumeText);

      // Save analysis
      const analysis = await ResumeAnalysis.create({
        resumeId: resume._id,
        candidateId,
        ...aiAnalysis,
      });

      res.status(201).json({
        success: true,
        message: 'Resume uploaded and analyzed successfully',
        data: {
          resume,
          analysis,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse jobs
   */
  static async browseJobs(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        page,
        limit,
        skills,
        techStack,
        location,
        experienceMin,
        experienceMax,
        salaryMin,
        employmentType,
        search,
      } = req.query;

      const pagination = getPaginationParams(
        page as string,
        limit as string
      );

      // Build filter
      const filter: any = { status: JobStatus.ACTIVE };

      if (location) {
        filter.location = new RegExp(location as string, 'i');
      }

      if (employmentType) {
        filter.employmentType = employmentType;
      }

      if (experienceMin) {
        filter.experienceMax = { $gte: Number(experienceMin) };
      }

      if (experienceMax) {
        filter.experienceMin = { $lte: Number(experienceMax) };
      }

      if (salaryMin) {
        filter.salaryMax = { $gte: Number(salaryMin) };
      }

      if (skills) {
        const skillsArray = (skills as string).split(',');
        filter.requiredSkills = { $in: skillsArray };
      }

      if (techStack) {
        const techArray = (techStack as string).split(',');
        filter.techStack = { $in: techArray };
      }

      if (search) {
        filter.$text = { $search: search as string };
      }

      const [jobs, total] = await Promise.all([
        JobPost.find(filter)
          .select('-recruiterId')
          .sort({ createdAt: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        JobPost.countDocuments(filter),
      ]);

      // Increment view count
      const jobIds = jobs.map((j) => j._id);
      await JobPost.updateMany({ _id: { $in: jobIds } }, { $inc: { views: 1 } });

      // Check application status
      let jobsWithStatus = jobs;
      if (req.user?.userId) {
        const applications = await Application.find({
          candidateId: req.user.userId,
          jobId: { $in: jobIds },
        }).select('jobId');

        const appliedJobIds = new Set(
          applications.map((app) => app.jobId.toString())
        );

        jobsWithStatus = jobs.map((job) => ({
          ...job,
          hasApplied: appliedJobIds.has(job._id.toString()),
        }));
      }

      res.json({
        success: true,
        data: jobsWithStatus,
        meta: getPaginationMeta(total, pagination.page, pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get job details
   */
  static async getJobDetails(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { jobId } = req.params;

      const job = await JobPost.findOne({
        _id: jobId,
        status: JobStatus.ACTIVE,
      }).select('-recruiterId');

      if (!job) {
        throw new AppError('Job not found', 404);
      }

      // Increment views
      job.views += 1;
      await job.save();

      res.json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Apply to job
   */
  static async applyToJob(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const candidateId = req.user?.userId;
      const { jobId, coverLetter } = req.body;

      // Check if job exists and is active
      const job = await JobPost.findOne({ _id: jobId, status: JobStatus.ACTIVE });
      if (!job) {
        throw new AppError('Job not found or no longer active', 404);
      }

      // Check if already applied
      const existingApplication = await Application.findOne({
        jobId,
        candidateId,
      });

      if (existingApplication) {
        throw new AppError('You have already applied to this job', 409);
      }

      // Get candidate's primary resume
      const resume = await Resume.findOne({ candidateId, isPrimary: true });
      if (!resume) {
        throw new AppError(
          'Please upload a resume before applying to jobs',
          400
        );
      }

      // Get resume analysis
      const resumeAnalysis = await ResumeAnalysis.findOne({
        resumeId: resume._id,
      });

      if (!resumeAnalysis) {
        throw new AppError('Resume analysis not found. Please re-upload your resume.', 400);
      }

      // Create application
      const application = await Application.create({
        jobId,
        candidateId,
        resumeId: resume._id,
        coverLetter,
        status: ApplicationStatus.APPLIED,
      });

      // Calculate match score with AI
      const matchScore = await AIService.calculateMatchScore(
        {
          jobTitle: job.title,
          requiredSkills: job.requiredSkills,
          techStack: job.techStack,
          experienceMin: job.experienceMin,
          experienceMax: job.experienceMax,
        },
        {
          skills: resumeAnalysis.extractedSkills,
          techStack: resumeAnalysis.extractedTechStack,
          experience: resumeAnalysis.totalExperience,
          summary: resumeAnalysis.candidateSummary,
        }
      );

      // Save match score
      await JobMatchScore.create({
        applicationId: application._id,
        jobId,
        candidateId,
        ...matchScore,
        breakdown: { reasoning: matchScore.reasoning },
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          application,
          matchScore: {
            overallScore: matchScore.overallScore,
            reasoning: matchScore.reasoning,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get candidate's applications
   */
  static async getMyApplications(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const candidateId = req.user?.userId;
      const { page, limit, status } = req.query;

      const pagination = getPaginationParams(
        page as string,
        limit as string
      );

      const filter: any = { candidateId };
      if (status) {
        filter.status = status;
      }

      const [applications, total] = await Promise.all([
        Application.find(filter)
          .populate('jobId')
          .sort({ appliedDate: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        Application.countDocuments(filter),
      ]);

      // Enrich with match scores
      const enrichedApplications = await Promise.all(
        applications.map(async (app) => {
          const matchScore = await JobMatchScore.findOne({
            applicationId: app._id,
          }).lean();

          return {
            ...app,
            matchScore,
          };
        })
      );

      res.json({
        success: true,
        data: enrichedApplications,
        meta: getPaginationMeta(total, pagination.page, pagination.limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get application status
   */
  static async getApplicationStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { applicationId } = req.params;
      const candidateId = req.user?.userId;

      const application = await Application.findOne({
        _id: applicationId,
        candidateId,
      })
        .populate('jobId')
        .lean();

      if (!application) {
        throw new AppError('Application not found', 404);
      }

      const matchScore = await JobMatchScore.findOne({
        applicationId: application._id,
      }).lean();

      res.json({
        success: true,
        data: {
          ...application,
          matchScore,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get candidate's resumes
   */
  static async getMyResumes(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const candidateId = req.user?.userId;

      const resumes = await Resume.find({ candidateId })
        .sort({ uploadDate: -1 })
        .lean();

      // Enrich with analysis
      const resumesWithAnalysis = await Promise.all(
        resumes.map(async (resume) => {
          const analysis = await ResumeAnalysis.findOne({
            resumeId: resume._id,
          }).lean();
          return {
            ...resume,
            analysis,
          };
        })
      );

      res.json({
        success: true,
        data: resumesWithAnalysis,
      });
    } catch (error) {
      next(error);
    }
  }
}
