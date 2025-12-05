// src/db/init.ts
import pool from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcrypt';
// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function initDatabase() {
    try {
        console.log('🔄 Đang khởi tạo database...');
        // Kiểm tra và tạo database nếu chưa có
        await ensureDatabaseExists();
        // Đọc file SQL schema từ src (vì .sql không được compile)
        const schemaPath = path.join(__dirname, '../../src/db/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        // Thực thi SQL
        await pool.query(schema);
        // Tạo tài khoản admin mặc định
        await createDefaultAdmin();
        console.log('✅ Database đã được khởi tạo thành công!');
    }
    catch (error) {
        console.error('❌ Lỗi khởi tạo database:', error);
        throw error;
    }
}
async function ensureDatabaseExists() {
    const dbName = process.env.DB_NAME || 'dalat_chatbot';
    // Kết nối vào database postgres mặc định để tạo database mới
    const client = new pg.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'postgres' // Kết nối vào postgres database mặc định
    });
    try {
        await client.connect();
        // Kiểm tra xem database đã tồn tại chưa
        const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (result.rows.length === 0) {
            // Tạo database mới
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`✅ Đã tạo database "${dbName}"`);
        }
        else {
            console.log(`✅ Database "${dbName}" đã tồn tại`);
        }
    }
    finally {
        await client.end();
    }
}
async function createDefaultAdmin() {
    try {
        // Kiểm tra xem admin đã tồn tại chưa
        const checkAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@dalat.com']);
        if (checkAdmin.rows.length === 0) {
            // Hash password
            const passwordHash = await bcrypt.hash('admin123', 10);
            // Tạo admin
            await pool.query(`INSERT INTO users (name, email, phone, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5)`, ['Admin', 'admin@dalat.com', '0123456789', passwordHash, 'admin']);
            console.log('✅ Đã tạo tài khoản admin mặc định');
            console.log('   Email: admin@dalat.com');
            console.log('   Password: admin123');
        }
        else {
            console.log('✅ Tài khoản admin đã tồn tại');
        }
    }
    catch (error) {
        console.error('⚠️ Lỗi tạo admin:', error);
        // Không throw error để không ngăn server khởi động
    }
}
