import { Request } from 'express';
import { Document } from 'mongoose';

export enum UserRole {
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum SkillCategory {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DEVOPS = 'DEVOPS',
  AI_ML = 'AI_ML',
  MOBILE = 'MOBILE',
  DATA = 'DATA',
  DESIGN = 'DESIGN',
  OTHER = 'OTHER',
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  isActive: boolean;
  lastLogin?: Date;
  fcmToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface JobFilters {
  skills?: string[];
  techStack?: string[];
  experienceMin?: number;
  experienceMax?: number;
  location?: string;
  employmentType?: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  skills?: string[];
  techStack?: string[];
  experienceMin?: number;
  experienceMax?: number;
  minMatchScore?: number;
  maxMatchScore?: number;
}

export interface AIJobDescription {
  description: string;
  requiredSkills: string[];
  techStack: string[];
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
}

export interface AIResumeAnalysis {
  extractedSkills: string[];
  extractedTechStack: string[];
  totalExperience: number;
  educationSummary: string;
  workExperience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
  certifications: string[];
  keywords: string[];
  candidateSummary: string;
}

export interface AIMatchScore {
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  techStackScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  reasoning: string;
}
