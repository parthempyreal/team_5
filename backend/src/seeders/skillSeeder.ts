import { connectDatabase } from '../config/database';
import { JobSkill } from '../models/JobSkill';
import { skillsData } from './data/skills';

export const seedSkills = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding skills...');

    // Clear existing skills
    await JobSkill.deleteMany({});
    console.log('   Cleared existing skills');

    // Insert skills
    const skills = await JobSkill.insertMany(skillsData);
    console.log(`   ✅ Seeded ${skills.length} skills`);

    // Display category breakdown
    const categories = skills.reduce((acc, skill) => {
      acc[skill.category] = (acc[skill.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   Skills by category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`      - ${category}: ${count}`);
    });
  } catch (error) {
    console.error('❌ Error seeding skills:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  (async () => {
    await connectDatabase();
    await seedSkills();
    process.exit(0);
  })();
}
