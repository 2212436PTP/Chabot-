# 🔐 LocalStorage Persistence - Chatbot Đà Lạt

## Tổng quan

Hệ thống sử dụng **localStorage** của trình duyệt để **persist (giữ lại) dữ liệu người dùng** ngay cả khi reload/refresh trang web hoặc đóng tab rồi mở lại.

## Dữ liệu được lưu

### Keys trong localStorage:

| Key | Type | Mô tả | Ví dụ |
|-----|------|-------|-------|
| `dalat_user_logged_in` | boolean (string) | Trạng thái đăng nhập | `"true"` / `"false"` |
| `dalat_user_id` | number (string) | ID user trong database | `"123"` |
| `dalat_user_name` | string | Tên người dùng | `"Nguyễn Văn A"` |
| `dalat_user_email` | string | Email | `"user@example.com"` |
| `dalat_user_phone` | string | Số điện thoại | `"0901234567"` |
| `dalat_user_role` | string | Vai trò | `"user"` / `"admin"` |
| `dalat_user_address` | string | Địa chỉ (optional) | `"123 Nguyễn Văn Cừ"` |
| `dalat_sid` | string | Session ID | `"sid_1234567890"` |

## Cách hoạt động

### 1. **Khi đăng nhập thành công:**

```javascript
// Sau khi API /api/auth/login thành công
localStorage.setItem('dalat_user_logged_in', 'true');
localStorage.setItem('dalat_user_id', data.user.id);
localStorage.setItem('dalat_user_name', data.user.name);
localStorage.setItem('dalat_user_email', data.user.email);
localStorage.setItem('dalat_user_phone', data.user.phone);
localStorage.setItem('dalat_user_role', data.user.role || 'user');

// Biến global được cập nhật
isLoggedIn = true;
userName = data.user.name;
userId = data.user.id;
```

### 2. **Khi reload trang:**

```javascript
// widget.js tự động load từ localStorage
let isLoggedIn = localStorage.getItem('dalat_user_logged_in') === 'true';
let userName = localStorage.getItem('dalat_user_name') || '';
let userEmail = localStorage.getItem('dalat_user_email') || '';
let userId = parseInt(localStorage.getItem('dalat_user_id') || '0');
let userRole = localStorage.getItem('dalat_user_role') || 'user';

console.log('🔐 Trạng thái đăng nhập từ localStorage:', { 
    isLoggedIn, userName, userEmail, userId, userRole 
});

// Nếu isLoggedIn === true → Hiển thị trạng thái đã đăng nhập
// Nếu isLoggedIn === false → Hiển thị form đăng nhập
```

### 3. **Khi đăng xuất:**

```javascript
// Xóa TẤT CẢ keys liên quan
localStorage.removeItem('dalat_user_logged_in');
localStorage.removeItem('dalat_user_id');
localStorage.removeItem('dalat_user_name');
localStorage.removeItem('dalat_user_email');
localStorage.removeItem('dalat_user_phone');
localStorage.removeItem('dalat_user_role');
localStorage.removeItem('dalat_user_password');
localStorage.removeItem('dalat_user_address');

// Reset biến global
isLoggedIn = false;
userName = '';
userEmail = '';
userId = 0;
userRole = 'user';
```

## Test Persistence

### ✅ Các tình huống đã test:

1. **Reload trang (F5)**
   - ✅ Dữ liệu đăng nhập được giữ nguyên
   - ✅ Không cần đăng nhập lại

2. **Đóng tab và mở lại**
   - ✅ Dữ liệu vẫn còn (localStorage persist vô thời hạn)
   - ✅ Vẫn hiển thị tên user, trạng thái đăng nhập

3. **Đóng trình duyệt và mở lại**
   - ✅ Dữ liệu vẫn còn (localStorage không bị xóa khi đóng browser)
   - ✅ Có thể tiếp tục sử dụng mà không cần login

4. **Đăng xuất và reload**
   - ✅ Tất cả localStorage keys bị xóa
   - ✅ Trạng thái reset về chưa đăng nhập

5. **Xóa localStorage thủ công (DevTools)**
   - ✅ Hệ thống nhận diện và chuyển về trạng thái chưa đăng nhập

## Bảo mật

### ⚠️ Lưu ý quan trọng:

1. **KHÔNG lưu password** vào localStorage (hiện tại đã bỏ key `dalat_user_password`)
2. **localStorage có thể đọc được** bởi JavaScript → Không lưu thông tin nhạy cảm
3. **XSS vulnerabilities** có thể đọc localStorage → Cần sanitize input
4. Nên dùng **JWT token** thay vì lưu thông tin user trực tiếp (TODO: future improvement)

### ✅ Best practices hiện tại:

- ✅ Chỉ lưu thông tin cơ bản (id, name, email, role)
- ✅ Không lưu password
- ✅ Session ID (sid) để track conversation
- ✅ Clear localStorage hoàn toàn khi logout

## Debug

### Console logs để debug:

```javascript
// Xem tất cả localStorage keys
console.log('📦 localStorage:', {
    logged_in: localStorage.getItem('dalat_user_logged_in'),
    user_id: localStorage.getItem('dalat_user_id'),
    user_name: localStorage.getItem('dalat_user_name'),
    user_email: localStorage.getItem('dalat_user_email'),
    user_role: localStorage.getItem('dalat_user_role')
});

// Xóa tất cả localStorage (reset hoàn toàn)
localStorage.clear();
```

### DevTools:

1. Mở **Chrome DevTools** (F12)
2. Tab **Application** → **Storage** → **Local Storage** → `http://localhost:3000`
3. Xem tất cả keys và values
4. Có thể xóa từng key hoặc clear all

## Files liên quan

| File | Mô tả |
|------|-------|
| `public/widget.js` | Main logic: load/save/clear localStorage |
| `public/admin.html` | Admin panel: load user_id, user_role để check quyền |
| `public/test-booking.html` | Test booking: load user_id để tạo booking |

## API tương tác

localStorage KHÔNG gửi lên server tự động. Các API sau sử dụng dữ liệu từ localStorage:

| API | Dùng localStorage | Mục đích |
|-----|-------------------|----------|
| `/api/chat` | ✅ `user_id` | Lưu chat history vào DB |
| `/api/chat/history/:userId` | ✅ `user_id` | Load chat history từ DB |
| `/api/admin/*` | ✅ `user_id`, `user_role` | Check quyền admin |
| `/api/booking/create-direct` | ✅ `user_id` | Tạo booking |

## Cải tiến trong tương lai

- [ ] Migrate sang **JWT token** thay vì lưu từng field
- [ ] Thêm **token expiry** (auto logout sau X giờ)
- [ ] Encrypt sensitive data trong localStorage
- [ ] Sync localStorage với session server-side
- [ ] Thêm "Remember me" checkbox (optional persistence)
