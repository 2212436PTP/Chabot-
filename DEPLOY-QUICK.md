# 🚀 Quick Deploy Guide

## Bước 1: Neon Database (2 phút)
1. Vào https://console.neon.tech/
2. New Project → Tên: `dalat-chatbot`
3. Copy **Connection String**
4. SQL Editor → Paste toàn bộ `src/db/schema.sql` → Run

## Bước 2: Render Backend (5 phút)
1. Vào https://dashboard.render.com/
2. New + → Web Service
3. Connect repo: `2212436PTP/Chabot-`
4. Cấu hình:
   - Name: `dalat-chatbot-api`
   - Build: `npm install && npm run build`
   - Start: `npm start`
5. Environment Variables:
   ```
   GEMINI_API_KEY=AIzaSyBd3emgB4CMJP6dE0GDF1SFwp_GVk0iiUs
   DATABASE_URL=<PASTE_NEON_URL>
   NODE_ENV=production
   PORT=3000
   ```
6. Create Web Service
7. **Copy URL**: `https://dalat-chatbot-api.onrender.com`

## Bước 3: Netlify Frontend (3 phút)
1. Mở `netlify.toml`
2. Sửa dòng 6:
   ```toml
   to = "https://dalat-chatbot-api.onrender.com/api/:splat"
   ```
   (Thay bằng URL Render của bạn)

3. Commit & push:
   ```bash
   git add netlify.toml
   git commit -m "Update Render URL"
   git push origin master
   ```

4. Vào https://app.netlify.com/
5. New site → Import from GitHub
6. Chọn repo `2212436PTP/Chabot-`
7. Settings:
   - Branch: `master`
   - Publish directory: `public`
8. Deploy!

## ✅ Done!
- Frontend: `https://your-site.netlify.app`
- Admin: `https://your-site.netlify.app/admin.html`
  - Email: admin@dalat.com
  - Pass: admin123

## 🐛 Troubleshooting
- Backend không chạy? → Check Render logs
- Database error? → Check DATABASE_URL
- Frontend không connect? → Check netlify.toml URL
- CORS error? → Đợi Render wake up (cold start ~30s)

Xem chi tiết: **DEPLOY.md**
