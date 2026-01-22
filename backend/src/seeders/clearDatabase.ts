import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { RecruiterProfile } from '../models/RecruiterProfile';
import { CandidateProfile } from '../models/CandidateProfile';
import { JobPost } from '../models/JobPost';
import { JobSkill } from '../models/JobSkill';
import { Application } from '../models/Application';
import { Resume } from '../models/Resume';
import { ResumeAnalysis } from '../models/ResumeAnalysis';
import { JobMatchScore } from '../models/JobMatchScore';

export const clearDatabase = async (): Promise<void> => {
  try {
    console.log('🗑️  Clearing database...');

    await Promise.all([
      JobMatchScore.deleteMany({}),
      ResumeAnalysis.deleteMany({}),
      Application.deleteMany({}),
      Resume.deleteMany({}),
      JobPost.deleteMany({}),
      JobSkill.deleteMany({}),
      CandidateProfile.deleteMany({}),
      RecruiterProfile.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  (async () => {
    await connectDatabase();
    await clearDatabase();
    process.exit(0);
  })();
}
