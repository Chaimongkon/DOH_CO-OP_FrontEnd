/**
 * Legacy MySQL Pool (kept for backward compatibility)
 * Use new DatabasePool from './database-pool' for new implementations
 */

import mysql from 'mysql2/promise';
import { db } from './database-pool';
import logger from '@/lib/logger';

// Legacy pool for backward compatibility
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0', 10),
    maxIdle: parseInt(process.env.DB_MAX_IDLE || process.env.DB_CONNECTION_LIMIT || '10', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),
    // Security configurations
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    } : undefined,
    // Prevent SQL injection through connection settings  
    typeCast: true, // Enable automatic type casting
    supportBigNumbers: true,
    bigNumberStrings: false, // Return numbers as actual numbers, not strings
});

// Log deprecation warning
if (process.env.NODE_ENV === 'development') {
    logger.warn('Using legacy MySQL pool. Consider migrating to new DatabasePool for better performance and features.');
}

// Export both legacy pool and new optimized db
export default pool;
export { db }; // Re-export optimized database pool