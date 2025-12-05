// src/db/database.ts
import { Pool } from 'pg';
import 'dotenv/config';
// Tạo connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dalat_chatbot',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // Maximum number of clients
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Test connection
pool.on('connect', () => {
    console.log('✅ Đã kết nối PostgreSQL database');
});
pool.on('error', (err) => {
    console.error('❌ Lỗi kết nối database:', err);
});
export default pool;
