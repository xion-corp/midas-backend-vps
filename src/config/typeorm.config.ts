import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT', 5432),
  username: configService.get<string>('DATABASE_USER'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  ssl:
    configService.get<string>('NODE_ENV') === 'production'
      ? { rejectUnauthorized: false }
      : false,

  // Auto-load entities
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // Auto-run migrations in production
  migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
  migrationsRun: configService.get<string>('NODE_ENV') === 'production',

  // Logging
  logging: configService.get<string>('NODE_ENV') === 'development',
  logger: 'advanced-console',

  // Pool settings for production
  extra:
    configService.get<string>('NODE_ENV') === 'production'
      ? {
          max: 20,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        }
      : undefined,
});
