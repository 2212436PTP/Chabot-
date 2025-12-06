// DÒNG NÀY ĐANG BỊ THIẾU "EXPORT"
export const FLOW = {
    start: "intro",
    nodes: {
        intro: {
            text: "Xin chào 👋 Mình là trợ lý du lịch Đà Lạt.\nBạn muốn tìm thông tin gì hôm nay?",
            choices: [
                { label: "🌸 Địa điểm tham quan", next: "sights" },
                { label: "🍲 Ẩm thực & Cafe", next: "foods" },
                { label: "🏨 Khách sạn / Homestay", next: "hotels" },
                { label: "🗓️ Lịch trình gợi ý", next: "itins" },
                { label: "🛵 Phương tiện di chuyển", next: "transport" },
                { label: "🛍️ Mua sắm & đặc sản", next: "shopping" },
                { label: "☔ Thời tiết & thời điểm", next: "weather" },
                { label: "🎟️ Vé tham quan & tips", next: "tickets_tips" },
                { label: "📅 Sự kiện & lễ hội", next: "events" },
            ],
        },
        /* ===== ĐỊA ĐIỂM ===== */
        sights: {
            text: "Bạn muốn xem nhóm địa điểm nào?",
            choices: [
                { label: "🏞️ Thiên nhiên", next: "sights_nature" },
                { label: "🌺 Vườn/hoa & cảnh quan", next: "sights_gardens" },
                { label: "🏛️ Văn hoá - lịch sử", next: "sights_culture" },
                { label: "📸 Check-in/Chụp ảnh", next: "sights_photo" },
                { label: "🎢 Trải nghiệm/Hoạt động", next: "sights_activities" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        sights_nature: {
            text: "Thiên nhiên nổi bật:\n• Langbiang (leo núi)\n• Hồ Tuyền Lâm (chèo thuyền)\n• Thác Datanla/Prenn (mạo hiểm)\n• Thác Pongour (xa trung tâm)",
            choices: [
                { label: "📍 Map Langbiang", link: "https://maps.google.com/?q=Langbiang", next: null },
                { label: "📍 Map Hồ Tuyền Lâm", link: "https://maps.google.com/?q=H%E1%BB%93+Tuy%E1%BB%81n+L%C3%A2m", next: null },
                { label: "📍 Map Datanla", link: "https://maps.google.com/?q=Thac+Datanla", next: null },
                { label: "📍 Map Pongour", link: "https://maps.google.com/?q=Thac+Pongour", next: null },
                { label: "⬅ Quay lại Địa điểm", next: "sights" },
                { label: "🏠 Về menu chính", next: "intro" },
            ],
        },
        sights_gardens: {
            text: "Vườn/hoa & cảnh quan:\n• Vườn hoa TP\n• Fresh Garden / QUE Garden\n• Đồi chè Cầu Đất\n• Vườn dâu (theo mùa)",
            choices: [
                { label: "📍 Vườn hoa TP", link: "https://maps.google.com/?q=V%C6%B0%E1%BB%9Dn+hoa+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "📍 Fresh Garden", link: "https://maps.google.com/?q=Fresh+Garden+Da+Lat", next: null },
                { label: "📍 QUE Garden", link: "https://maps.google.com/?q=QUE+Garden+Da+Lat", next: null },
                { label: "📍 Đồi chè Cầu Đất", link: "https://maps.google.com/?q=Cau+Dat+Tea+Hill", next: null },
                { label: "📍 Vườn dâu", link: "https://maps.google.com/?q=Vuon+dau+Da+Lat", next: null },
                { label: "⬅ Quay lại Địa điểm", next: "sights" },
            ],
        },
        sights_culture: {
            text: "Văn hoá - lịch sử:\n• Ga Đà Lạt\n• Dinh Bảo Đại\n• Nhà thờ Con Gà\n• Chùa Linh Phước",
            choices: [
                { label: "📍 Ga Đà Lạt", link: "https://maps.google.com/?q=Ga+Da+Lat", next: null },
                { label: "📍 Dinh Bảo Đại", link: "https://maps.google.com/?q=Dinh+Bao+Dai+Da+Lat", next: null },
                { label: "📍 Nhà thờ Con Gà", link: "https://maps.google.com/?q=Nha+tho+Chanh+Toa+Da+Lat", next: null },
                { label: "📍 Chùa Linh Phước", link: "https://maps.google.com/?q=Chua+Linh+Phuoc", next: null },
                { label: "⬅ Quay lại Địa điểm", next: "sights" },
            ],
        },
        sights_photo: {
            text: "Check-in/Chụp ảnh:\n• Quảng trường Lâm Viên\n• Đồi cỏ hồng (mùa)\n• Cầu Đất bình minh\n• Cafe view đồi",
            choices: [
                { label: "📍 Lâm Viên", link: "https://maps.google.com/?q=Quang+truong+Lam+Vien", next: null },
                { label: "📍 Đồi cỏ hồng", link: "https://maps.google.com/?q=%C4%90%E1%BB%93i+c%E1%BB%8F+h%E1%BB%93ng+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "📍 Cầu Đất", link: "https://maps.google.com/?q=Cau+Dat+Da+Lat", next: null },
                { label: "☕ Cafe view đồi", next: "foods_cafe_view" },
                { label: "⬅ Quay lại Địa điểm", next: "sights" },
            ],
        },
        sights_activities: {
            text: "Trải nghiệm:\n• Cáp treo/đồi Robin\n• Máng trượt Datanla\n• Kayak/SUP Tuyền Lâm\n• Cắm trại ven hồ",
            choices: [
                { label: "📍 Đồi Robin", link: "https://maps.google.com/?q=Doi+Robin+Da+Lat", next: null },
                { label: "📍 Máng trượt", link: "https://maps.google.com/?q=Datanla+Alpine+Coaster", next: null },
                { label: "📍 Kayak Tuyền Lâm", link: "https://maps.google.com/?q=Kayak+Tuyen+Lam+Lake", next: null },
                { label: "⬅ Quay lại Địa điểm", next: "sights" },
            ],
        },
        /* ===== ẨM THỰC & CAFE ===== */
        coffee: {
            text: "Bạn muốn cafe kiểu gì?",
            choices: [
                { label: "🌄 View rừng/đồi", next: "foods_cafe_view" },
                { label: "🏙️ Gần trung tâm", next: "foods_cafe_center" },
                { label: "🌅 Rooftop/hoàng hôn", next: "foods_cafe_rooftop" },
                { label: "🌾 Nông trại cà phê", next: "foods_cafe_farm" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        food: {
            text: "Bạn muốn ăn gì?",
            choices: [
                { label: "🍜 Bữa sáng", next: "foods_breakfast" },
                { label: "🍛 Bữa trưa/tối", next: "foods_meals" },
                { label: "🍢 Ăn vặt/đặc sản", next: "foods_snacks" },
                { label: "🥗 Ăn chay", next: "foods_vegan" },
                { label: "🌙 Ăn đêm", next: "foods_night" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        attractions: {
            text: "Bạn muốn khám phá điểm nào?",
            choices: [
                { label: "🌲 Thiên nhiên", next: "sights_nature" },
                { label: "🏛️ Văn hoá - lịch sử", next: "sights_culture" },
                { label: "🌺 Vườn hoa & cảnh quan", next: "sights_gardens" },
                { label: "📸 Điểm check-in đẹp", next: "sights_photo" },
                { label: "🎯 Trải nghiệm vui chơi", next: "sights_activities" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        foods: {
            text: "Bạn muốn khám phá mục nào?",
            choices: [
                { label: "🍜 Bữa sáng", next: "foods_breakfast" },
                { label: "🍛 Bữa trưa/tối", next: "foods_meals" },
                { label: "🍢 Ăn vặt/đặc sản", next: "foods_snacks" },
                { label: "🥗 Ăn chay", next: "foods_vegan" },
                { label: "🌙 Ăn đêm", next: "foods_night" },
                { label: "☕ Cafe/Trà", next: "foods_cafe" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        foods_breakfast: {
            text: "Bữa sáng:\n• Bánh căn\n• Bánh mì xíu mại\n• Bún bò, mì Quảng\n• Phở gà",
            choices: [
                { label: "📍 Bánh căn (map)", link: "https://maps.google.com/?q=Banh+can+Da+Lat", next: null },
                { label: "📍 Xíu mại (map)", link: "https://maps.google.com/?q=Banh+mi+xiu+mai+Da+Lat", next: null },
                { label: "⬅ Quay lại Ẩm thực", next: "foods" },
            ],
        },
        foods_meals: {
            text: "Bữa trưa/tối bạn thích gì?",
            choices: [
                { label: "🍲 Lẩu gà lá é", next: "foods_lau_la_e" },
                { label: "🥩 Lẩu bò Ba Toa", next: "foods_lau_bo" },
                { label: "🔥 Nướng/BBQ", next: "foods_bbq" },
                { label: "⬅ Quay lại Ẩm thực", next: "foods" },
            ],
        },
        foods_lau_la_e: {
            text: "Lẩu gà lá é (200k–350k/nồi):\n• Tao Ngộ (đậm vị)\n• Hạnh (nước thanh)\n• 668 (giá dễ chịu)",
            choices: [
                { label: "🐔 Tao Ngộ (map)", link: "https://maps.google.com/?q=l%E1%BA%A9u+g%C3%A0+l%C3%A1+%C3%A9+Tao+Ng%E1%BB%99+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "🐔 Hạnh (map)", link: "https://maps.google.com/?q=l%E1%BA%A9u+g%C3%A0+l%C3%A1+%C3%A9+H%E1%BA%A1nh+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "🐔 668 (map)", link: "https://maps.google.com/?q=l%E1%BA%A9u+g%C3%A0+l%C3%A1+%C3%A9+668+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "⬅ Quay lại bữa trưa/tối", next: "foods_meals" },
            ],
        },
        foods_lau_bo: {
            text: "Lẩu bò Ba Toa (quán gỗ…): nước lẩu đậm, thịt nhiều.",
            choices: [
                { label: "📍 Map Lẩu bò Ba Toa", link: "https://maps.google.com/?q=La%CC%82%CC%89u+bo%CC%80+Ba+Toa+Da+Lat", next: null },
                { label: "⬅ Quay lại bữa trưa/tối", next: "foods_meals" },
            ],
        },
        foods_bbq: {
            text: "Nướng/BBQ: nhiều quán Phan Đình Phùng, Bùi Thị Xuân.",
            choices: [
                { label: "📍 Tìm BBQ gần tôi", link: "https://maps.google.com/?q=BBQ+Da+Lat", next: null },
                { label: "⬅ Quay lại bữa trưa/tối", next: "foods_meals" },
            ],
        },
        foods_snacks: {
            text: "Ăn vặt/đặc sản:\n• Bánh tráng nướng\n• Kem bơ\n• Nem nướng\n• Sữa đậu nành",
            choices: [
                { label: "🍕 Bánh tráng nướng", next: "foods_banhtrang" },
                { label: "🍨 Kem bơ (map)", link: "https://maps.google.com/?q=Kem+bo+Da+Lat", next: null },
                { label: "📍 Sữa đậu nành", link: "https://maps.google.com/?q=Sua+dau+nanh+Da+Lat", next: null },
                { label: "⬅ Quay lại Ẩm thực", next: "foods" },
            ],
        },
        foods_banhtrang: {
            text: "Bánh tráng nướng:\n• Khu Hoà Bình\n• 61 Nguyễn Văn Trỗi\n• 26B Hoàng Diệu",
            choices: [
                { label: "📍 Hoà Bình", link: "https://maps.google.com/?q=Khu+H%C3%B2a+B%C3%ACnh+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "📍 61 Nguyễn Văn Trỗi", link: "https://maps.google.com/?q=61+Nguy%E1%BB%85n+V%C4%83n+Tr%E1%BB%97i+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "📍 26B Hoàng Diệu", link: "https://maps.google.com/?q=26B+Ho%C3%A0ng+Di%E1%BB%87u+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "⬅ Quay lại Ăn vặt", next: "foods_snacks" },
            ],
        },
        foods_vegan: {
            text: "Ăn chay: nhiều quán quanh trung tâm, giá thân thiện.",
            choices: [
                { label: "📍 Tìm quán chay", link: "https://maps.google.com/?q=quan+chay+Da+Lat", next: null },
                { label: "⬅ Quay lại Ẩm thực", next: "foods" },
            ],
        },
        foods_night: {
            text: "Ăn đêm:\n• Bánh tráng nướng Hoà Bình\n• Sữa đậu nành chợ đêm\n• Cháo gà, phở bò",
            choices: [
                { label: "📍 Map Chợ đêm", link: "https://maps.google.com/?q=cho+dem+Da+Lat", next: null },
                { label: "⬅ Quay lại Ẩm thực", next: "foods" },
            ],
        },
        foods_cafe: {
            text: "Bạn muốn cafe kiểu gì?",
            choices: [
                { label: "🌄 View rừng/đồi", next: "foods_cafe_view" },
                { label: "🏙️ Gần trung tâm", next: "foods_cafe_center" },
                { label: "🌅 Rooftop/hoàng hôn", next: "foods_cafe_rooftop" },
                { label: "🌾 Nông trại cà phê", next: "foods_cafe_farm" },
                { label: "⬅ Quay lại", next: "foods" },
            ],
        },
        foods_cafe_view: {
            text: "Cafe view đồi thông:\n• Mê Linh\n• Horizon\n• Túi Mơ To",
            choices: [
                { label: "📍 Mê Linh", link: "https://maps.google.com/?q=Me+Linh+Coffee+Garden", next: null },
                { label: "📍 Horizon", link: "https://maps.google.com/?q=Horizon+Coffee+Da+Lat", next: null },
                { label: "📍 Túi Mơ To", link: "https://maps.google.com/?q=T%C3%BAi+M%C6%A1+To+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "⬅ Quay lại Cafe", next: "foods_cafe" },
            ],
        },
        foods_cafe_center: {
            text: "Cafe trung tâm:\n• An Cafe\n• Bicycle Up\n• La Viet Coffee",
            choices: [
                { label: "📍 An Cafe", link: "https://maps.google.com/?q=An+Cafe+Da+Lat", next: null },
                { label: "📍 Bicycle Up", link: "https://maps.google.com/?q=Bicycle+Up+Coffee+Da+Lat", next: null },
                { label: "📍 La Viet", link: "https://maps.google.com/?q=La+Viet+Coffee+Da+Lat", next: null },
                { label: "⬅ Quay lại Cafe", next: "foods_cafe" },
            ],
        },
        foods_cafe_rooftop: {
            text: "Rooftop/hoàng hôn: nên đi tầm 16:30–18:00.",
            choices: [
                { label: "📍 Tìm rooftop gần tôi", link: "https://maps.google.com/?q=cafe+rooftop+Da+Lat", next: null },
                { label: "⬅ Quay lại Cafe", next: "foods_cafe" },
            ],
        },
        foods_cafe_farm: {
            text: "Nông trại/đồi cà phê: trải nghiệm vườn, chụp ảnh, thử rang xay.",
            choices: [
                { label: "📍 Tìm coffee farm", link: "https://maps.google.com/?q=coffee+farm+Da+Lat", next: null },
                { label: "⬅ Quay lại Cafe", next: "foods_cafe" },
            ],
        },
        /* ===== LƯU TRÚ ===== */
        hotels: {
            text: "Bạn muốn kiểu lưu trú nào?",
            choices: [
                { label: "🏨 Gần chợ/đi bộ", next: "hotel_market" },
                { label: "🏡 Homestay view rừng", next: "hotel_home" },
                { label: "🌟 Resort nghỉ dưỡng", next: "hotel_resort" },
                { label: "💸 < 400k/đêm", next: "hotel_budget" },
                { label: "👨‍👩‍👧 Gia đình có trẻ", next: "hotel_family" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        hotel_market: {
            text: "Gần chợ: TTC, Ngọc Phát, Dalat Plaza (500k–1tr/đêm). Xung quanh có chợ Đà Lạt, quán cafe đẹp, thuê xe máy tiện lợi, và các điểm tham quan như Nhà thờ Con Gà, Hồ Xuân Hương.",
            choices: [
                { label: "📍 Tìm khách sạn gần chợ", link: "https://maps.google.com/?q=khach+san+gan+cho+Da+Lat", next: null },
                { label: "☕ Quán cafe gần chợ", next: "coffee" },
                { label: "🍽️ Nhà hàng quanh đây", next: "food" },
                { label: "🏍️ Thuê xe máy", next: "transport" },
                { label: "📸 Điểm check-in gần", next: "attractions" },
                { label: "⬅ Quay lại Lưu trú", next: "hotels" },
            ],
        },
        hotel_home: {
            text: "Homestay view rừng: The Wilder Nest, Là Nhà, LengKeng (300k–700k/đêm). Gần thiên nhiên, có quán cafe yên tĩnh, dễ thuê xe khám phá đường rừng, thác Datanla và các điểm trekking.",
            choices: [
                { label: "📍 Tìm homestay view đẹp", link: "https://maps.google.com/?q=homestay+view+%C4%91%E1%BA%B9p+Da+Lat", next: null },
                { label: "☕ Cafe view rừng", next: "coffee" },
                { label: "🌲 Điểm trekking gần", next: "attractions" },
                { label: "🏍️ Thuê xe máy", next: "transport" },
                { label: "⬅ Quay lại Lưu trú", next: "hotels" },
            ],
        },
        hotel_resort: {
            text: "Resort: Ana Mandara, Terracotta, Edensee (từ ~1tr5/đêm). Resort thường có nhà hàng cao cấp, spa, gần sân golf, và các điểm du lịch nổi tiếng.",
            choices: [
                { label: "📍 Tìm resort", link: "https://maps.google.com/?q=resort+Da+Lat", next: null },
                { label: "🍽️ Nhà hàng cao cấp", next: "food" },
                { label: "⛳ Sân golf gần đây", link: "https://maps.google.com/?q=san+golf+Da+Lat", next: null },
                { label: "📸 Điểm tham quan", next: "attractions" },
                { label: "⬅ Quay lại Lưu trú", next: "hotels" },
            ],
        },
        hotel_budget: {
            text: "Ngân sách < 400k: dorm/mini hotel xa trung tâm hơn, nên đặt sớm.",
            choices: [
                { label: "📍 Tìm phòng giá rẻ", link: "https://maps.google.com/?q=khach+san+gia+re+Da+Lat", next: null },
                { label: "⬅ Quay lại Lưu trú", next: "hotels" },
            ],
        },
        hotel_family: {
            text: "Gia đình có trẻ: chọn phòng rộng, thang máy, gần trung tâm; resort có khu vui chơi.",
            choices: [
                { label: "📍 Tìm family hotel", link: "https://maps.google.com/?q=family+hotel+Da+Lat", next: null },
                { label: "⬅ Quay lại Lưu trú", next: "hotels" },
            ],
        },
        /* ===== LỊCH TRÌNH ===== */
        itins: {
            text: "Bạn cần lịch trình mấy ngày?",
            choices: [
                { label: "🗓️ 2N1Đ", next: "itin_2n1d" },
                { label: "🗓️ 3N2Đ", next: "itin_3n2d" },
                { label: "👨‍👩‍👧 Gia đình", next: "itin_family" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        itin_2n1d: {
            text: "2N1Đ:\n• Ngày 1: Hồ Xuân Hương → Vườn hoa TP → cafe view\n• Tối: Chợ đêm\n• Ngày 2: Langbiang/Hồ Tuyền Lâm → Lẩu gà lá é → mua đặc sản",
            choices: [
                { label: "📍 Vườn hoa TP", link: "https://maps.google.com/?q=V%C6%B0%E1%BB%9Dn+hoa+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "☕ Cafe view", next: "foods_cafe_view" },
                { label: "🍲 Lẩu gà lá é", next: "foods_lau_la_e" },
                { label: "⬅ Quay lại Lịch trình", next: "itins" },
            ],
        },
        itin_3n2d: {
            text: "3N2Đ:\n• Ngày 1: Lâm Viên → Ga Đà Lạt → cafe\n• Ngày 2: Cầu Đất bình minh → vườn dâu → Tuyền Lâm/kayak\n• Ngày 3: Linh Phước → mua đặc sản",
            choices: [
                { label: "📍 Ga Đà Lạt", link: "https://maps.google.com/?q=Ga+Da+Lat", next: null },
                { label: "📍 Cầu Đất", link: "https://maps.google.com/?q=Cau+Dat+Tea+Hill", next: null },
                { label: "📍 Vườn dâu", link: "https://maps.google.com/?q=Vuon+dau+Da+Lat", next: null },
                { label: "⬅ Quay lại Lịch trình", next: "itins" },
            ],
        },
        itin_family: {
            text: "Gia đình có trẻ:\n• Vườn hoa TP → Ga Đà Lạt → cafe rộng rãi → Tuyền Lâm dạo thuyền → chợ đêm sớm.",
            choices: [
                { label: "📍 Vườn hoa TP", link: "https://maps.google.com/?q=V%C6%B0%E1%BB%9Dn+hoa+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "📍 Ga Đà Lạt", link: "https://maps.google.com/?q=Ga+Da+Lat", next: null },
                { label: "⬅ Quay lại Lịch trình", next: "itins" },
            ],
        },
        /* ===== PHƯƠNG TIỆN ===== */
        transport: {
            text: "Bạn muốn tìm gì về di chuyển?",
            choices: [
                { label: "🚌 SG → Đà Lạt", next: "transport_sg_dl" },
                { label: "✈️ Từ sân bay", next: "transport_airport" },
                { label: "🛵 Thuê xe máy", next: "transport_bike" },
                { label: "🚕 Taxi/xe công nghệ", next: "transport_taxi" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        transport_sg_dl: {
            text: "SG → Đà Lạt:\n• Xe giường nằm cả ngày/đêm\n• Tự lái QL20 (6–8h)\n• Máy bay → Liên Khương → vào trung tâm",
            choices: [
                { label: "📍 Bến xe Đà Lạt", link: "https://maps.google.com/?q=Ben+xe+Da+Lat", next: null },
                { label: "⬅ Quay lại Phương tiện", next: "transport" },
            ],
        },
        transport_airport: {
            text: "Sân bay Liên Khương → trung tâm:\n• Shuttle bus/taxi (30–45km)\n• Hỏi giá trước khi đi.",
            choices: [
                { label: "📍 Liên Khương", link: "https://maps.google.com/?q=Lien+Khuong+Airport", next: null },
                { label: "⬅ Quay lại Phương tiện", next: "transport" },
            ],
        },
        transport_bike: {
            text: "Thuê xe máy: ~120k–180k/ngày; kiểm tra phanh/đèn, mũ đạt chuẩn.",
            choices: [
                { label: "📍 Tìm nơi thuê", link: "https://maps.google.com/?q=thue+xe+may+Da+Lat", next: null },
                { label: "⬅ Quay lại Phương tiện", next: "transport" },
            ],
        },
        transport_taxi: {
            text: "Taxi/xe công nghệ: đặt sớm giờ cao điểm; xem giá ước tính trên app.",
            choices: [
                { label: "📍 Tìm taxi", link: "https://maps.google.com/?q=taxi+Da+Lat", next: null },
                { label: "⬅ Quay lại Phương tiện", next: "transport" },
            ],
        },
        /* ===== MUA SẮM ===== */
        shopping: {
            text: "Mua sắm & đặc sản:\n• Chợ Đà Lạt/Chợ đêm\n• L’angfarm\n• Vườn dâu (mùa)\n• Atiso/mứt/trà",
            choices: [
                { label: "📍 Chợ Đà Lạt", link: "https://maps.google.com/?q=Cho+Da+Lat", next: null },
                { label: "📍 L’angfarm", link: "https://maps.google.com/?q=L%27angfarm+Da+Lat", next: null },
                { label: "📍 Vườn dâu", link: "https://maps.google.com/?q=Vuon+dau+Da+Lat", next: null },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        /* ===== THỜI TIẾT ===== */
        weather: {
            text: "Thời tiết & thời điểm:\n• 11–2: se lạnh, khô ráo (cao điểm)\n• 6–9: dễ mưa, mang áo mưa/áo khoác\n• Sáng sớm/chiều: lạnh, nhớ áo ấm",
            choices: [
                { label: "🌧️ Ngày mưa làm gì?", next: "weather_rain" },
                { label: "📸 Bình minh/hoàng hôn", next: "weather_golden" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        weather_rain: {
            text: "Ngày mưa: cafe đẹp/indoor, bảo tàng, spa; tránh đường đèo trơn.",
            choices: [
                { label: "☕ Gợi ý Cafe view", next: "foods_cafe_view" },
                { label: "⬅ Quay lại Thời tiết", next: "weather" },
            ],
        },
        weather_golden: {
            text: "Bình minh: Cầu Đất; hoàng hôn: rooftop/cafe view đồi.",
            choices: [
                { label: "📍 Cầu Đất", link: "https://maps.google.com/?q=Cau+Dat+Tea+Hill", next: null },
                { label: "🌅 Tìm rooftop", link: "https://maps.google.com/?q=cafe+rooftop+Da+Lat", next: null },
                { label: "⬅ Quay lại Thời tiết", next: "weather" },
            ],
        },
        /* ===== VÉ & TIPS ===== */
        tickets_tips: {
            text: "Vé & tips:\n• Vé điểm tham quan ~50k–200k\n• Mạo hiểm giá cao hơn\n• Đi sớm tránh đông; giày tốt, áo ấm",
            choices: [
                { label: "🎢 Mạo hiểm", next: "tickets_adventure" },
                { label: "🧒 Đi cùng trẻ", next: "tickets_kids" },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
        tickets_adventure: {
            text: "Mạo hiểm: máng trượt, zipline, kayak… kiểm tra an toàn/độ tuổi.",
            choices: [
                { label: "📍 Máng trượt Datanla", link: "https://maps.google.com/?q=Datanla+Alpine+Coaster", next: null },
                { label: "📍 Kayak Tuyền Lâm", link: "https://maps.google.com/?q=Kayak+Tuyen+Lam+Lake", next: null },
                { label: "⬅ Quay lại Vé & Tips", next: "tickets_tips" },
            ],
        },
        tickets_kids: {
            text: "Đi với trẻ em: chọn điểm ít bậc thang, có khu vui chơi; mang áo ấm/nước uống.",
            choices: [
                { label: "📍 Vườn hoa TP", link: "https://maps.google.com/?q=V%C6%B0%E1%BB%9Dn+hoa+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "⬅ Quay lại Vé & Tips", next: "tickets_tips" },
            ],
        },
        /* ===== SỰ KIỆN ===== */
        events: {
            text: "Sự kiện & lễ hội: Lễ hội hoa (theo chu kỳ), chợ đêm cuối tuần, show âm nhạc/triển lãm.",
            choices: [
                { label: "🔗 Tìm lịch sự kiện", link: "https://www.google.com/search?q=s%E1%BB%B1+ki%E1%BB%87n+%C4%90%C3%A0+L%E1%BA%A1t", next: null },
                { label: "⬅ Quay lại", next: "intro" },
            ],
        },
    },
};
