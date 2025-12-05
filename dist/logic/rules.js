import { allPlaces, CENTER, findPlace } from '../data/dalat.js';
import { haversineDistance } from '../utils/geo.js';
import { normalizeText } from '../utils/text.js'; // <-- Cần import hàm này
/**
 * Hàm lọc và sắp xếp chính, dựa trên NLU
 */
export function recommend(intent, slots, origin) {
    let results = [...allPlaces];
    // 1. Lọc theo Intent (ánh xạ intent sang tag)
    const tagMap = {
        nuong: 'nuong',
        cafe: 'cafe',
        sight: 'sight',
        food: 'food',
        stay: 'stay',
        transport: 'transport'
    };
    const filterTag = tagMap[intent];
    if (filterTag) {
        // [SỬA LỖI] Với intent 'sight', loại trừ các địa điểm ăn uống
        if (intent === 'sight') {
            results = results.filter(p => p.tags.includes(filterTag) &&
                !p.tags.includes('food') &&
                !p.tags.includes('nuong') &&
                !p.tags.includes('lau') &&
                !p.tags.includes('cafe'));
        }
        else {
            results = results.filter(p => p.tags.includes(filterTag));
        }
    } // 2. Lọc theo món ăn (dish) hoặc chủ đề (theme)
    if (slots.dish) {
        results = results.filter(p => p.tags.includes(slots.dish));
    }
    // [NÂNG CẤP] Lọc 'theme' thông minh hơn
    if (slots.theme) {
        const theme = normalizeText(slots.theme);
        // Lọc cho intent 'cafe'
        if (theme.includes('cafe') || theme.includes('song ao')) {
            results = results.filter(p => p.tags.includes('check-in'));
        }
        else if (theme.includes('view dep') || theme.includes('view doi')) {
            results = results.filter(p => p.tags.includes('view-doi') || p.tags.includes('scenic'));
            // Lọc cho intent 'sight' - THAM QUAN
        }
        else if (theme.includes('thien nhien') || theme.includes('nature')) {
            results = results.filter(p => p.tags.includes('nature') || p.tags.includes('scenic'));
        }
        else if (theme.includes('lich su') || theme.includes('history') || theme.includes('tham quan')) {
            // [SỬA LỖI] Lọc chặt chẽ hơn cho lịch sử/tham quan
            results = results.filter(p => (p.tags.includes('history') || p.tags.includes('landmark') || p.tags.includes('sight')) &&
                !p.tags.includes('food') &&
                !p.tags.includes('nuong') &&
                !p.tags.includes('lau'));
        }
        else if (theme.includes('am thuc') || theme.includes('an uong')) {
            // intent đã là 'food', không cần lọc thêm
        }
        else if (theme.includes('tre em') || theme.includes('kids')) {
            results = results.filter(p => p.tags.includes('kids'));
        }
    } // 3. Lọc theo Slot 'area'
    if (slots.area) {
        results = results.filter(p => {
            if (!p.geo)
                return false;
            const dist = haversineDistance(CENTER, p.geo);
            if (slots.area === 'gần chợ')
                return dist <= 2.5;
            if (slots.area === 'ngoại thành')
                return dist >= 8;
            // [SỬA LỖI] Xóa logic "view đồi" khỏi 'area'
            return true;
        });
    }
    // 4. Xác định điểm gốc để sắp xếp
    let sortOrigin = origin || CENTER; // Mặc định là Chợ
    // Ưu tiên "gần địa điểm X"
    if (slots.near_place) {
        const nearPlace = findPlace(slots.near_place);
        if (nearPlace?.geo) {
            sortOrigin = nearPlace.geo;
        }
    }
    // 5. Sắp xếp theo khoảng cách
    results.sort((a, b) => {
        if (!a.geo)
            return 1;
        if (!b.geo)
            return -1;
        const distA = haversineDistance(sortOrigin, a.geo);
        const distB = haversineDistance(sortOrigin, b.geo);
        return distA - distB;
    });
    return results.slice(0, 4); // Lấy 4 kết quả hàng đầu
}
/**
 * [NÂNG CẤP LỚN]
 * Hàm này tạo ra một "bể" địa điểm (pool)
 * đã được lọc theo tất cả 6 slot để AI sắp xếp
 */
