import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchBreakdown {
  category: string;
  score: number;
  details: string;
}

export interface IJobMatchScore extends Document {
  applicationId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  overallScore: number;
  skillMatchScore: number;
  experienceScore: number;
  techStackScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  breakdown: Record<string, any>;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobMatchScoreSchema = new Schema<IJobMatchScore>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'JobPost',
      required: true,
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    overallScore: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
      index: true,
    },
    skillMatchScore: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
    },
    experienceScore: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
    },
    techStackScore: {
      type: Number,
      required: true,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot exceed 100'],
    },
    matchedSkills: {
      type: [String],
      default: [],
      lowercase: true,
    },
    missingSkills: {
      type: [String],
      default: [],
      lowercase: true,
    },
    breakdown: {
      type: Schema.Types.Mixed,
      default: {},
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
jobMatchScoreSchema.index({ jobId: 1, overallScore: -1 });
jobMatchScoreSchema.index({ candidateId: 1, overallScore: -1 });
jobMatchScoreSchema.index({ applicationId: 1 });

export const JobMatchScore = mongoose.model<IJobMatchScore>(
  'JobMatchScore',
  jobMatchScoreSchema
);
