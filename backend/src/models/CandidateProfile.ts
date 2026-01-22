import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  phoneNumber?: string;
  location?: string;
  currentJobTitle?: string;
  totalExperience?: number;
  expectedSalary?: number;
  currency?: string;
  noticePeriod?: string;
  preferredLocations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const candidateProfileSchema = new Schema<ICandidateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]+$/, 'Please provide a valid phone number'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    currentJobTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },
    totalExperience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    expectedSalary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    },
    noticePeriod: {
      type: String,
      enum: [
        'Immediate',
        '15 days',
        '30 days',
        '60 days',
        '90 days',
      ],
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
candidateProfileSchema.index({ userId: 1 });
candidateProfileSchema.index({ totalExperience: 1 });
candidateProfileSchema.index({ location: 1 });

export const CandidateProfile = mongoose.model<ICandidateProfile>(
  'CandidateProfile',
  candidateProfileSchema
);
