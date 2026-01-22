import mongoose, { Schema, Document } from 'mongoose';

export interface IResume extends Document {
  candidateId: mongoose.Types.ObjectId;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadDate: Date;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    uploadDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one primary resume per candidate
resumeSchema.pre('save', async function (next) {
  if (this.isPrimary) {
    await Resume.updateMany(
      {
        candidateId: this.candidateId,
        _id: { $ne: this._id },
      },
      { isPrimary: false }
    );
  }
  next();
});

// Compound indexes
resumeSchema.index({ candidateId: 1, isPrimary: 1 });
resumeSchema.index({ candidateId: 1, uploadDate: -1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
