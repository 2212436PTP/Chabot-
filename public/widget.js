document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ĐỊNH NGHĨA BIẾN VÀ SESSION ---
    let chatMessages, chatForm, chatInput, choicesContainer, chatWidget, launcherButton;
    // Biến cho Modal
    let modal, bookingForm, closeModal, loginModal, loginForm, registerModal, registerForm;
    
    let sid = localStorage.getItem('dalat_sid');
    if (!sid) {
        sid = 'sid_' + Date.now() + Math.random();
        localStorage.setItem('dalat_sid', sid);
    }

    // Biến đăng nhập - Persist qua localStorage để giữ dữ liệu khi reload
    let isLoggedIn = localStorage.getItem('dalat_user_logged_in') === 'true';
    let userName = localStorage.getItem('dalat_user_name') || '';
    let userEmail = localStorage.getItem('dalat_user_email') || '';
    let userRole = localStorage.getItem('dalat_user_role') || 'user';
    
    // userId có thể là number (registered) hoặc string (guest)
    let userId;
    if (isLoggedIn) {
        userId = parseInt(localStorage.getItem('dalat_user_id') || '0');
        if (userId === 0) {
            // Đăng nhập không hợp lệ, chuyển sang guest
            isLoggedIn = false;
            localStorage.removeItem('dalat_user_logged_in');
        }
    }
    
    // Tạo guest user ID cho người dùng chưa đăng nhập
    if (!isLoggedIn) {
        let guestId = localStorage.getItem('dalat_guest_id');
        if (!guestId) {
            guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('dalat_guest_id', guestId);
        }
        userId = guestId; // String ID cho guest
        userName = 'Khách';
        console.log('👤 Guest user:', { guestId });
    }
    
    console.log('🔐 Trạng thái đăng nhập từ localStorage:', { 
        isLoggedIn, userName, userEmail, userId, userRole 
    });

    // Hàm lưu lịch sử chat (gọi API hoặc localStorage cho guest)
    async function saveChatHistory(message, sender) {
        console.log('💾 Đang lưu chat:', { isLoggedIn, userId, message: message.substring(0, 50) + '...', sender });
        
        if (!userId) {
            console.warn('⚠️ Không lưu chat: userId không hợp lệ');
            return;
        }
        
        // Guest user: lưu vào localStorage
        if (!isLoggedIn || typeof userId === 'string') {
            try {
                const guestHistory = JSON.parse(localStorage.getItem('dalat_guest_chat_history') || '[]');
                guestHistory.push({
                    message,
                    sender,
                    timestamp: new Date().toISOString()
                });
                // Giới hạn 100 tin nhắn cho guest
                if (guestHistory.length > 100) {
                    guestHistory.shift();
                }
                localStorage.setItem('dalat_guest_chat_history', JSON.stringify(guestHistory));
                console.log('✅ Đã lưu chat guest vào localStorage');
            } catch (error) {
                console.error('❌ Lỗi lưu guest chat:', error);
            }
            return;
        }
        
        // Registered user: lưu vào database
        try {
            const response = await fetch('/api/chat/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message, sender })
            });
            const data = await response.json();
            
            if (!data.success) {
                console.error('❌ Lưu chat thất bại:', data);
                // Nếu user không tồn tại trong database, xóa localStorage và yêu cầu đăng nhập lại
                if (data.message && data.message.includes('user')) {
                    console.error('🚨 User không hợp lệ! Đang xóa session...');
                    localStorage.removeItem('dalat_user_logged_in');
                    localStorage.removeItem('dalat_user_id');
                    localStorage.removeItem('dalat_user_name');
                    localStorage.removeItem('dalat_user_email');
                    localStorage.removeItem('dalat_user_role');
                    addMessage('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại! 🔐', 'bot');
                }
            } else {
                console.log('✅ Đã lưu chat:', data);
            }
        } catch (error) {
            console.error('❌ Lỗi lưu chat:', error);
        }
    }

    // Hàm tải lịch sử chat (từ database)
    async function loadChatHistory() {
        if (!isLoggedIn || !userId) return;
        
        try {
            const res = await fetch(`/api/chat/history/${userId}?limit=50`);
            const data = await res.json();
            
            if (data.success && data.history.length > 0) {
                // Hiển thị thông báo
                const historyDiv = document.createElement('div');
                historyDiv.style.cssText = 'padding: 10px; background: #e8f5e9; border-radius: 8px; margin: 10px 0; text-align: center; font-size: 0.85rem; color: #2E7D32;';
                historyDiv.innerHTML = `📝 Đã tải ${data.count} tin nhắn từ lịch sử | <a href="#" id="clear-history" style="color: #d32f2f; font-weight: 600;">Xóa lịch sử</a>`;
                chatMessages.appendChild(historyDiv);
                
                // Hiển thị tin nhắn
                data.history.forEach(item => {
                    addMessageToUI(item.message, item.sender, false);
                });
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Sự kiện xóa lịch sử
                const clearBtn = document.getElementById('clear-history');
                if (clearBtn) {
                    clearBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
                            await fetch(`/api/chat/history/${userId}`, { method: 'DELETE' });
                            chatMessages.innerHTML = '';
                            addMessage('✅ Đã xóa lịch sử chat!', 'bot');
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
        }
    }

    // Hàm xóa lịch sử khi đăng xuất
    function clearChatHistoryOnLogout() {
        chatMessages.innerHTML = '';
    }

    // --- 2. TẠO GIAO DIỆN ĐỘNG ---
    function createChatUI() {
        // A. Tạo Nút Launcher
        launcherButton = document.createElement('div');
        launcherButton.id = 'chat-launcher';
        launcherButton.innerHTML = '💬'; 
        launcherButton.addEventListener('click', toggleChat);
        document.body.appendChild(launcherButton);

        // B. Tạo Khung Chat Chính
        chatWidget = document.createElement('div');
        chatWidget.id = 'chat-widget';
        chatWidget.innerHTML = `
            <div id="chat-header">
                <div id="chat-avatar">ĐL</div>
                <div id="chat-title">Trợ lý Đà Lạt</div>
                <div id="chat-header-controls">
                    <button id="chat-history-btn" title="Lịch sử chat">📜</button>
                    <button id="chat-minimize" title="Thu nhỏ">−</button>
                    <button id="chat-maximize" title="Phóng to">□</button>
                    <button id="chat-header-close" title="Đóng">×</button>
                </div>
            </div>
            <div id="chat-messages"></div>
            <div id="chat-choices"></div>
            <form id="chat-form">
                <input type="text" id="chat-input" placeholder="Hỏi tôi về Đà Lạt..." autocomplete="off">
                <button type="submit" id="chat-send">➡️</button>
            </form>
        `;
        document.body.appendChild(chatWidget);

        // C. Gán biến
        chatMessages = document.getElementById('chat-messages');
        chatForm = document.getElementById('chat-form');
        chatInput = document.getElementById('chat-input');
        choicesContainer = document.getElementById('chat-choices');
        
        // Gán biến Modal (đã có sẵn trong HTML)
        modal = document.getElementById('booking-modal');
        bookingForm = document.getElementById('booking-form');
        closeModal = document.getElementById('close-modal');
        
        loginModal = document.getElementById('login-modal');
        loginForm = document.getElementById('login-form');
        const closeLoginModal = document.getElementById('close-login-modal');
        
        registerModal = document.getElementById('register-modal');
        registerForm = document.getElementById('register-form');
        const closeRegisterModal = document.getElementById('close-register-modal');
        
        // D. Thêm sự kiện
        document.getElementById('chat-header-close').addEventListener('click', toggleChat);
        document.getElementById('chat-minimize').addEventListener('click', minimizeChat);
        document.getElementById('chat-maximize').addEventListener('click', toggleMaximize);
        chatForm.addEventListener('submit', handleFormSubmit);

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        if (bookingForm) {
            bookingForm.addEventListener('submit', handleBookingSubmit);
        }
        
        // Sự kiện đăng nhập
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => {
                loginModal.style.display = 'none';
            });
        }
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }
        
        // Sự kiện đăng ký
        if (closeRegisterModal) {
            closeRegisterModal.addEventListener('click', () => {
                registerModal.style.display = 'none';
            });
        }
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegisterSubmit);
        }
        
        // Chuyển đổi giữa login và register
        const switchToLogin = document.getElementById('switch-to-login');
        const switchToRegister = document.getElementById('switch-to-register');
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.style.display = 'none';
                loginModal.style.display = 'flex';
            });
        }
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                loginModal.style.display = 'none';
                registerModal.style.display = 'flex';
            });
        }
        
        // Sự kiện xem lịch sử
        const historyBtn = document.getElementById('chat-history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', showChatHistory);
        }
        
        // Cập nhật UI nếu đã đăng nhập
        updateLoginStatus();
    }

    // --- 3. LOGIC XỬ LÝ SỰ KIỆN ---
    
    // Hàm hiển thị lịch sử chat
    async function showChatHistory() {
        console.log('📜 Đang tải lịch sử chat:', { isLoggedIn, userId });
        
        if (!userId) {
            addMessage('Không thể tải lịch sử chat! 🔐', 'bot');
            return;
        }
        
        // Guest user: đọc từ localStorage
        if (!isLoggedIn || typeof userId === 'string') {
            try {
                const guestHistory = JSON.parse(localStorage.getItem('dalat_guest_chat_history') || '[]');
                
                if (guestHistory.length === 0) {
                    addMessage('Bạn chưa có lịch sử chat nào. Hãy bắt đầu trò chuyện! 💬', 'bot', false);
                    return;
                }
                
                // Xóa màn hình chat hiện tại
                chatMessages.innerHTML = '';
                
                // Hiển thị header với search box
                const headerDiv = document.createElement('div');
                headerDiv.style.cssText = 'padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; margin-bottom: 15px; text-align: center; font-weight: bold;';
                headerDiv.innerHTML = `
                    📜 Lịch sử chat của bạn<br>
                    <small style="font-weight: normal; opacity: 0.9;">(${guestHistory.length} tin nhắn - Lưu cục bộ)</small>
                    <div style="margin-top: 10px;">
                        <input type="text" id="history-search" placeholder="🔍 Tìm kiếm..." style="width: 100%; padding: 8px; border: none; border-radius: 6px; font-size: 14px; color: #333;">
                    </div>
                `;
                chatMessages.appendChild(headerDiv);
                
                // Container cho messages (để có thể filter)
                const messagesContainer = document.createElement('div');
                messagesContainer.id = 'history-messages-container';
                
                // Hiển thị từng tin nhắn
                guestHistory.forEach((item, index) => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = `message ${item.sender} history-message`;
                    msgDiv.setAttribute('data-index', index);
                    msgDiv.setAttribute('data-message', item.message.toLowerCase());
                    
                    let formattedText = item.message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    formattedText = formattedText.replace(/\n/g, '<br>');
                    msgDiv.innerHTML = formattedText;
                    
                    messagesContainer.appendChild(msgDiv);
                });
                
                chatMessages.appendChild(messagesContainer);
                
                // Nút bắt đầu chat mới
                const startNewBtn = document.createElement('button');
                startNewBtn.textContent = '💬 Bắt đầu chat mới';
                startNewBtn.style.cssText = 'width: 100%; padding: 12px; background: #10a37f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 10px;';
                startNewBtn.onclick = () => {
                    resetChat();
                };
                chatMessages.appendChild(startNewBtn);
                
                // Thêm search functionality
                const searchInput = document.getElementById('history-search');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        const messages = messagesContainer.querySelectorAll('.history-message');
                        let matchCount = 0;
                        
                        messages.forEach(msg => {
                            const messageText = msg.getAttribute('data-message');
                            
                            if (searchTerm === '' || messageText.includes(searchTerm)) {
                                msg.style.display = '';
                                
                                // Highlight search term
                                if (searchTerm !== '') {
                                    const originalHtml = msg.innerHTML;
                                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                                    msg.innerHTML = originalHtml.replace(regex, '<mark style="background: yellow; padding: 2px;">$1</mark>');
                                    matchCount++;
                                }
                            } else {
                                msg.style.display = 'none';
                            }
                        });
                        
                        // Hiển thị số kết quả
                        if (searchTerm !== '') {
                            searchInput.placeholder = `🔍 Tìm thấy ${matchCount} kết quả`;
                        } else {
                            searchInput.placeholder = '🔍 Tìm kiếm...';
                        }
                    });
                }
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
                console.log('✅ Đã tải lịch sử guest từ localStorage');
            } catch (error) {
                console.error('❌ Lỗi tải guest history:', error);
                addMessage('Lỗi tải lịch sử chat! 😢', 'bot', false);
            }
            return;
        }
        
        // Registered user: đọc từ database
        try {
            const res = await fetch(`/api/chat/history/${userId}?limit=50`);
            const data = await res.json();
            
            console.log('📥 Dữ liệu lịch sử nhận được:', data);
            
            if (data.success && data.history.length > 0) {
                // Xóa chat hiện tại
                chatMessages.innerHTML = '';
                
                // Hiển thị header lịch sử với search box
                const headerDiv = document.createElement('div');
                headerDiv.style.cssText = 'padding: 15px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; border-radius: 12px; margin-bottom: 15px; text-align: center; font-weight: bold;';
                headerDiv.innerHTML = `
                    📜 Lịch sử Chat (${data.history.length} tin nhắn)<br>
                    <small style="font-size: 0.8rem; opacity: 0.9;">Click "Bắt đầu chat mới" để tiếp tục trò chuyện</small>
                    <div style="margin-top: 10px;">
                        <input type="text" id="history-search-db" placeholder="🔍 Tìm kiếm..." style="width: 100%; padding: 8px; border: none; border-radius: 6px; font-size: 14px; color: #333;">
                    </div>
                `;
                chatMessages.appendChild(headerDiv);
                
                // Container cho messages
                const messagesContainer = document.createElement('div');
                messagesContainer.id = 'history-messages-container-db';
                
                // Hiển thị từng tin nhắn
                data.history.forEach((item, index) => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = `message ${item.sender} history-message-db`;
                    msgDiv.setAttribute('data-index', index);
                    msgDiv.setAttribute('data-message', item.message.toLowerCase());
                    
                    let formattedText = item.message.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                    formattedText = formattedText.replace(/\n/g, '<br>');
                    msgDiv.innerHTML = formattedText;
                    
                    messagesContainer.appendChild(msgDiv);
                });
                
                chatMessages.appendChild(messagesContainer);
                
                // Thêm nút "Bắt đầu chat mới"
                const newChatDiv = document.createElement('div');
                newChatDiv.style.cssText = 'text-align: center; margin-top: 15px;';
                const newChatBtn = document.createElement('button');
                newChatBtn.textContent = '🔄 Bắt đầu chat mới';
                newChatBtn.style.cssText = 'background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem;';
                newChatBtn.onclick = () => resetChat();
                newChatDiv.appendChild(newChatBtn);
                chatMessages.appendChild(newChatDiv);
                
                // Thêm search functionality cho database history
                const searchInputDb = document.getElementById('history-search-db');
                if (searchInputDb) {
                    searchInputDb.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        const messages = messagesContainer.querySelectorAll('.history-message-db');
                        let matchCount = 0;
                        
                        messages.forEach(msg => {
                            const messageText = msg.getAttribute('data-message');
                            
                            if (searchTerm === '' || messageText.includes(searchTerm)) {
                                msg.style.display = '';
                                
                                // Highlight search term
                                if (searchTerm !== '') {
                                    const originalText = data.history[msg.getAttribute('data-index')].message;
                                    let formattedText = originalText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                                    formattedText = formattedText.replace(/\n/g, '<br>');
                                    
                                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                                    msg.innerHTML = formattedText.replace(regex, '<mark style="background: yellow; padding: 2px;">$1</mark>');
                                    matchCount++;
                                } else {
                                    // Reset về original text
                                    const originalText = data.history[msg.getAttribute('data-index')].message;
                                    let formattedText = originalText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                                    formattedText = formattedText.replace(/\n/g, '<br>');
                                    msg.innerHTML = formattedText;
                                }
                            } else {
                                msg.style.display = 'none';
                            }
                        });
                        
                        // Hiển thị số kết quả
                        if (searchTerm !== '') {
                            searchInputDb.placeholder = `🔍 Tìm thấy ${matchCount} kết quả`;
                        } else {
                            searchInputDb.placeholder = '🔍 Tìm kiếm...';
                        }
                    });
                }
                
                // Scroll xuống cuối
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
            } else {
                addMessage('Bạn chưa có lịch sử chat nào. Hãy bắt đầu trò chuyện! 💬', 'bot');
            }
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
            addMessage('Không thể tải lịch sử chat. Vui lòng thử lại sau! ❌', 'bot');
        }
    }

    function resetChat() {
        // Xóa màn hình chat
        chatMessages.innerHTML = '';
        
        // Gửi lệnh intro để load tin nhắn chào và chips mặc định
        sendMessage({ q: null, payload: { action: 'go_node', value: 'intro' } });
    }

    function updateLoginStatus() {
        if (isLoggedIn && userName) {
            // Có thể thêm hiển thị tên người dùng vào header
            const chatTitle = document.getElementById('chat-title');
            if (chatTitle) {
                chatTitle.innerHTML = `Trợ lý Đà Lạt <span style="font-size:0.75rem; opacity:0.8;">| ${userName}</span>`;
            }
        }
    }

    function handleLoginSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        if (!email || !password) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }
        
        // Gọi API đăng nhập
        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Lưu thông tin user vào localStorage
                localStorage.setItem('dalat_user_logged_in', 'true');
                localStorage.setItem('dalat_user_id', data.user.id);
                localStorage.setItem('dalat_user_name', data.user.name);
                localStorage.setItem('dalat_user_email', data.user.email);
                localStorage.setItem('dalat_user_phone', data.user.phone);
                localStorage.setItem('dalat_user_role', data.user.role || 'user');
                
                isLoggedIn = true;
                userId = data.user.id;
                userName = data.user.name;
                userEmail = data.user.email;
                
                loginModal.style.display = 'none';
                loginForm.reset();
                
                updateLoginStatus();
                updateHeaderLoginStatus();
                
                // Xóa chat hiện tại và tải lịch sử
                chatMessages.innerHTML = '';
                loadChatHistory();
                
                alert(`✅ ${data.message} Chào mừng ${data.user.name} quay lại!`);
            } else {
                alert(`❌ ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('❌ Lỗi kết nối server!');
        });
    }

    function handleRegisterSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value.trim();
        const confirmPassword = document.getElementById('register-confirm-password').value.trim();
        
        // Validate
        if (!name || !email || !phone || !password || !confirmPassword) {
            alert('Vui lòng điền đầy đủ các thông tin bắt buộc');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        if (password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }
        
        // Gửi request đăng ký
        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Lưu thông tin user
                localStorage.setItem('dalat_user_logged_in', 'true');
                localStorage.setItem('dalat_user_id', data.user.id);
                localStorage.setItem('dalat_user_name', data.user.name);
                localStorage.setItem('dalat_user_email', data.user.email);
                localStorage.setItem('dalat_user_phone', data.user.phone);
                localStorage.setItem('dalat_user_role', data.user.role || 'user');
                
                isLoggedIn = true;
                userId = data.user.id;
                userName = data.user.name;
                userEmail = data.user.email;
                
                registerModal.style.display = 'none';
                registerForm.reset();
                
                updateLoginStatus();
                updateHeaderLoginStatus();
                
                chatMessages.innerHTML = '';
                alert(`🎉 ${data.message} Chào mừng ${name} đến với Dalat Trip!`);
                
                sendMessage({ q: null, payload: { action: 'go_node', value: 'intro' } });
            } else {
                alert(`❌ ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('❌ Lỗi kết nối server!');
        });
    }

    function toggleChat() {
        chatWidget.classList.toggle('open');
        launcherButton.style.display = chatWidget.classList.contains('open') ? 'none' : 'flex';
        if (chatWidget.classList.contains('open')) {
            chatInput.focus();
        }
    }

    function minimizeChat() {
        chatWidget.classList.remove('open');
        chatWidget.classList.remove('maximized');
        launcherButton.style.display = 'flex';
    }

    function toggleMaximize() {
        chatWidget.classList.toggle('maximized');
        const maxButton = document.getElementById('chat-maximize');
        if (chatWidget.classList.contains('maximized')) {
            maxButton.textContent = '❐'; // Icon thu nhỏ
            maxButton.title = 'Thu về kích thước ban đầu';
        } else {
            maxButton.textContent = '□'; // Icon phóng to
            maxButton.title = 'Phóng to';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const query = chatInput.value.trim();
        if (!query) return;

        addMessage(query, 'user');
        chatInput.value = '';
        await sendMessage({ q: query, payload: null });
    }

    // [MỚI] Xử lý gửi đơn đặt chỗ
    async function handleBookingSubmit(e) {
        e.preventDefault();
        
        const type = document.getElementById('b-type').value;

        const data = {
            placeName: document.getElementById('b-place-name').value,
            type: type,
            customerName: document.getElementById('b-name').value,
            phone: document.getElementById('b-phone').value,
            dateIn: document.getElementById('b-date-in').value, 
            guests: document.getElementById('b-guests').value,
            // Lấy dữ liệu tùy theo loại
            time: type === 'table' ? document.getElementById('b-time').value : null,
            dateOut: type === 'room' ? document.getElementById('b-date-out').value : null
        };

        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            alert(result.message);
            modal.style.display = 'none';
            bookingForm.reset();
            
            // Thông báo xác nhận
            let confirmMsg = "";
            if (type === 'room') {
                confirmMsg = `🎉 Đã nhận đơn đặt phòng từ ${data.dateIn} đến ${data.dateOut} tại **${data.placeName}**.`;
            } else {
                confirmMsg = `🎉 Đã nhận đơn đặt bàn lúc ${data.time} ngày ${data.dateIn} tại **${data.placeName}**.`;
            }
            addMessage(confirmMsg, 'bot');

        } catch (err) {
            alert("Lỗi khi đặt chỗ. Vui lòng thử lại.");
        }
    }

    async function sendMessage({ q, payload }) {
        // Xóa các nút cũ trong chatMessages
        const oldChoices = document.querySelectorAll('.choices-inline');
        oldChoices.forEach(el => el.remove());
        
        chatInput.disabled = true;

        let location = null;
        // (Code lấy vị trí giữ nguyên hoặc bỏ qua nếu không cần)

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q, payload, sid, loc: location })
            });
            const data = await res.json();
            
            // Hiệu ứng typing từng chữ
            await typewriterEffect(data.response);
            
            // Hiển thị nút bấm sau khi typing xong
            renderChoices(data.choices);

        } catch (err) {
            addMessage("Lỗi kết nối. Bạn thử lại nhé!", 'bot');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    }

    // --- 4. CÁC HÀM TIỆN ÍCH (HELPER) ---

    function renderChoices(choices) {
        if (!choices || choices.length === 0) {
            chatInput.placeholder = "Hỏi tôi về Đà Lạt...";
            return;
        }

        chatInput.placeholder = "Hoặc chọn một tùy chọn bên trên...";

        // Tạo container cho các nút và thêm vào chatMessages (không phải choicesContainer)
        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices-inline';

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button-inline';
            button.textContent = choice.label;
            
            button.addEventListener('click', () => {
                // XỬ LÝ CÁC LOẠI ACTION
                if (choice.payload.action === 'open_link') {
                    window.open(choice.payload.value, '_blank');
                } 
                else if (choice.payload.action === 'open_booking') { 
                    // [MỚI] Mở Modal Đặt chỗ
                    openBookingModal(choice.payload.value, choice.payload.type || 'table');
                }
                else if (choice.payload.action === 'export_itinerary') {
                    // [MỚI] Xuất lịch trình ra file TXT
                    exportItinerary();
                }
                else {
                    addMessage(choice.label, 'user');
                    sendMessage({ q: null, payload: choice.payload });
                }
            });
            choicesDiv.appendChild(button);
        });

        // Thêm vào chatMessages thay vì choicesContainer
        chatMessages.appendChild(choicesDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // [MỚI] Hàm mở Modal thông minh (Ẩn/Hiện ngày giờ)
    function openBookingModal(placeName, type) {
        // Kiểm tra đăng nhập
        if (!isLoggedIn) {
            addMessage('⚠️ Bạn cần đăng nhập trước khi đặt bàn. Vui lòng bấm nút "Đăng nhập" ở góc trên bên phải màn hình.', 'bot');
            // Không tự động mở modal login nữa
            return;
        }
        
        if (!modal) return;
        modal.style.display = 'flex';
        
        const title = type === 'room' ? 'Đặt phòng' : 'Đặt bàn';
        document.getElementById('modal-title').innerText = `${title} tại: ${placeName}`;
        document.getElementById('b-place-name').value = placeName;
        document.getElementById('b-type').value = type;

        // Tự động điền thông tin người dùng đã đăng nhập
        const userName = localStorage.getItem('dalat_user_name') || '';
        const userPhone = localStorage.getItem('dalat_user_phone') || '';
        document.getElementById('b-name').value = userName;
        document.getElementById('b-phone').value = userPhone;

        // Các element điều khiển
        const labelDateIn = document.getElementById('label-date-in');
        const wrapperTime = document.getElementById('wrapper-time');
        const wrapperDateOut = document.getElementById('wrapper-date-out');
        const inputDateOut = document.getElementById('b-date-out');
        const inputTime = document.getElementById('b-time');

        if (type === 'room') {
            // CẤU HÌNH CHO KHÁCH SẠN
            labelDateIn.innerText = "Từ ngày";     
            wrapperTime.style.display = 'none';    
            inputTime.required = false;            
            
            wrapperDateOut.style.display = 'block'; 
            inputDateOut.required = true;           
        } else {
            // CẤU HÌNH CHO NHÀ HÀNG
            labelDateIn.innerText = "Ngày đặt";
            wrapperTime.style.display = 'block';   
            inputTime.required = true;
            
            wrapperDateOut.style.display = 'none'; 
            inputDateOut.required = false;
        }
    }

    function addMessage(text, sender, shouldSave = true) {
        addMessageToUI(text, sender, shouldSave);
    }

    function addMessageToUI(text, sender, shouldSave = true) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        // Hỗ trợ in đậm (**text**) đơn giản
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); 
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        msgDiv.innerHTML = formattedText;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Lưu vào lịch sử cho TẤT CẢ người dùng (cả guest và registered)
        if (shouldSave) {
            saveChatHistory(text, sender);
        }
    }

    function removeTyping() {
        const typingMsg = document.querySelector('.message.typing');
        if (typingMsg) {
            typingMsg.remove();
        }
    }

    // [MỚI] Hiệu ứng typewriter - chữ xuất hiện từng ký tự
    async function typewriterEffect(text) {
        // Tạo bubble bot trống
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerHTML = '';
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Format text với bold và line breaks
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        formattedText = formattedText.replace(/\n/g, '<br>');

        // Tạo temporary div để parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedText;

        // Lấy text thuần và vị trí các tag HTML
        const htmlNodes = [];
        const plainText = [];
        
        function extractNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                for (let i = 0; i < text.length; i++) {
                    plainText.push(text[i]);
                    htmlNodes.push(null);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') {
                    plainText.push('\n');
                    htmlNodes.push('BR');
                } else if (node.tagName === 'B') {
                    const startIndex = plainText.length;
                    htmlNodes.push(`<b>`);
                    plainText.push('');
                    
                    node.childNodes.forEach(child => extractNodes(child));
                    
                    htmlNodes.push(`</b>`);
                    plainText.push('');
                } else {
                    node.childNodes.forEach(child => extractNodes(child));
                }
            }
        }
        
        tempDiv.childNodes.forEach(child => extractNodes(child));

        // Typing với tốc độ nhanh
        let currentHTML = '';
        let inBold = false;
        
        for (let i = 0; i < plainText.length; i++) {
            const char = plainText[i];
            const tag = htmlNodes[i];
            
            if (tag === '<b>') {
                currentHTML += '<b>';
                inBold = true;
                continue;
            } else if (tag === '</b>') {
                currentHTML += '</b>';
                inBold = false;
                continue;
            } else if (tag === 'BR') {
                currentHTML += '<br>';
            } else if (char === '\n') {
                currentHTML += '<br>';
            } else if (char) {
                currentHTML += char;
            } else {
                continue;
            }
            
            msgDiv.innerHTML = currentHTML + (inBold ? '</b>' : '');
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Tốc độ: 15ms mỗi ký tự (nhanh), có thể điều chỉnh
            await new Promise(resolve => setTimeout(resolve, 15));
        }
        
        // Đảm bảo HTML cuối cùng đúng
        msgDiv.innerHTML = formattedText;
        
        // Lưu tin nhắn bot vào lịch sử
        if (isLoggedIn && userId) {
            saveChatHistory(text, 'bot');
        }
    }

    // [MỚI] Xuất lịch trình ra file TXT
    async function exportItinerary() {
        // Lấy tất cả tin nhắn bot (lịch trình thường là tin nhắn cuối cùng dài nhất)
        const botMessages = Array.from(document.querySelectorAll('.message.bot'));
        if (botMessages.length === 0) {
            alert('Không tìm thấy lịch trình để xuất');
            return;
        }
        
        // Lấy tin nhắn cuối cùng (có thể là lịch trình)
        const lastBotMessage = botMessages[botMessages.length - 1];
        const content = lastBotMessage.innerText || lastBotMessage.textContent;
        
        const now = new Date();
        const filename = `lich-trinh-dalat-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}.txt`;
        
        try {
            const res = await fetch('/api/export-itinerary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, filename })
            });
            
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                
                addMessage('✅ Đã tải xuống file lịch trình thành công!', 'bot');
            } else {
                alert('Lỗi khi xuất file');
            }
        } catch (err) {
            console.error('Export error:', err);
            alert('Lỗi khi xuất file. Vui lòng thử lại.');
        }
    }

    // --- 5. BẮT ĐẦU CHẠY ---
    createChatUI(); 
    
    // Xử lý nút đăng nhập/đăng xuất ngoài header
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const registerBtn = document.getElementById('register-btn');
    const userGreeting = document.getElementById('user-greeting');
    
    function updateHeaderLoginStatus() {
        const userRole = localStorage.getItem('dalat_user_role');
        const adminLink = document.getElementById('admin-link');
        
        if (isLoggedIn && userName) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (userGreeting) {
                userGreeting.textContent = `Xin chào, ${userName}!`;
                userGreeting.style.display = 'inline-block';
            }
            
            // Hiển thị link Admin nếu là admin
            if (adminLink && userRole === 'admin') {
                adminLink.style.display = 'inline-block';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userGreeting) userGreeting.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            registerModal.style.display = 'flex';
        });
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                console.log('👋 Đang đăng xuất...');
                
                // Xóa lịch sử chat hiện tại
                clearChatHistoryOnLogout();
                
                // Xóa TẤT CẢ thông tin user khỏi localStorage
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
                
                console.log('✅ Đã xóa localStorage. Trạng thái:', {
                    logged_in: localStorage.getItem('dalat_user_logged_in'),
                    user_id: localStorage.getItem('dalat_user_id')
                });
                
                updateHeaderLoginStatus();
                updateLoginStatus();
                
                // Bắt đầu lại cuộc trò chuyện
                sendMessage({ q: null, payload: { action: 'go_node', value: 'intro' } });
                
                alert('👋 Bạn đã đăng xuất thành công!');
            }
        });
    }
    
    // Cập nhật trạng thái ban đầu
    updateHeaderLoginStatus();
    
    // Tải lịch sử chat nếu đã đăng nhập
    if (isLoggedIn && userEmail) {
        loadChatHistory();
    }
    
    // Bắt đầu cuộc trò chuyện bằng cách gọi node 'intro'
    sendMessage({ q: null, payload: { action: 'go_node', value: 'intro' } });
    
    // ========== ADMIN NOTIFICATION POLLING ==========
    if (isLoggedIn && userRole === 'admin') {
        console.log('👑 Admin đã đăng nhập! Bắt đầu polling notifications...');
        let lastBookingId = 0;
        
        async function checkForNewBookings() {
            try {
                const res = await fetch('/api/admin/notifications/latest', {
                    headers: { 'x-user-id': userId.toString() }
                });
                const data = await res.json();
                
                if (data.success && data.hasNew && data.booking) {
                    // Kiểm tra xem đây có phải booking mới chưa thấy không
                    if (data.booking.id > lastBookingId) {
                        console.log('🔔 Admin phát hiện booking mới! ID:', data.booking.id);
                        lastBookingId = data.booking.id;
                        showAdminBookingNotification(data.booking);
                    }
                }
            } catch (error) {
                console.error('❌ Lỗi check admin notifications:', error);
            }
        }
        
        function showAdminBookingNotification(booking) {
            // Hiển thị chatbot nếu đang đóng
            if (!chatWidget.classList.contains('open')) {
                launcherButton.click();
            }
            
            // Format ngày giờ đẹp
            let dateStr = booking.date;
            try {
                const dateObj = new Date(booking.date);
                dateStr = dateObj.toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                });
            } catch (e) {
                console.log('Không thể format date:', e);
            }
            
            const timeStr = booking.time || 'Chưa xác định';
            
            // Tạo tin nhắn thông báo với HTML
            const msgDiv = document.createElement('div');
            msgDiv.className = 'message bot';
            msgDiv.style.cssText = 'background: linear-gradient(135deg, #fff3cd, #ffeaa7); border: 2px solid #ffc107; padding: 15px; border-radius: 15px;';
            msgDiv.innerHTML = `
                🔔 <strong style="color: #f39c12;">Có đặt bàn mới!</strong><br><br>
                📅 <strong>Thời gian:</strong> ${dateStr} lúc ${timeStr}<br>
                👥 <strong>Số người:</strong> ${booking.guests}<br>
                🏠 <strong>Nhà hàng:</strong> ${booking.restaurant}<br>
                👤 <strong>Khách hàng:</strong> ${booking.customer_name}<br>
                📞 <strong>SĐT:</strong> ${booking.phone}<br><br>
                <button onclick="window.location.href='/admin.html?tab=bookings&bookingId=${booking.id}'" 
                        style="background: linear-gradient(135deg, #4CAF50, #2E7D32); 
                               color: white; 
                               border: none; 
                               padding: 10px 20px; 
                               border-radius: 20px; 
                               cursor: pointer; 
                               font-weight: 600;
                               margin-top: 10px;
                               box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
                               transition: all 0.3s;">
                    📋 Xem chi tiết & Xác nhận
                </button>
            `;
            
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Phát âm thanh thông báo
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LvuWUcBSuBzvHZiTYIF2G47+mVTAwOg');
                audio.play().catch(e => console.log('Không thể phát âm thanh:', e));
            } catch (e) {
                console.log('Không thể tạo âm thanh thông báo');
            }
        }
        
        // Check ngay lần đầu
        checkForNewBookings();
        
        // Polling mỗi 5 giây
        setInterval(checkForNewBookings, 5000);
    }
});