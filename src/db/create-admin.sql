-- Script để tạo tài khoản admin mặc định
-- Chạy script này sau khi đã tạo database schema

-- Tạo admin với email: admin@dalat.com, password: admin123
-- Password hash được tạo bằng bcrypt với saltRounds=10

INSERT INTO users (name, email, phone, password_hash, role) 
VALUES (
    'Admin',
    'admin@dalat.com',
    '0123456789',
    '$2b$10$rZvsmSYHpOCOH.yR3JIIeeF5hXXqCqGKZdWbVVqJXV1yPNmZKmV6W',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Lưu ý: 
-- Email: admin@dalat.com
-- Password: admin123
-- Đổi password sau khi đăng nhập lần đầu!
