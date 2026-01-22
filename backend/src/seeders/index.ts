import { connectDatabase } from '../config/database';
import { clearDatabase } from './clearDatabase';
import { seedSkills } from './skillSeeder';

const runSeeders = async (): Promise<void> => {
  try {
    console.log('🚀 Starting database seeding...\n');

    // Connect to database
    await connectDatabase();

    // Clear existing data
    await clearDatabase();
    console.log('');

    // Run seeders
    await seedSkills();
    console.log('');

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('  - Skills seeded');
    console.log('  - Tech stacks included in skills');
    console.log('  - All categories populated');
    console.log('');
    console.log('You can now start the application.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

runSeeders();
