# Hướng Dẫn Deploy Chatbot Đà Lạt

## 🚀 Stack Công Nghệ
- **Backend**: Render (Node.js)
- **Database**: Neon PostgreSQL
- **Frontend**: Netlify

---

## 📋 Bước 1: Setup Database trên Neon

### 1.1. Tạo Database
1. Truy cập [Neon Console](https://console.neon.tech/)
2. Click **"New Project"**
3. Đặt tên project: `dalat-chatbot`
4. Chọn region gần Việt Nam nhất (Singapore hoặc Tokyo)
5. Click **"Create Project"**

### 1.2. Lấy Connection String
1. Trong dashboard project, click tab **"Connection Details"**
2. Copy **Connection string** (dạng: `postgresql://username:password@host/dbname?sslmode=require`)
3. Lưu lại để dùng ở bước sau

### 1.3. Chạy Schema
1. Trong Neon Console, mở **SQL Editor**
2. Copy nội dung file `src/db/schema.sql`
3. Paste vào SQL Editor và click **"Run"**
4. Database đã sẵn sàng! ✅

---

## 🔧 Bước 2: Deploy Backend trên Render

### 2.1. Tạo Web Service
1. Truy cập [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect với GitHub repository: `2212436PTP/Chabot-`
4. Chọn branch: `master`

### 2.2. Cấu hình Service
- **Name**: `dalat-chatbot-api`
- **Region**: Singapore
- **Branch**: `master`
- **Root Directory**: Để trống
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2.3. Thiết lập Environment Variables
Click **"Environment"** tab và thêm các biến:

```env
GEMINI_API_KEY=AIzaSyBd3emgB4CMJP6dE0GDF1SFwp_GVk0iiUs
PORT=3000
DATABASE_URL=<PASTE_NEON_CONNECTION_STRING_Ở_ĐÂY>
NODE_ENV=production
```

**Quan trọng**: 
- Thay `<PASTE_NEON_CONNECTION_STRING_Ở_ĐÂY>` bằng connection string từ Neon
- Hoặc điền từng biến riêng:
  ```
  DB_HOST=<neon-host>
  DB_PORT=5432
  DB_NAME=dalat_chatbot
  DB_USER=<neon-user>
  DB_PASSWORD=<neon-password>
  DB_SSL=true
  ```

### 2.4. Deploy
1. Click **"Create Web Service"**
2. Đợi build và deploy (~3-5 phút)
3. Sau khi deploy xong, bạn sẽ có URL dạng: `https://dalat-chatbot-api.onrender.com`
4. **Lưu URL này** để dùng cho Frontend! 📝

---

## 🌐 Bước 3: Deploy Frontend trên Netlify

### 3.1. Chuẩn bị Frontend

Trước khi deploy, cần cập nhật API URL trong file `public/widget.js`:

1. Mở file `public/widget.js`
2. Tìm dòng:
   ```javascript
   const API_BASE = 'http://localhost:3000';
   ```
3. Thay bằng URL Render của bạn:
   ```javascript
   const API_BASE = 'https://dalat-chatbot-api.onrender.com';
   ```

### 3.2. Tạo file netlify.toml

File này đã có sẵn trong project với nội dung:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://dalat-chatbot-api.onrender.com/api/:splat"
  status = 200
  force = true

[build]
  publish = "public"
```

**Cập nhật URL**: Thay `https://dalat-chatbot-api.onrender.com` bằng URL Render thực tế của bạn.

### 3.3. Deploy trên Netlify

**Cách 1: Deploy qua GitHub (Khuyến nghị)**
1. Truy cập [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Chọn **"Deploy with GitHub"**
4. Tìm và chọn repo: `2212436PTP/Chabot-`
5. Cấu hình:
   - **Branch**: `master`
   - **Base directory**: Để trống
   - **Build command**: Để trống (vì chỉ serve static files)
   - **Publish directory**: `public`
6. Click **"Deploy site"**

**Cách 2: Deploy thủ công (Nhanh hơn)**
1. Mở [Netlify Drop](https://app.netlify.com/drop)
2. Kéo thả thư mục `public` vào
3. Netlify sẽ deploy ngay lập tức

### 3.4. Cấu hình Domain (Tùy chọn)
- Netlify sẽ tự động tạo domain dạng: `https://random-name-123.netlify.app`
- Bạn có thể đổi tên: Site settings → Domain management → Change site name
- Hoặc dùng custom domain của riêng bạn

---

## ✅ Bước 4: Kiểm Tra Deploy

### 4.1. Test Backend
Mở trình duyệt và truy cập:
```
https://dalat-chatbot-api.onrender.com/api/chat
```
Nếu thấy lỗi "Method not allowed" hoặc response JSON → Backend hoạt động! ✅

### 4.2. Test Frontend
1. Mở URL Netlify của bạn
2. Click nút **"Bắt đầu Trò chuyện"**
3. Thử chat với bot
4. Thử tính năng đặt bàn

### 4.3. Test Admin Notifications
1. Đặt 1 booking qua chatbot
2. Mở trang chính, login admin (admin@dalat.com / admin123)
3. Kiểm tra xem có thông báo xuất hiện không

---

## 🔒 Bảo Mật

### Environment Variables Quan Trọng:
- ✅ `GEMINI_API_KEY`: Đừng share public
- ✅ `DATABASE_URL`: Giữ bí mật
- ✅ Thêm file `.env` vào `.gitignore` (đã có sẵn)

### Admin Password:
Sau khi deploy, nhớ đổi password admin:
1. Login vào admin panel
2. Hoặc chạy SQL query trong Neon:
   ```sql
   UPDATE users SET password = crypt('new_password', gen_salt('bf'))
   WHERE email = 'admin@dalat.com';
   ```

---

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi: "Failed to connect to database"
- ✅ Kiểm tra DATABASE_URL trong Render có đúng không
- ✅ Kiểm tra Neon database có chạy không
- ✅ Đảm bảo có `?sslmode=require` trong connection string

### Lỗi: "CORS Error" trên Frontend
- ✅ Kiểm tra CORS đã enable trong backend
- ✅ Kiểm tra API_BASE URL đúng chưa

### Lỗi: Backend không response
- ✅ Kiểm tra logs trên Render Dashboard
- ✅ Xem có lỗi build không

### Frontend không load
- ✅ Kiểm tra publish directory là `public`
- ✅ Xem build logs trên Netlify

---

## 📊 Monitor & Logs

### Render Logs:
- Dashboard → Your Service → Logs tab
- Xem real-time logs của backend

### Neon Monitoring:
- Dashboard → Monitoring tab
- Xem database queries, connections

### Netlify Logs:
- Site dashboard → Deploys tab
- Xem deploy history và logs

---

## 🎉 Hoàn Thành!

Chatbot của bạn đã live trên Internet! 🚀

- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://dalat-chatbot-api.onrender.com`
- **Database**: Neon PostgreSQL

### URLs Quan Trọng:
- Trang chính: `https://your-site.netlify.app`
- Admin panel: `https://your-site.netlify.app/admin.html`
- API docs: `https://dalat-chatbot-api.onrender.com/api/chat`

---

## 🔄 Cập Nhật Sau Deploy

Khi có thay đổi code:
1. Push lên GitHub
2. Render sẽ tự động rebuild (nếu bật auto-deploy)
3. Netlify sẽ tự động redeploy (nếu connect GitHub)

Hoặc manual:
- Render: Deploy → Manual Deploy
- Netlify: Deploys → Trigger deploy

---

## 💡 Tips

1. **Free tier Render** sẽ sleep sau 15 phút không dùng. Cold start ~30s
2. **Neon free tier** cho 0.5GB storage, đủ cho project này
3. **Netlify free** cho 100GB bandwidth/tháng
4. Cân nhắc upgrade nếu traffic cao

---

## 📞 Support

Nếu gặp vấn đề:
1. Check logs trước
2. Google error message
3. Check documentation của từng service
4. GitHub Issues nếu là bug của code

Good luck! 🍀
