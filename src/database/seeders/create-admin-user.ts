import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/users/user.entity';
import * as bcrypt from 'bcryptjs';

export class CreateAdminUser1736190000001 {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@midas.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = userRepository.create({
      email: 'admin@midas.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Midas',
      role: UserRole.ADMIN,
      emailVerified: true,
    });

    await userRepository.save(adminUser);
    console.log('Admin user created: admin@midas.com / admin123');
  }
}