export function itineraryFlexible(slots) {
    console.log("Đang tạo lịch trình với slots:", slots);
    // Bể lọc ban đầu (chỉ các điểm tham quan/cafe)
    let results = allPlaces.filter(p => p.tags.includes('sight') ||
        p.tags.includes('cafe') ||
        p.tags.includes('history') ||
        p.tags.includes('nature') ||
        p.tags.includes('check-in'));
    let foodPlaces = allPlaces.filter(p => p.tags.includes('food') && !p.tags.includes('cafe'));
    // 1. Lọc theo CHỦ ĐỀ (Theme)
    const theme = slots.theme ? normalizeText(slots.theme) : '';
    let themeFilteredResults = [];
    if (theme.includes('cafe') || theme.includes('song ao')) {
        themeFilteredResults.push(...allPlaces.filter(p => p.tags.includes('cafe') && p.tags.includes('check-in')));
    }
    if (theme.includes('thien nhien') || theme.includes('nature')) {
        themeFilteredResults.push(...allPlaces.filter(p => p.tags.includes('sight') && (p.tags.includes('nature') || p.tags.includes('scenic'))));
    }
    if (theme.includes('lich su') || theme.includes('history')) {
        themeFilteredResults.push(...allPlaces.filter(p => p.tags.includes('history')));
    }
    if (theme.includes('am thuc') || theme.includes('an uong')) {
        // Nếu chủ đề là ẩm thực, ta lấy nhiều đồ ăn hơn
        foodPlaces.push(...allPlaces.filter(p => p.tags.includes('food')).slice(0, 10)); // Lấy 10 quán
    }
    if (theme.includes('tham quan')) {
        themeFilteredResults.push(...allPlaces.filter(p => p.tags.includes('sight')));
    }
    if (themeFilteredResults.length > 0) {
        results = themeFilteredResults; // Ghi đè nếu có chủ đề khớp
    }
    // Nếu không có chủ đề nào khớp, 'results' sẽ là bể lọc tham quan chung ban đầu
    // 2. Lọc theo ĐỐI TƯỢNG (traveler_type)
    const travelerType = slots.traveler_type ? normalizeText(slots.traveler_type) : '';
    if (travelerType.includes('tre') || travelerType.includes('nho') || travelerType.includes('gia dinh')) {
        // (Bạn nên thêm tag 'kids' vào 'dalat.json' cho Vườn hoa, ZooDoo, Datanla)
        const kidPlaces = results.filter(p => p.tags.includes('kids'));
        if (kidPlaces.length > 0) {
            results = kidPlaces; // Ưu tiên địa điểm cho trẻ em
        }
    }
    // 3. Lọc theo NHÓM ĐÔNG (groupSize)
    if (slots.groupSize && slots.groupSize >= 6) {
        results = results.filter(p => p.tags.includes('spacious') || p.tags.includes('large-group'));
        foodPlaces = foodPlaces.filter(p => p.tags.includes('spacious') || p.tags.includes('large-group'));
    }
    // 4. Xác định số lượng theo NHỊP ĐỘ (pace)
    const pace = slots.pace ? normalizeText(slots.pace) : 'vua phai';
    const days = slots.days || 3;
    let sightPerDay = 2; // (Vừa phải)
    if (pace.includes('thong tha')) {
        sightPerDay = 1.5; // 1.5 điểm/ngày (linh hoạt hơn)
    }
    else if (pace.includes('nhieu noi')) {
        sightPerDay = 3; // 3 điểm/ngày
    }
    const sightLimit = Math.ceil(sightPerDay * days);
    const foodLimit = Math.ceil(days * 1.5); // Tăng giới hạn food (1-2 quán/ngày)
    // 5. Trả về "bể" địa điểm (loại bỏ trùng lặp)
    const finalResults = [...new Set(results)]; // Loại bỏ trùng lặp nếu user chọn 2 theme
    const finalFood = [...new Set(foodPlaces)];
    return [
        ...finalResults.slice(0, sightLimit),
        ...finalFood.slice(0, foodLimit)
    ];
}
// [ĐÃ XÓA] Hàm recommendTransport() không cần thiết
