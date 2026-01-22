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

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface JobPost {
  _id: string;
  title: string;
  description: string;
  companyName: string;
  location: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  employmentType: EmploymentType;
  requiredSkills: string[];
  techStack: string[];
  status: JobStatus;
  aiGenerated: boolean;
  views: number;
  createdAt: string;
  applicationCounts?: {
    applied: number;
    shortlisted: number;
    rejected: number;
    hired: number;
    total: number;
  };
}

export interface Application {
  _id: string;
  jobId: JobPost | string;
  candidateId: {
    _id: string;
    fullName: string;
    email: string;
  };
  status: ApplicationStatus;
  coverLetter?: string;
  appliedDate: string;
  matchScore?: JobMatchScore;
  resumeAnalysis?: ResumeAnalysis;
}

export interface JobMatchScore {
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  techStackScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  breakdown?: any;
}

export interface ResumeAnalysis {
  extractedSkills: string[];
  extractedTechStack: string[];
  totalExperience: number;
  educationSummary: string;
  workExperience: WorkExperience[];
  certifications: string[];
  keywords: string[];
  candidateSummary: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applied: number;
  shortlisted: number;
  rejected: number;
  hired: number;
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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
