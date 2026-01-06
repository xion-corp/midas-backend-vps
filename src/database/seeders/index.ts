import { AppDataSource } from '../data-source';
import { CreateAdminUser1736190000001 } from './create-admin-user';

async function runSeeders() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const seeder = new CreateAdminUser1736190000001();
    await seeder.run(AppDataSource);

    console.log('Seeders completed successfully');
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeders();
