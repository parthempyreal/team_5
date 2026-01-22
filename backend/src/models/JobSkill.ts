import mongoose, { Schema, Document } from 'mongoose';
import { SkillCategory } from '../types';

export interface IJobSkill extends Document {
  name: string;
  category: SkillCategory;
  aliases: string[];
  createdAt: Date;
  updatedAt: Date;
}

const jobSkillSchema = new Schema<IJobSkill>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(SkillCategory),
      required: [true, 'Skill category is required'],
      index: true,
    },
    aliases: {
      type: [String],
      default: [],
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
jobSkillSchema.index({ name: 'text', aliases: 'text' });

// Compound index
jobSkillSchema.index({ category: 1, name: 1 });

export const JobSkill = mongoose.model<IJobSkill>('JobSkill', jobSkillSchema);
