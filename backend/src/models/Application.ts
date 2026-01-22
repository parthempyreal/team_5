import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus } from '../types';

export interface IStatusHistory {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  coverLetter?: string;
  appliedDate: Date;
  statusHistory: IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  { _id: false }
);

const applicationSchema = new Schema<IApplication>(
  {
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
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.APPLIED,
      index: true,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    appliedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: function (this: IApplication) {
        return [
          {
            status: ApplicationStatus.APPLIED,
            changedAt: new Date(),
          },
        ];
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Compound indexes for common queries
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, status: 1 });
applicationSchema.index({ candidateId: 1, appliedDate: -1 });
applicationSchema.index({ status: 1, appliedDate: -1 });

// Update status history when status changes
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

export const Application = mongoose.model<IApplication>(
  'Application',
  applicationSchema
);
