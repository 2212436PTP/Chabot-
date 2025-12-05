// src/services/authService.ts
import pool from '../db/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role?: string;
  created_at: Date;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Đăng ký người dùng mới
export async function registerUser(data: RegisterData): Promise<{ success: boolean; user?: User; message: string }> {
  const client = await pool.connect();
  
  try {
    // Kiểm tra email đã tồn tại
    const checkEmail = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );
    
    if (checkEmail.rows.length > 0) {
      return { success: false, message: 'Email đã được đăng ký!' };
    }
    
    // Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    
    // Thêm user mới
    const result = await client.query(
      `INSERT INTO users (name, email, phone, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, address, role, created_at`,
      [data.name, data.email, data.phone, passwordHash, data.address || null, 'user']
    );
    
    const user = result.rows[0];
    return {
      success: true,
      user: user,
      message: 'Đăng ký thành công!'
    };
    
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    return { success: false, message: 'Lỗi hệ thống. Vui lòng thử lại!' };
  } finally {
    client.release();
  }
}

// Đăng nhập
export async function loginUser(data: LoginData): Promise<{ success: boolean; user?: User; message: string }> {
  const client = await pool.connect();
  
  try {
    // Tìm user theo email
    const result = await client.query(
      `SELECT id, name, email, phone, address, role, password_hash, created_at
       FROM users WHERE email = $1`,
      [data.email]
    );
    
    if (result.rows.length === 0) {
      return { success: false, message: 'Email không tồn tại!' };
    }
    
    const user = result.rows[0];
    
    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    
    if (!isPasswordValid) {
      return { success: false, message: 'Mật khẩu không đúng!' };
    }
    
    // Xóa password_hash trước khi trả về
    delete user.password_hash;
    
    return {
      success: true,
      user: user,
      message: 'Đăng nhập thành công!'
    };
    
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    return { success: false, message: 'Lỗi hệ thống. Vui lòng thử lại!' };
  } finally {
    client.release();
  }
}

// Lấy thông tin user theo ID
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, address, role, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    return null;
  }
}
