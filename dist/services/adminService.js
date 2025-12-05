// src/services/adminService.ts
import pool from '../db/database.js';
// Kiểm tra quyền admin
export async function isAdmin(userId) {
    try {
        const result = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        return result.rows.length > 0 && result.rows[0].role === 'admin';
    }
    catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        return false;
    }
}
// Lấy tất cả users
export async function getAllUsers(page = 1, limit = 20) {
    try {
        const offset = (page - 1) * limit;
        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);
        const result = await pool.query(`SELECT id, name, email, phone, address, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`, [limit, offset]);
        return {
            success: true,
            users: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    catch (error) {
        console.error('Lỗi lấy danh sách users:', error);
        return { success: false, users: [], pagination: null };
    }
}
// Cập nhật role user
export async function updateUserRole(userId, role) {
    try {
        await pool.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, userId]);
        return { success: true, message: 'Cập nhật role thành công' };
    }
    catch (error) {
        console.error('Lỗi cập nhật role:', error);
        return { success: false, message: 'Lỗi hệ thống' };
    }
}
// Xóa user
export async function deleteUser(userId) {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        return { success: true, message: 'Xóa user thành công' };
    }
    catch (error) {
        console.error('Lỗi xóa user:', error);
        return { success: false, message: 'Lỗi hệ thống' };
    }
}
// Lấy tất cả bookings
export async function getAllBookings(page = 1, limit = 20, status) {
    try {
        const offset = (page - 1) * limit;
        let countQuery = 'SELECT COUNT(*) FROM bookings';
        let dataQuery = `
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
    `;
        const params = [limit, offset];
        if (status) {
            countQuery += ' WHERE status = $1';
            dataQuery += ' WHERE b.status = $3';
            params.push(status);
        }
        dataQuery += ' ORDER BY b.created_at DESC LIMIT $1 OFFSET $2';
        console.log('📊 Admin: Đang lấy bookings với query:', dataQuery);
        console.log('📊 Admin: Params:', params);
        const countResult = await pool.query(status ? 'SELECT COUNT(*) FROM bookings WHERE status = $1' : countQuery, status ? [status] : []);
        const total = parseInt(countResult.rows[0].count);
        console.log('📊 Admin: Tổng số bookings:', total);
        const result = await pool.query(dataQuery, params);
        console.log('📊 Admin: Số bookings trả về:', result.rows.length);
        return {
            success: true,
            bookings: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    catch (error) {
        console.error('❌ Lỗi lấy danh sách bookings:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, bookings: [], pagination: null, message: errorMessage };
    }
}
// Cập nhật trạng thái booking
export async function updateBookingStatus(bookingId, status) {
    try {
        await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, bookingId]);
        return { success: true, message: 'Cập nhật trạng thái thành công' };
    }
    catch (error) {
        console.error('Lỗi cập nhật trạng thái booking:', error);
        return { success: false, message: 'Lỗi hệ thống' };
    }
}
// Xóa booking
export async function deleteBooking(bookingId) {
    try {
        await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
        return { success: true, message: 'Xóa booking thành công' };
    }
    catch (error) {
        console.error('Lỗi xóa booking:', error);
        return { success: false, message: 'Lỗi hệ thống' };
    }
}
// Thống kê dashboard
export async function getDashboardStats() {
    try {
        const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') as cancelled_bookings,
        (SELECT COUNT(*) FROM chat_history) as total_messages
    `);
        return {
            success: true,
            stats: stats.rows[0]
        };
    }
    catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        return { success: false, stats: null };
    }
}
