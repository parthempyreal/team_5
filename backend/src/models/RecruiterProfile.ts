import mongoose, { Schema, Document } from 'mongoose';

export interface IRecruiterProfile extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  location?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const recruiterProfileSchema = new Schema<IRecruiterProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      minlength: [2, 'Company name must be at least 2 characters'],
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    companyWebsite: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        'Please provide a valid URL',
      ],
    },
    companySize: {
      type: String,
      enum: [
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '501-1000',
        '1000+',
      ],
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
recruiterProfileSchema.index({ userId: 1, isVerified: 1 });

export const RecruiterProfile = mongoose.model<IRecruiterProfile>(
  'RecruiterProfile',
  recruiterProfileSchema
);
