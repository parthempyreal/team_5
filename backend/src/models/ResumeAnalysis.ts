import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface IResumeAnalysis extends Document {
  resumeId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  extractedSkills: string[];
  extractedTechStack: string[];
  totalExperience: number;
  educationSummary: string;
  workExperience: IWorkExperience[];
  certifications: string[];
  keywords: string[];
  candidateSummary: string;
  parsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workExperienceSchema = new Schema<IWorkExperience>(
  {
    company: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      unique: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    extractedSkills: {
      type: [String],
      default: [],
      lowercase: true,
    },
    extractedTechStack: {
      type: [String],
      default: [],
      lowercase: true,
    },
    totalExperience: {
      type: Number,
      default: 0,
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
      index: true,
    },
    educationSummary: {
      type: String,
      default: '',
      maxlength: [1000, 'Education summary cannot exceed 1000 characters'],
    },
    workExperience: {
      type: [workExperienceSchema],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
      lowercase: true,
    },
    candidateSummary: {
      type: String,
      default: '',
      maxlength: [2000, 'Candidate summary cannot exceed 2000 characters'],
    },
    parsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
resumeAnalysisSchema.index({
  extractedSkills: 'text',
  extractedTechStack: 'text',
  keywords: 'text',
});

// Compound indexes
resumeAnalysisSchema.index({ candidateId: 1, parsedAt: -1 });
resumeAnalysisSchema.index({ totalExperience: 1 });

export const ResumeAnalysis = mongoose.model<IResumeAnalysis>(
  'ResumeAnalysis',
  resumeAnalysisSchema
);
