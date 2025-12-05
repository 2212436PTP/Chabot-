-- Script tạo booking mẫu để test Admin Panel

-- Tạo user test nếu chưa có (password: test123)
INSERT INTO users (name, email, phone, password_hash, role)
VALUES ('Test User', 'test@example.com', '0901234567', '$2a$10$YourHashHere', 'user')
ON CONFLICT (email) DO NOTHING;

-- Tạo các booking mẫu
INSERT INTO bookings (user_id, place_name, type, customer_name, phone, date_in, date_out, time, guests, status)
VALUES 
-- Booking đặt bàn nhà hàng (pending)
((SELECT id FROM users WHERE email = 'test@example.com'), 
 'Quán Nướng Hồng Kông', 'table', 'Nguyễn Văn A', '0901234567', 
 CURRENT_DATE + INTERVAL '2 days', NULL, '19:00:00', 4, 'pending'),

-- Booking đặt bàn nhà hàng (confirmed)
((SELECT id FROM users WHERE email = 'test@example.com'), 
 'Quán Lẩu Dê 79', 'table', 'Trần Thị B', '0912345678', 
 CURRENT_DATE + INTERVAL '3 days', NULL, '18:30:00', 6, 'confirmed'),

-- Booking đặt phòng khách sạn (pending)
((SELECT id FROM users WHERE email = 'test@example.com'), 
 'Khách sạn Dalat Palace', 'room', 'Phạm Văn C', '0923456789', 
 CURRENT_DATE + INTERVAL '5 days', CURRENT_DATE + INTERVAL '7 days', NULL, 2, 'pending'),

-- Booking đặt phòng homestay (confirmed)
((SELECT id FROM users WHERE email = 'test@example.com'), 
 'Homestay Đà Lạt View', 'room', 'Lê Thị D', '0934567890', 
 CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', NULL, 4, 'confirmed'),

-- Booking đã hoàn thành
((SELECT id FROM users WHERE email = 'test@example.com'), 
 'Cafe Mê Linh', 'table', 'Hoàng Văn E', '0945678901', 
 CURRENT_DATE - INTERVAL '2 days', NULL, '15:00:00', 3, 'completed'),

-- Booking đã hủy
((SELECT id FROM users WHERE email = 'test@example.com'), 
 'Nhà hàng Hoa Sơn', 'table', 'Võ Thị F', '0956789012', 
 CURRENT_DATE + INTERVAL '1 day', NULL, '20:00:00', 5, 'cancelled');

-- Kiểm tra kết quả
SELECT * FROM bookings ORDER BY created_at DESC;
