// src/services/adminService.ts
import pool from '../db/database.js';

// Kiểm tra quyền admin
export async function isAdmin(userId: number): Promise<boolean> {
  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    return result.rows.length > 0 && result.rows[0].role === 'admin';
  } catch (error) {
    console.error('Lỗi kiểm tra quyền admin:', error);
    return false;
  }
}

// Lấy tất cả users
export async function getAllUsers(page: number = 1, limit: number = 20) {
  try {
    const offset = (page - 1) * limit;
    
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);
    
    const result = await pool.query(
      `SELECT id, name, email, phone, address, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
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
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    return { success: false, users: [], pagination: null };
  }
}

// Cập nhật role user
export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  try {
    await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [role, userId]
    );
    return { success: true, message: 'Cập nhật role thành công' };
  } catch (error) {
    console.error('Lỗi cập nhật role:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

// Xóa user
export async function deleteUser(userId: number) {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    return { success: true, message: 'Xóa user thành công' };
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

// Lấy tất cả bookings
export async function getAllBookings(page: number = 1, limit: number = 20, status?: string) {
  try {
    const offset = (page - 1) * limit;
    
    let countQuery = 'SELECT COUNT(*) FROM bookings';
    let dataQuery = `
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
    `;
    const params: any[] = [limit, offset];
    
    if (status) {
      countQuery += ' WHERE status = $1';
      dataQuery += ' WHERE b.status = $3';
      params.push(status);
    }
    
    dataQuery += ' ORDER BY b.created_at DESC LIMIT $1 OFFSET $2';
    
    console.log('📊 Admin: Đang lấy bookings với query:', dataQuery);
    console.log('📊 Admin: Params:', params);
    
    const countResult = await pool.query(
      status ? 'SELECT COUNT(*) FROM bookings WHERE status = $1' : countQuery,
      status ? [status] : []
    );
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
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bookings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, bookings: [], pagination: null, message: errorMessage };
  }
}

// Cập nhật trạng thái booking
export async function updateBookingStatus(bookingId: number, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
  try {
    await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      [status, bookingId]
    );
    return { success: true, message: 'Cập nhật trạng thái thành công' };
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái booking:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

// Xóa booking
export async function deleteBooking(bookingId: number) {
  try {
    await pool.query('DELETE FROM bookings WHERE id = $1', [bookingId]);
    return { success: true, message: 'Xóa booking thành công' };
  } catch (error) {
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
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as total_bookings,
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
  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    return { success: false, stats: null };
  }
}

// Lấy bookings mới chưa xử lý (cho thông báo admin)
export async function getPendingBookingsForNotification() {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.status = 'pending'
      ORDER BY b.created_at DESC
      LIMIT 10
    `);
    
    return {
      success: true,
      bookings: result.rows
    };
  } catch (error) {
    console.error('Lỗi lấy pending bookings:', error);
    return { success: false, bookings: [] };
  }
}

// Đánh dấu booking đã được thông báo (tránh spam)
export async function markBookingAsNotified(bookingId: number) {
  try {
    // Có thể thêm trường `notified_at` vào bảng bookings nếu cần
    console.log(`📱 Booking ID ${bookingId} đã được thông báo cho admin`);
    return { success: true };
  } catch (error) {
    console.error('Lỗi đánh dấu booking notification:', error);
    return { success: false };
  }
}

// Lấy thông báo admin
export async function getAdminNotifications(limit: number = 20) {
  try {
    const result = await pool.query(`
      SELECT n.*, b.customer_name, b.place_name, b.type, b.date_in, b.time
      FROM admin_notifications n
      LEFT JOIN bookings b ON n.booking_id = b.id
      ORDER BY n.created_at DESC
      LIMIT $1
    `, [limit]);
    
    return {
      success: true,
      notifications: result.rows
    };
  } catch (error) {
    console.error('Lỗi lấy admin notifications:', error);
    return { success: false, notifications: [] };
  }
}

// Đánh dấu thông báo đã đọc
export async function markNotificationAsRead(notificationId: number) {
  try {
    await pool.query(
      'UPDATE admin_notifications SET is_read = TRUE WHERE id = $1',
      [notificationId]
    );
    return { success: true, message: 'Đã đánh dấu thông báo' };
  } catch (error) {
    console.error('Lỗi đánh dấu thông báo:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

// Đánh dấu tất cả thông báo đã đọc
export async function markAllNotificationsAsRead() {
  try {
    await pool.query('UPDATE admin_notifications SET is_read = TRUE WHERE is_read = FALSE');
    return { success: true, message: 'Đã đánh dấu tất cả thông báo' };
  } catch (error) {
    console.error('Lỗi đánh dấu tất cả thông báo:', error);
    return { success: false, message: 'Lỗi hệ thống' };
  }
}

// Lấy số thông báo chưa đọc
export async function getUnreadNotificationCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM admin_notifications WHERE is_read = FALSE');
    return {
      success: true,
      count: parseInt(result.rows[0].count)
    };
  } catch (error) {
    console.error('Lỗi đếm thông báo chưa đọc:', error);
    return { success: false, count: 0 };
  }
}

// Lấy booking gần đây (cho chatbot)
export async function getRecentBookings(minutesAgo: number = 1) {
  try {
    const result = await pool.query(`
      SELECT id, customer_name, phone, place_name as restaurant, 
             guests, date_in as date, time, status, created_at
      FROM bookings 
      WHERE created_at >= NOW() - INTERVAL '${minutesAgo} minutes'
      AND status = 'pending'
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Lỗi lấy booking gần đây:', error);
    return [];
  }
}

// Gửi thông báo realtime đến admin (qua SSE)
export async function notifyAdminNewBooking(bookingData: any) {
  try {
    console.log('📱 Đang gửi thông báo booking mới đến admin chatbot...');
    console.log('📊 Số admin connections:', globalThis.adminConnections?.size || 0);
    
    // Gửi qua Server-Sent Events nếu có connection
    if (globalThis.adminConnections && globalThis.adminConnections.size > 0) {
      const messageData = {
        type: 'new_booking',
        booking: bookingData,
        timestamp: new Date().toISOString()
      };
      
      console.log('📤 Gửi data:', JSON.stringify(messageData));
      
      globalThis.adminConnections.forEach((res: any, userId: string) => {
        try {
          res.write(`data: ${JSON.stringify(messageData)}\n\n`);
          console.log(`✅ Đã gửi SSE đến admin ${userId}`);
        } catch (error) {
          console.log(`❌ Lỗi gửi SSE đến admin ${userId}:`, error);
          globalThis.adminConnections?.delete(userId);
        }
      });
      
      console.log('✅ Đã gửi thông báo booking mới đến admin chatbot');
      return { success: true };
    } else {
      console.log('⚠️ Không có admin nào đang kết nối SSE');
      return { success: false, message: 'No admin connections' };
    }
  } catch (error) {
    console.error('❌ Lỗi gửi thông báo admin:', error);
    return { success: false };
  }
}
