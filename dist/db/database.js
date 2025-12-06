// src/db/database.ts
import { Pool } from 'pg';
import 'dotenv/config';
// Tạo connection pool
// Hỗ trợ cả DATABASE_URL (Neon/Heroku) và các biến riêng lẻ
const pool = new Pool(process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'dalat_chatbot',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
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
