import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database Configuration Factory
 * 
 * Why a factory function?
 * - Access to environment variables at runtime
 * - Can be imported in AppModule with ConfigModule
 * 
 * TypeORM Options Explained:
 * - type: Database type (postgres, mysql, sqlite, etc.)
 * - synchronize: Auto-create/update tables from entities
 *   ⚠️ WARNING: Only use in development! In production, use migrations
 * - entities: Where to find entity classes
 * - logging: Show SQL queries in console (helpful for debugging)
 */
export const databaseConfig = (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    // Auto-load all entities from the modules
    autoLoadEntities: true,

    // Sync database schema with entities (DEV ONLY!)
    synchronize: true,

    // Log SQL queries to console
    logging: process.env.NODE_ENV !== 'production',
});
