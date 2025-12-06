import * as Rules from '../logic/rules.js';
import * as aiService from './aiService.js';
// [NÂNG CẤP] Import Google Maps Service
import * as googleMapsService from './googleMapsService.js';
import { findPlace } from '../data/dalat.js';
import { FLOW } from '../data/flow.js';
// Lưu trữ session trong bộ nhớ
const sessionStore = new Map();
// Nút bấm "Menu chính" để dùng lại
const backToMenuChoice = {
    label: '⬅️ Menu chính',
    payload: { action: 'go_node', value: 'intro' }
};
/**
 * Hàm xử lý chính (PHẢI LÀ ASYNC)
 */
export async function handleMessage(q, payload, sid, loc) {
    let ctx = sessionStore.get(sid) || {};
    let origin = loc; // Vị trí người dùng
    // [NÂNG CẤP] Lấy giờ hiện tại (0-23) để gợi ý chủ động
    const currentHour = new Date().getHours();
    // --- LUỒNG 1: ƯU TIÊN XỬ LÝ NÚT BẤM (PAYLOAD) ---
    if (payload && payload.action === 'go_node') {
        const nodeName = payload.value;
        const node = FLOW.nodes[nodeName];
        if (node) {
            const responseChoices = node.choices.map(choice => ({
                label: choice.label,
                payload: {
                    action: choice.link ? 'open_link' : 'go_node',
                    value: choice.link || choice.next || 'intro'
                }
            }));
            // Reset ngữ cảnh khi bấm menu
            if (ctx.itinerarySlots)
                ctx.itinerarySlots = undefined;
            ctx.lastIntent = undefined;
            sessionStore.set(sid, ctx);
            return {
                response: node.text,
                choices: responseChoices
            };
        }
    }
    // --- LUỒNG 2: XỬ LÝ GÕ CHỮ TỰ DO (HYBRID AI) ---
    if (q) {
        let responseText = "";
        // 1. [AI LẦN 1] - GỌI NLU với context
        const lastBotQuestion = ctx.lastBotQuestion || '';
        const nluResult = await aiService.parseIntent(q, lastBotQuestion);
        // [LOGIC ÉP NGỮ CẢNH]
        if (ctx.lastIntent === 'itinerary' && ctx.itinerarySlots) {
            // Nếu đang trong quá trình slot-filling (ctx.itinerarySlots tồn tại)
            // Kiểm tra xem có slot nào được phát hiện không
            const hasItinerarySlots = nluResult.slots.days || nluResult.slots.groupSize || nluResult.slots.budget || nluResult.slots.theme || nluResult.slots.pace || nluResult.slots.traveler_type;
            // Các intent thực sự breaking (user muốn thoát khỏi flow lịch trình)
            const isStrongBreakingIntent = [
                'specific_place', 'general_knowledge'
            ].includes(nluResult.intent);
            // Nếu có slot itinerary HOẶC không phải strong breaking intent → Tiếp tục itinerary
            if (hasItinerarySlots || !isStrongBreakingIntent) {
                nluResult.intent = 'itinerary';
            }
        }
        // 2. Xử lý ngữ cảnh "gần đó"
        if (nluResult.intent === 'context_followup' && ctx.lastIntent && ctx.lastPickedPlace) {
            nluResult.intent = ctx.lastIntent;
            origin = ctx.lastPickedPlace.geo;
        }
        // 3. Định tuyến Intent
        switch (nluResult.intent) {
            // [LOGIC TÌM KIẾM CHUNG]
            case 'nuong':
            case 'cafe':
            case 'sight':
            case 'food':
            case 'stay':
            case 'transport':
                // Bước 1: Lấy dữ liệu thô
                const rawPlaces = Rules.recommend(nluResult.intent, nluResult.slots, origin);
                if (rawPlaces.length > 0) {
                    // [NÂNG CẤP] Làm giàu dữ liệu từ Google Maps (Rating, OpenNow)
                    // Chạy song song để nhanh hơn
                    const places = await Promise.all(rawPlaces.map(async (p) => {
                        const details = await googleMapsService.getPlaceDetails(p.name, p.address);
                        return { ...p, ...details };
                    }));
                    // Bước 2: AI viết câu trả lời
                    responseText = await aiService.generateAnswer(q, places, nluResult.intent);
                    ctx.lastIntent = nluResult.intent;
                    const firstPlace = places[0];
                    if (places.length === 1)
                        ctx.lastPickedPlace = firstPlace;
                    // [NÂNG CẤP] Gợi ý Chủ động
                    // Nếu tìm điểm tham quan vào buổi tối -> Gợi ý ăn uống
                    if (nluResult.intent === 'sight' && (currentHour >= 17 || currentHour < 6)) {
                        responseText += `\n\n💡 *Gợi ý nhỏ:* Bây giờ trời đã tối (thường các điểm tham quan đóng cửa lúc 17:00). Bạn có muốn mình gợi ý các **quán nướng** hoặc **lẩu** gần đó để ăn tối không?`;
                        ctx.lastIntent = 'nuong';
                        if (places.length > 0)
                            ctx.lastPickedPlace = places[0];
                    }
                    // [FIX] Trích xuất tên địa điểm từ response text của AI
                    const mentionedPlaces = places.filter(place => {
                        // Kiểm tra xem tên địa điểm có xuất hiện trong response không
                        return responseText.includes(place.name);
                    });
                    // [NÂNG CẤP] Tạo nút Đặt chỗ / Bản đồ CHỈ cho các địa điểm ĐƯỢC NHẮC ĐẾN
                    const searchButtons = (mentionedPlaces.length > 0 ? mentionedPlaces : places).slice(0, 4).map(place => {
                        const isStay = place.tags.includes('stay') || place.tags.includes('hotel') || place.tags.includes('homestay');
                        const isFood = place.tags.includes('food') || place.tags.includes('nuong') || place.tags.includes('lau') || place.tags.includes('cafe');
                        if (isStay)
                            return { label: `🏨 Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'room' } };
                        else if (isFood)
                            return { label: `🍽️ Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'table' } };
                        else
                            return { label: `📍 Map: ${place.name}`, payload: { action: 'open_link', value: place.gmapsLink || '#' } };
                    });
                    const dynamicChoices = [...searchButtons, backToMenuChoice];
                    sessionStore.set(sid, ctx);
                    return {
                        response: responseText,
                        choices: dynamicChoices
                    };
                }
                else {
                    // Không có dữ liệu -> Fallback AI
                    responseText = await aiService.getGeneralAnswer(q);
                }
                if (ctx.itinerarySlots)
                    ctx.itinerarySlots = undefined;
                break;
            case 'specific_place':
                const placeName = nluResult.slots.name || nluResult.slots.near_place || q;
                const placeRaw = findPlace(placeName);
                if (placeRaw) {
                    // [NÂNG CẤP] Làm giàu dữ liệu cho 1 địa điểm
                    const details = await googleMapsService.getPlaceDetails(placeRaw.name, placeRaw.address);
                    const place = { ...placeRaw, ...details };
                    responseText = await aiService.generateAnswer(q, [place], nluResult.intent);
                    ctx.lastPickedPlace = place;
                    // [NÂNG CẤP] Gợi ý chủ động
                    const isClosed = place.isOpen === false;
                    if ((place.tags.includes('sight') && (currentHour >= 17 || currentHour < 6)) || isClosed) {
                        responseText += `\n\n⚠️ *Lưu ý:* ${place.name} có thể đang đóng cửa. Bạn có muốn mình tìm **quán ăn ngon** gần đó thay thế không?`;
                        ctx.lastIntent = 'food';
                    }
                    // [NÂNG CẤP] Tạo nút cho 1 địa điểm
                    const isStay = place.tags.includes('stay') || place.tags.includes('hotel');
                    const isFood = place.tags.includes('food') || place.tags.includes('nuong');
                    let specificChoices = [
                        { label: '📍 Xem bản đồ', payload: { action: 'open_link', value: place.gmapsLink || '#' } }
                    ];
                    if (isStay) {
                        specificChoices.unshift({ label: '🏨 Đặt phòng ngay', payload: { action: 'open_booking', value: place.name, type: 'room' } });
                    }
                    else if (isFood) {
                        specificChoices.unshift({ label: '🍽️ Đặt bàn ngay', payload: { action: 'open_booking', value: place.name, type: 'table' } });
                    }
                    specificChoices.push(backToMenuChoice);
                    sessionStore.set(sid, ctx);
                    return {
                        response: responseText,
                        choices: specificChoices
                    };
                }
                else {
                    responseText = await aiService.getGeneralAnswer(q);
                }
                if (ctx.itinerarySlots)
                    ctx.itinerarySlots = undefined;
                break;
            case 'booking':
                // Chuyển hướng đến flow booking để hiển thị các lựa chọn đặt bàn
                const bookingNode = FLOW.nodes.booking;
                if (bookingNode) {
                    const bookingChoices = bookingNode.choices.map(choice => {
                        // Kiểm tra xem choice có payload không (cho đặt bàn)
                        if (choice.payload) {
                            return {
                                label: choice.label,
                                payload: choice.payload
                            };
                        }
                        // Nếu không có payload thì dùng logic cũ
                        return {
                            label: choice.label,
                            payload: {
                                action: choice.link ? 'open_link' : 'go_node',
                                value: choice.link || choice.next || 'intro'
                            }
                        };
                    });
                    sessionStore.set(sid, ctx);
                    return {
                        response: bookingNode.text,
                        choices: bookingChoices
                    };
                }
                else {
                    responseText = "Xin lỗi, chức năng đặt bàn hiện tại chưa khả dụng.";
                }
                if (ctx.itinerarySlots)
                    ctx.itinerarySlots = undefined;
                break;
            case 'general_knowledge':
                responseText = await aiService.getGeneralAnswer(q);
                if (ctx.itinerarySlots)
                    ctx.itinerarySlots = undefined;
                break;
            // [LOGIC LỊCH TRÌNH]
            case 'itinerary':
                if (!ctx.itinerarySlots) {
                    ctx.itinerarySlots = {};
                }
                // [DEBUG] Log NLU result
                console.log('🔍 NLU Result:', JSON.stringify(nluResult));
                console.log('📦 Current slots BEFORE merge:', JSON.stringify(ctx.itinerarySlots));
                ctx.itinerarySlots = { ...ctx.itinerarySlots, ...nluResult.slots };
                console.log('📦 Current slots AFTER merge:', JSON.stringify(ctx.itinerarySlots));
                const requiredSlots = [
                    'days', 'groupSize', 'traveler_type', 'budget', 'theme', 'pace'
                ];
                if (ctx.itinerarySlots.groupSize === 1) {
                    ctx.itinerarySlots.traveler_type = "một mình";
                }
                const missingSlots = requiredSlots.filter(slot => !ctx.itinerarySlots[slot]);
                console.log('❓ Missing slots:', missingSlots);
                if (missingSlots.length > 0) {
                    // CHƯA ĐỦ -> HỎI TIẾP
                    const nextSlotToAsk = missingSlots[0];
                    console.log('➡️ Next slot to ask:', nextSlotToAsk);
                    responseText = await aiService.askForNextSlot(ctx.itinerarySlots, nextSlotToAsk);
                    // LƯU CÂU HỎI BOT VỪA HỎI để làm context cho NLU lần sau
                    ctx.lastBotQuestion = responseText;
                    ctx.lastIntent = 'itinerary';
                }
                else {
                    // ĐỦ THÔNG TIN -> TẠO LỊCH TRÌNH
                    responseText = "Tuyệt vời! Tôi đã có đủ thông tin. Đợi tôi một chút để lên lịch trình cho bạn nhé...\n\n";
                    const places = Rules.itineraryFlexible(ctx.itinerarySlots);
                    const itineraryQuery = `
            Tạo lịch trình ${ctx.itinerarySlots.days} ngày 
            cho ${ctx.itinerarySlots.groupSize} người 
            (đối tượng: ${ctx.itinerarySlots.traveler_type}), 
            kinh phí ${ctx.itinerarySlots.budget}, 
            chủ đề ${ctx.itinerarySlots.theme},
            nhịp độ ${ctx.itinerarySlots.pace}.
          `;
                    const itineraryText = await aiService.generateAnswer(itineraryQuery, places, 'itinerary');
                    responseText += itineraryText;
                    // LƯU LỊCH TRÌNH ĐÃ TẠO VÀO SESSION
                    ctx.savedItinerary = itineraryText;
                    ctx.savedItinerarySlots = { ...ctx.itinerarySlots };
                    // [FIX] Trích xuất tên địa điểm từ lịch trình AI tạo ra
                    const mentionedPlaces = places.filter(place => itineraryText.includes(place.name));
                    // [NÂNG CẤP] Tạo nút bấm CHỈ cho các địa điểm ĐƯỢC NHẮC ĐẾN trong lịch trình
                    const itineraryButtons = (mentionedPlaces.length > 0 ? mentionedPlaces : places).slice(0, 6).map(place => {
                        const isStay = place.tags.includes('stay') || place.tags.includes('hotel') || place.tags.includes('homestay');
                        const isFood = place.tags.includes('food') || place.tags.includes('nuong') || place.tags.includes('lau') || place.tags.includes('cafe');
                        if (isStay)
                            return { label: `🏨 Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'room' } };
                        else if (isFood)
                            return { label: `🍽️ Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'table' } };
                        else
                            return { label: `📍 Map: ${place.name}`, payload: { action: 'open_link', value: place.gmapsLink || '#' } };
                    });
                    const finalChoices = [...itineraryButtons, backToMenuChoice];
                    // Reset itinerarySlots nhưng GIỮ LẠI savedItinerary
                    ctx.itinerarySlots = undefined;
                    ctx.lastIntent = undefined;
                    sessionStore.set(sid, ctx);
                    return {
                        response: responseText,
                        choices: [
                            ...finalChoices,
                            { label: '📥 Xuất file TXT', payload: { action: 'export_itinerary', value: 'txt' } }
                        ]
                    };
                }
                break;
            // [LOGIC NHẮC LẠI LỊCH TRÌNH]
            case 'recall_itinerary':
                if (ctx.savedItinerary && ctx.savedItinerarySlots) {
                    responseText = `Đây là lịch trình ${ctx.savedItinerarySlots.days} ngày mà tôi đã tạo cho ${ctx.savedItinerarySlots.groupSize} người (${ctx.savedItinerarySlots.traveler_type}), kinh phí ${ctx.savedItinerarySlots.budget}, chủ đề ${ctx.savedItinerarySlots.theme}, nhịp độ ${ctx.savedItinerarySlots.pace}:\n\n${ctx.savedItinerary}`;
                    sessionStore.set(sid, ctx);
                    return {
                        response: responseText,
                        choices: [
                            { label: '📥 Xuất file TXT', payload: { action: 'export_itinerary', value: 'txt' } },
                            backToMenuChoice
                        ]
                    };
                }
                else {
                    responseText = "Bạn chưa tạo lịch trình nào với tôi. Hãy bắt đầu bằng cách nói \"Tạo lịch trình\" nhé!";
                }
                break;
            default: // 'unknown'
                if (ctx.lastIntent === 'itinerary' && ctx.itinerarySlots) {
                    const requiredSlotsDefault = [
                        'days', 'groupSize', 'traveler_type', 'budget', 'theme', 'pace'
                    ];
                    if (ctx.itinerarySlots.groupSize === 1)
                        ctx.itinerarySlots.traveler_type = "một mình";
                    const missingSlots = requiredSlotsDefault.filter(slot => !ctx.itinerarySlots[slot]);
                    const nextSlotToAsk = missingSlots[0] || 'days';
                    responseText = await aiService.askForNextSlot(ctx.itinerarySlots, nextSlotToAsk);
                }
                else {
                    responseText = "Xin lỗi, tôi chưa hiểu ý bạn lắm. Bạn có thể chọn từ Menu chính hoặc hỏi tôi về một địa điểm cụ thể.";
                    if (ctx.itinerarySlots)
                        ctx.itinerarySlots = undefined;
                }
        }
        // 4. Lưu session và trả về
        sessionStore.set(sid, ctx);
        return {
            response: responseText,
            choices: ctx.lastIntent === 'itinerary' ? [] : [backToMenuChoice]
        };
    }
    // Fallback
    return handleMessage(null, { action: 'go_node', value: 'intro' }, sid, loc);
}
