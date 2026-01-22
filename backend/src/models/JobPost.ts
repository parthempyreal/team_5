import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus, EmploymentType } from '../types';

export interface IJobPost extends Document {
  recruiterId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const jobPostSchema = new Schema<IJobPost>(
  {
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [3, 'Job title must be at least 3 characters'],
      maxlength: [200, 'Job title cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [50, 'Job description must be at least 50 characters'],
      maxlength: [5000, 'Job description cannot exceed 5000 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      index: true,
    },
    experienceMin: {
      type: Number,
      required: [true, 'Minimum experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    experienceMax: {
      type: Number,
      required: [true, 'Maximum experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
      validate: {
        validator: function (this: IJobPost, value: number) {
          return value >= this.experienceMin;
        },
        message: 'Maximum experience must be greater than or equal to minimum',
      },
    },
    salaryMin: {
      type: Number,
      required: [true, 'Minimum salary is required'],
      min: [0, 'Salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      required: [true, 'Maximum salary is required'],
      min: [0, 'Salary cannot be negative'],
      validate: {
        validator: function (this: IJobPost, value: number) {
          return value >= this.salaryMin;
        },
        message: 'Maximum salary must be greater than or equal to minimum',
      },
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    },
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
      required: [true, 'Employment type is required'],
      index: true,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'At least one skill is required',
      },
    },
    techStack: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.ACTIVE,
      index: true,
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
jobPostSchema.index({ recruiterId: 1, status: 1 });
jobPostSchema.index({ status: 1, createdAt: -1 });
jobPostSchema.index({ location: 1, status: 1 });
jobPostSchema.index({ employmentType: 1, status: 1 });
jobPostSchema.index({ experienceMin: 1, experienceMax: 1 });
jobPostSchema.index({ salaryMin: 1, salaryMax: 1 });

// Text index for search
jobPostSchema.index({
  title: 'text',
  description: 'text',
  companyName: 'text',
});

export const JobPost = mongoose.model<IJobPost>('JobPost', jobPostSchema);
