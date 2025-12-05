// Script để thêm user Phát vào database
import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '1234',
  database: 'dalat_chatbot'
});

async function fixUser() {
  try {
    console.log('🔄 Đang kiểm tra user ID 3...');
    
    // Kiểm tra user ID 3
    const check = await pool.query('SELECT * FROM users WHERE id = $1', [3]);
    
    if (check.rows.length === 0) {
      console.log('⚠️ User ID 3 không tồn tại. Đang tạo...');
      
      // Hash password
      const passwordHash = await bcrypt.hash('123456', 10);
      
      // Thêm user với ID = 3
      await pool.query(
        `INSERT INTO users (id, name, email, phone, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [3, 'Phát', 'phat@dalat.com', '0987654321', passwordHash, 'user']
      );
      
      console.log('✅ Đã tạo user Phát (ID: 3)');
      console.log('   Email: phat@dalat.com');
      console.log('   Password: 123456');
    } else {
      console.log('✅ User ID 3 đã tồn tại:', check.rows[0]);
    }
    
    // Liệt kê tất cả users
    const allUsers = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('\n📋 Danh sách users:');
    allUsers.rows.forEach(u => {
      console.log(`   - ID ${u.id}: ${u.name} (${u.email}) - Role: ${u.role}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
}

fixUser();
