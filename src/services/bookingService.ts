import pool from '../db/database.js';
import { notifyAdminNewBooking } from './adminService.js';

export interface BookingRequest {
  placeName: string;
  customerName: string;
  phone: string;
  dateIn: string;
  dateOut?: string;
  time?: string;
  guests: number;
  type: 'table' | 'room';
  userId?: number; // Optional - nếu không có thì dùng user mặc định
}

export async function createBooking(booking: BookingRequest): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Nếu không có userId, dùng user_id=1 (admin) làm mặc định
    const userId = booking.userId || 1;
    
    const query = `
      INSERT INTO bookings (user_id, place_name, type, customer_name, phone, date_in, date_out, time, guests, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING id
    `;
    
    const values = [
      userId,
      booking.placeName,
      booking.type,
      booking.customerName,
      booking.phone,
      booking.dateIn,
      booking.dateOut || null,
      booking.time || null,
      booking.guests
    ];
    
    const result = await client.query(query, values);
    const bookingId = result.rows[0].id;
    
    // Tạo thông báo cho Admin
    const notificationTitle = `Có đặt ${booking.type === 'table' ? 'bàn' : 'phòng'} mới!`;
    const notificationMessage = `${booking.customerName} đã đặt ${booking.type === 'table' ? 'bàn' : 'phòng'} tại ${booking.placeName} cho ${booking.guests} người vào ngày ${booking.dateIn}${booking.time ? ` lúc ${booking.time}` : ''}. SĐT: ${booking.phone}`;
    
    await client.query(`
      INSERT INTO admin_notifications (type, title, message, booking_id)
      VALUES ('new_booking', $1, $2, $3)
    `, [notificationTitle, notificationMessage, bookingId]);
    
    await client.query('COMMIT');
    
    // Gửi thông báo realtime đến admin chatbot
    const bookingData = {
      id: bookingId,
      customer_name: booking.customerName,
      phone: booking.phone,
      restaurant: booking.placeName,
      guests: booking.guests,
      date: booking.dateIn,
      time: booking.time || 'Không xác định',
      type: booking.type
    };
    
    // Gọi async để không block
    notifyAdminNewBooking(bookingData).catch(error => {
      console.error('Lỗi gửi thông báo admin chatbot:', error);
    });
    
    console.log('✅ Đã tạo booking ID:', bookingId);
    console.log('🔔 Đã tạo thông báo admin cho booking ID:', bookingId);
    console.log('📱 Đã gửi thông báo đến admin chatbot');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Lỗi lưu booking:", error);
    return false;
  } finally {
    client.release();
  }
}