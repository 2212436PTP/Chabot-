import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Nạp .env ĐẦU TIÊN
import { handleMessage } from './services/handler.js';
import { createBooking } from './services/bookingService.js';
import { registerUser, loginUser } from './services/authService.js';
import { saveChatMessage, getChatHistory, clearChatHistory, countUserMessages } from './services/chatHistoryService.js';
import { initDatabase } from './db/init.js';
import * as adminService from './services/adminService.js';

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Phục vụ Giao diện

// Khởi tạo database khi server start
initDatabase().catch(err => {
  console.error('Không thể khởi tạo database:', err);
});

// [API MỚI] Đăng ký
app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    if (result.success) {
      res.json({ success: true, user: result.user, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('❌ Lỗi đăng ký:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + (error as Error).message });
  }
});

// [API MỚI] Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    if (result.success) {
      res.json({ success: true, user: result.user, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('❌ Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + (error as Error).message });
  }
});

// [API MỚI] Lưu tin nhắn chat
app.post('/api/chat/save', async (req, res) => {
  try {
    const { userId, message, sender } = req.body;
    const success = await saveChatMessage(userId, message, sender);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// [API MỚI] Lấy lịch sử chat
app.get('/api/chat/history/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await getChatHistory(userId, limit);
    const count = await countUserMessages(userId);
    res.json({ success: true, history, count });
  } catch (error) {
    res.status(500).json({ success: false, history: [], count: 0 });
  }
});

// [API MỚI] Xóa lịch sử chat
app.delete('/api/chat/history/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const success = await clearChatHistory(userId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// [API MỚI] Xử lý đặt chỗ
app.post('/api/book', async (req, res) => {
  const success = await createBooking(req.body);
  if (success) {
    res.json({ message: "Đặt chỗ thành công! Chúng tôi sẽ liên hệ lại sớm." });
  } else {
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// [API TEST] Tạo booking trực tiếp (cho testing admin panel)
app.post('/api/booking/create-direct', async (req, res) => {
  try {
    const result = await createBooking(req.body);
    if (result) {
      // Lấy booking vừa tạo
      const pool = (await import('./db/database.js')).default;
      const lastBooking = await pool.query(
        'SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.body.user_id]
      );
      res.json({ 
        success: true, 
        message: 'Tạo booking thành công!',
        booking: lastBooking.rows[0]
      });
    } else {
      res.status(400).json({ success: false, message: 'Không thể tạo booking' });
    }
  } catch (error) {
    console.error('❌ Lỗi tạo booking:', error);
    res.status(500).json({ success: false, message: 'Lỗi hệ thống: ' + (error as Error).message });
  }
});

// [API MỚI] Xuất lịch trình ra file TXT
app.post('/api/export-itinerary', (req, res) => {
  const { content, filename } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Không có nội dung lịch trình' });
  }
  
  // Tạo file text từ content (xóa markdown formatting)
  const cleanContent = content
    .replace(/\*\*/g, '')  // Xóa markdown bold
    .replace(/###/g, '')   // Xóa markdown heading
    .replace(/\n{3,}/g, '\n\n'); // Giảm nhiều dòng trống
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename || 'lich-trinh-dalat.txt'}"`);
  res.send(cleanContent);
});

// API Endpoint (PHẢI LÀ ASYNC)
app.post('/api/ai', async (req, res) => {
  try {
    const { q, payload, sid, loc } = req.body; 

    if (!sid) {
      return res.status(400).json({ error: 'Missing sid' });
    }

    // Nếu không có q và không có payload, kích hoạt 'intro'
    if (!q && !payload) {
      const introPayload = { action: 'go_node' as const, value: 'intro' };
      const botResponse = await handleMessage(null, introPayload, sid, loc);
      return res.json(botResponse);
    }

    // Xử lý request bình thường
    const botResponse = await handleMessage(q, payload, sid, loc);
    res.json(botResponse);

  } catch (error) {
    console.error("Lỗi nghiêm trọng tại Server:", error);
    res.status(500).json({ error: "Máy chủ gặp lỗi" });
  }
});

// ========== ADMIN APIs ==========

// Middleware kiểm tra admin
async function checkAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = parseInt(req.headers['x-user-id'] as string);
  
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }
  
  const isAdminUser = await adminService.isAdmin(userId);
  if (!isAdminUser) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
  }
  
  next();
}

// Lấy thống kê dashboard
app.get('/api/admin/stats', checkAdmin, async (req, res) => {
  const result = await adminService.getDashboardStats();
  res.json(result);
});

// Lấy danh sách users
app.get('/api/admin/users', checkAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await adminService.getAllUsers(page, limit);
  res.json(result);
});

// Cập nhật role user
app.put('/api/admin/users/:id/role', checkAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;
  const result = await adminService.updateUserRole(userId, role);
  res.json(result);
});

// Xóa user
app.delete('/api/admin/users/:id', checkAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const result = await adminService.deleteUser(userId);
  res.json(result);
});

// Lấy danh sách bookings
app.get('/api/admin/bookings', checkAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const result = await adminService.getAllBookings(page, limit, status);
  res.json(result);
});

// Cập nhật trạng thái booking
app.put('/api/admin/bookings/:id/status', checkAdmin, async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;
  const result = await adminService.updateBookingStatus(bookingId, status);
  res.json(result);
});

// Xóa booking
app.delete('/api/admin/bookings/:id', checkAdmin, async (req, res) => {
  const bookingId = parseInt(req.params.id);
  const result = await adminService.deleteBooking(bookingId);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Dalat Assistant (Hybrid) đang chạy tại http://localhost:${port}`);
});