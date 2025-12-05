# 🤖 Chatbot Du lịch Đà Lạt với RAG Architecture

Hệ thống chatbot thông minh hỗ trợ cung cấp thông tin du lịch Đà Lạt sử dụng kiến trúc RAG (Retrieval-Augmented Generation) kết hợp với Google Gemini API.

## 🎯 Tổng quan dự án

**Đề tài:** Xây dựng và triển khai Chatbot hỗ trợ cung cấp thông tin du lịch Đà Lạt  
**Công nghệ:** RAG Pipeline + Google Gemini API + Node.js/TypeScript  
**Thời gian:** 16 tuần (Tháng 8 - Tháng 12 2025)

### 🏆 Thành viên nhóm
- **Ngô Công Thành** (2212436NCT) - Team Leader & AI Developer
- **Phan Thành Phát** (2212436PTP) - Backend Developer & System Architect  
- **Trương Thế Thiên** (2212436TTT) - Frontend Developer & Data Manager

## ⭐ Tính năng chính

- 🧠 **RAG Pipeline 3-phase:** Intent Parsing → Data Retrieval → Response Generation
- 📍 **205 địa điểm đã verify:** Nhà hàng, cafe, điểm tham quan Đà Lạt
- 🗺️ **Google Maps Integration:** Rating, review count, trạng thái mở/đóng real-time
- 📅 **Slot-filling system:** Tạo lịch trình du lịch 6 bước thông minh
- 📱 **Chat Widget responsive:** Giao diện thân thiện trên desktop/mobile
- 🎫 **Booking system:** Đặt bàn nhà hàng, phòng khách sạn trực tiếp
- 👤 **Guest user support:** Chat history tạm thời cho người dùng ẩn danh
- 📄 **Export lịch trình:** Xuất file TXT với auto-format removal
- 🔐 **Admin Panel:** Quản lý user, booking, dữ liệu địa điểm
- 🛡️ **Bảo mật:** JWT authentication + RBAC + data encryption

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────┐
│            PRESENTATION LAYER               │
│  Chat Widget (Vanilla JS) + Admin Panel    │
└─────────────────┬───────────────────────────┘
                  │ HTTPS/REST API
┌─────────────────▼───────────────────────────┐
│            APPLICATION LAYER                │
│  Express.js + TypeScript + RAG Pipeline    │
│  • aiService.ts (Gemini API)               │
│  • rules.ts (Data Retrieval)               │
│  • handler.ts (Orchestration)              │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│               DATA LAYER                    │
│  PostgreSQL + dalat.json (205 places)      │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Google Gemini API Key
- Google Maps API Key

### 1. Clone repository
```bash
git clone https://github.com/thanh063/chatbot_provip.git
cd chatbot_provip
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup
```bash
# Tạo file .env
DATABASE_URL=postgres://user:pass@localhost:5432/chatbot_dalat
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 4. Database setup
```bash
# Khởi tạo database
npm run db:init
npm run db:migrate
npm run db:seed
```

### 5. Build & Run
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 6. Access application
- **Chat Widget:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin.html
- **API Documentation:** http://localhost:3000/api/docs

## 📁 Cấu trúc dự án

```
chatbot_provip/
├── src/
│   ├── services/
│   │   ├── aiService.ts          # Gemini API integration
│   │   ├── handler.ts            # RAG orchestration
│   │   ├── authService.ts        # JWT authentication
│   │   ├── adminService.ts       # Admin operations
│   │   ├── bookingService.ts     # Booking management
│   │   └── googleMapsService.ts  # Maps API integration
│   ├── logic/
│   │   └── rules.ts              # Data filtering & recommendation
│   ├── data/
│   │   ├── dalat.json            # 205 verified places
│   │   └── flow.ts               # Conversation flow
│   └── db/
│       ├── database.ts           # PostgreSQL client
│       └── schema.sql            # Database structure
├── public/
│   ├── index.html                # Main chat page
│   ├── admin.html                # Admin dashboard
│   └── widget.js                 # Chat widget frontend
├── package.json
├── tsconfig.json
├── Baocao1.md                    # Báo cáo đồ án chi tiết
└── README.md
```

## 🔧 API Endpoints

### Chat & RAG
- `POST /api/ai` - Main chat endpoint
- `POST /api/chat/save` - Save chat history
- `GET /api/chat/history/:userId` - Get chat history

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Booking
- `POST /api/book` - Create booking
- `POST /api/export-itinerary` - Export itinerary

### Admin (requires authentication)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/bookings` - Booking management

## 🧪 Testing

```bash
# Unit tests
npm test

# Manual testing với sample queries
npm run test:manual

# Performance testing
npm run test:performance
```

## 📊 Kết quả đạt được

### Technical Performance
- ⚡ **Response Time:** 2-4 giây (tùy độ phức tạp câu hỏi)
- 🎯 **Hallucination Rate:** Rất thấp (<1%) nhờ Data-First approach
- 📈 **Accuracy:** Cao với 205 địa điểm đã verify manually
- 🔄 **Scalability:** Architecture ready cho horizontal scaling

### Features Implemented
- ✅ RAG Pipeline với 3-phase architecture
- ✅ 11 intent types: nuong, cafe, sight, food, stay, transport...
- ✅ Real-time Google Maps API integration
- ✅ Slot-filling cho tạo lịch trình 6 bước
- ✅ Guest user support với localStorage
- ✅ Export lịch trình ra file TXT
- ✅ Admin panel với full CRUD operations
- ✅ Production-ready deployment

## 🐳 Docker Deployment

```bash
# Build và run với Docker Compose
docker-compose up -d

# Hoặc build manual
docker build -t chatbot-dalat .
docker run -p 3000:3000 chatbot-dalat
```

## 📚 Documentation

- **[Báo cáo đồ án chi tiết](Baocao1.md)** - 2600+ dòng documentation
- **[API Documentation](src/docs/)** - Swagger/OpenAPI specs
- **[Deployment Guide](DEPLOYMENT.md)** - Production setup instructions
- **[Development Guide](DEVELOPMENT.md)** - Local development setup

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Ngô Công Thành** - Team Leader - [GitHub](https://github.com/thanh063)
- **Phan Thành Phát** - Backend Developer - [GitHub](https://github.com/2212436PTP)
- **Trương Thế Thiên** - Frontend Developer

**Project Link:** [https://github.com/thanh063/chatbot_provip](https://github.com/thanh063/chatbot_provip)

---

## 🔮 Future Enhancements

- 🌐 **Multi-language support** (English, Chinese, Korean, Japanese)
- 📱 **Mobile app** với offline capabilities
- 🧠 **Advanced AI features** (image recognition, voice input)
- 🔗 **Integration** với booking platforms lớn
- 📊 **Analytics dashboard** với user behavior insights
- 🌟 **Personalization** dựa trên user history và preferences

---

**⭐ Nếu project này hữu ích, đừng quên star repository! ⭐**