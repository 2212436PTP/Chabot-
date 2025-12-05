import pool from '../db/database.js';
export async function createBooking(booking) {
    try {
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
        const result = await pool.query(query, values);
        console.log('✅ Đã tạo booking ID:', result.rows[0].id);
        return true;
    }
    catch (error) {
        console.error("❌ Lỗi lưu booking:", error);
        return false;
    }
}
