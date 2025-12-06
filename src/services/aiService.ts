// src/services/aiService.ts
import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from "@google/generative-ai";
import { NLUResult, Place, ItinerarySlots, Intent } from "../types.js";
import 'dotenv/config';
import { normalizeText } from '../utils/text.js';// 1. KHỞI TẠO CLIENT
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  ],
});

// --- 2. CÁC MẪU PROMPT ---

// [NLU PROMPT - GIỮ NGUYÊN]
const nluPromptTemplate = `
  Bạn là một NLU (Bộ phân tích ngôn ngữ).
  Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và CHỈ trả về một đối tượng JSON.
  Không giải thích, không thêm bất cứ chữ gì ngoài JSON.

  Các 'intent' (ý định) hợp lệ là: [nuong, cafe, sight, itinerary, stay, transport, food, booking, general_knowledge, context_followup, specific_place, recall_itinerary, unknown].
  Các 'slots' (thực thể) hợp lệ là: [area, near_place, groupSize, budget, dish, theme, days, nights, traveler_type, pace, stay_type, price_range, vehicle_type].
  
  QUAN TRỌNG: 
  - "vừa phải" có thể là budget HOẶC pace tùy ngữ cảnh.
  - Nếu câu hỏi TRƯỚC ĐÓ của bot hỏi về "kinh phí" hoặc "budget" → "vừa phải" là budget
  - Nếu câu hỏi TRƯỚC ĐÓ của bot hỏi về "nhịp độ" hoặc "pace" → "vừa phải" là pace
  - "thong thả", "thong thả thôi", "chậm rãi" → pace
  - "đi nhiều nơi", "nhanh", "khám phá nhiều" → pace  
  - "tiết kiệm", "rộng rãi", "sang trọng" → budget
  - Nếu không rõ ràng, ưu tiên theo ngữ cảnh câu hỏi.
  
  {CONTEXT_HINT}
  
  Nếu người dùng hỏi về "lịch trình của tôi", "lịch trình trước", "lịch trình vừa tạo", "lịch trình đã lên", "lịch trình đã cho", hoặc các câu tương tự → trả về intent "recall_itinerary".
  Câu hỏi của người dùng: "lịch trình 4 ngày 3 đêm"
  JSON:
  { "intent": "itinerary", "slots": { "days": 4, "nights": 3 } }

  Câu hỏi của người dùng: "6" 
  JSON:
  { "intent": "itinerary", "slots": { "days": 6 } }

  Câu hỏi của người dùng: "3 ngày"
  JSON:
  { "intent": "itinerary", "slots": { "days": 3 } }

  Câu hỏi của người dùng: "cặp đôi"
  JSON:
  { "intent": "itinerary", "slots": { "groupSize": 2, "traveler_type": "cặp đôi" } }

  Câu hỏi của người dùng: "5 người"
  JSON:
  { "intent": "itinerary", "slots": { "groupSize": 5 } }

  Câu hỏi của người dùng: "gia đình"
  JSON:
  { "intent": "itinerary", "slots": { "traveler_type": "gia đình" } }

  Câu hỏi của người dùng: "kinh phí vừa phải"
  JSON:
  { "intent": "itinerary", "slots": { "budget": "vừa phải" } }

  Câu hỏi của người dùng: "tiết kiệm"
  JSON:
  { "intent": "itinerary", "slots": { "budget": "tiết kiệm" } }

  Câu hỏi của người dùng: "rộng rãi"
  JSON:
  { "intent": "itinerary", "slots": { "budget": "rộng rãi" } }  Câu hỏi của người dùng: "cafe sống ảo"
  JSON:
  { "intent": "itinerary", "slots": { "theme": "cafe sống ảo" } }

  Câu hỏi của người dùng: "ẩm thực"
  JSON:
  { "intent": "itinerary", "slots": { "theme": "ẩm thực" } }

  Câu hỏi của người dùng: "thiên nhiên"
  JSON:
  { "intent": "itinerary", "slots": { "theme": "thiên nhiên" } }

  Câu hỏi của người dùng: "tham quan"
  JSON:
  { "intent": "itinerary", "slots": { "theme": "tham quan" } }
  
  Câu hỏi của người dùng: "tham quan di tích"
  JSON:
  { "intent": "itinerary", "slots": { "theme": "tham quan di tích" } }

  Câu hỏi của người dùng: "tụi mình muốn đi thong thả thôi"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "thong thả" } }

  Câu hỏi của người dùng: "thong thả"
  JSON:
  Câu hỏi của người dùng: "tụi mình muốn đi thong thả thôi"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "thong thả" } }

  Câu hỏi của người dùng: "thong thả"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "thong thả" } }
  
  Câu hỏi của người dùng: "nhịp độ vừa phải"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "vừa phải" } }
  
  Câu hỏi của người dùng: "vừa phải thôi"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "vừa phải" } }
  
  Câu hỏi của người dùng: "đi nhiều nơi"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "đi nhiều nơi" } }
  
  Câu hỏi của người dùng: "chậm rãi"
  JSON:
  { "intent": "itinerary", "slots": { "pace": "chậm rãi" } }
  
  Câu hỏi của người dùng: "quán nướng ngon"
  JSON:
  { "intent": "nuong", "slots": {} }
  
  Câu hỏi của người dùng: "chỗ vui chơi cho trẻ em"
  JSON:
  { "intent": "sight", "slots": { "theme": "trẻ em" } }
  
  Câu hỏi của người dùng: "Dinh 3 Bảo Đại"
  JSON:
  { "intent": "specific_place", "slots": { "name": "Dinh III Bảo Đại" } }
  
  Câu hỏi của người dùng: "đặt bàn"
  JSON:
  { "intent": "booking", "slots": {} }
  
  Câu hỏi của người dùng: "muốn đặt bàn nhà hàng"
  JSON:
  { "intent": "booking", "slots": {} }
  
  Câu hỏi của người dùng: "tôi muốn book bàn"
  JSON:
  { "intent": "booking", "slots": {} }
  
  --- KẾT THÚC VÍ DỤ ---  Câu hỏi của người dùng: "{QUERY}"
  JSON:
`;

// [SLOT FILL PROMPT - GIỮ NGUYÊN]
const itinerarySlotFillPrompt = `
  Bạn là "Trợ lý Đà Lạt" xuất sắc, đang giúp người dùng lên kế hoạch.
  Nhiệm vụ của bạn là hỏi MỘT CÂU HỎI TIẾP THEO để thu thập thông tin còn thiếu.
  
  Các thông tin bạn CẦN HỎI (theo thứ tự ưu tiên):
  1. days (số ngày)
  2. groupSize (số lượng người)
  3. traveler_type (bạn đi cùng ai: gia đình, cặp đôi, bạn bè...)
  4. budget (kinh phí: tiết kiệm, vừa phải, rộng rãi)
  5. theme (chủ đề: thiên nhiên, ẩm thực, cafe sống ảo, tham quan)
  6. pace (nhịp độ: thong thả, vừa phải, đi nhiều nơi)
 
  Các thông tin bạn ĐÃ BIẾT (dạng JSON):
  {KNOWN_SLOTS}
 
  Slot TIẾP THEO bạn cần hỏi là: "{NEXT_SLOT}"

  --- QUAN TRỌNG ---
  Nhiệm vụ của bạn CHỈ LÀ HỎI 1 CÂU HỎI DUY NHẤT.
  KHÔNG được tạo lịch trình.
  KHÔNG được đưa ra gợi ý chung chung.
  KHÔNG được hỏi xác nhận thông tin cũ (ví dụ: "Vậy là... phải không?").
  Example: "Tuyệt! Về kinh phí, bạn muốn chuyến đi này ở mức nào (tiết kiệm, vừa phải, hay rộng rãi) ạ?"
  
  Câu hỏi tiếp theo của bạn (CHỈ MỘT CÂU):
`;

// [ITINERARY ANSWER PROMPT - GIỮ NGUYÊN]
const itineraryAnswerPromptTemplate = `
  Bạn là "Trợ lý Đà Lạt" xuất sắc.
  Câu hỏi của người dùng là: "{QUERY}"
  
  Nhiệm vụ: Hãy tạo một lịch trình chi tiết theo ngày (Ngày 1, Sáng/Trưa/Chiều/Tối, Ngày 2, ...)
  Dựa *TUYỆT ĐỐI* vào danh sách địa điểm (JSON) tôi cung cấp.
  Bạn phải SẮP XẾP các địa điểm này một cách hợp lý vào các ngày.
  Bạn có thể thêm các quán ăn từ danh sách vào bữa trưa/tối.
  
  --- QUAN TRỌNG ---
  - Trả lời bằng văn bản thuần (plain text), KHÔNG DÙNG MARKDOWN (**).
  - Phải có cấu trúc "Ngày 1:", "Ngày 2:".
  - Nếu dữ liệu có "gmapsLink", hãy dán link đó vào.

  Dữ liệu (Danh sách địa điểm bạn được phép dùng):
  "{DATA}"

  Lịch trình của bạn (viết bằng tiếng Việt, thân thiện):
`;

// [ANSWER PROMPT - NÂNG CẤP] Thêm logic Rating/OpenNow
const answerPromptTemplate = `
  Bạn là "Trợ lý Đà Lạt", một trợ lý du lịch ảo rất thân thiện và am hiểu.
  Câu hỏi của người dùng là: "{QUERY}"
  
  --- DỮ LIỆU (DATA) ---
  Tôi đã tìm thấy {DATA_COUNT} địa điểm phù hợp trong cơ sở dữ liệu của mình:
  "{DATA}"
  --- KẾT THÚC DỮ LIỆU ---

  Nhiệm vụ:
  1. Dựa *TUYỆT ĐỐI* vào DỮ LIỆU tôi cung cấp bên trên để trả lời.
  2. Nếu {DATA_COUNT} là 0 (không có dữ liệu), HÃY BÁO LÀ BẠN KHÔNG TÌM THẤY.
  3. Nếu {DATA_COUNT} lớn hơn 0, HÃY GIỚI THIỆU 1-3 địa điểm TỪ DỮ LIỆU ĐÓ.
  4. Không được phép bịa ra tên địa điểm.
  5. Trả lời bằng văn bản thuần (plain text), KHÔNG DÙNG MARKDOWN (**).
  6. Nếu dữ liệu có "gmapsLink", hãy dán link đó vào.
  
  --- [YÊU CẦU MỚI: DATA THỜI GIAN THỰC] ---
  7. Nếu dữ liệu có trường "rating" và "user_ratings_total", hãy hiển thị bên cạnh tên quán (ví dụ: Quán A (4.5 sao / 200 đánh giá)).
  8. Nếu dữ liệu có trường "isOpen":
     - Nếu "isOpen" là true, hãy nói: "Quán đang mở cửa".
     - Nếu "isOpen" là false, hãy nói: "Quán đang đóng cửa".
  ------------------------------------------

  Câu trả lời của bạn (viết bằng tiếng Việt, thân thiện):
`;

const generalAnswerPromptTemplate = `
  Bạn là "Trợ lý Đà Lạt". Hãy trả lời câu hỏi sau của người dùng một cách thân thiện, ngắn gọn, và
  sử dụng văn bản thuần (plain text). 
  Không được sử dụng bất kỳ định dạng Markdown nào (như **dấu sao** hoặc # gạch đầu dòng).
  
  Câu hỏi: "{QUERY}"
`;


// --- 3. CÁC HÀM DỊCH VỤ ---

export async function parseIntent(query: string, lastBotQuestion?: string): Promise<NLUResult> {
  // [SỬA LỖI] Chuẩn hóa text TRƯỚC KHI gửi cho AI
  const normQuery = normalizeText(query);
  
  // [CONTEXT-AWARE] Thêm hint dựa trên câu hỏi cuối
  let contextHint = '';
  if (lastBotQuestion) {
    if (lastBotQuestion.includes('kinh phí') || lastBotQuestion.includes('budget') || lastBotQuestion.includes('tiết kiệm') || lastBotQuestion.includes('rộng rãi')) {
      contextHint = 'GỢI Ý NGHE CẢNH: Bot vừa hỏi về KINH PHÍ, nên "vừa phải" nên được parse thành budget.';
    } else if (lastBotQuestion.includes('nhịp độ') || lastBotQuestion.includes('pace') || lastBotQuestion.includes('thong thả') || lastBotQuestion.includes('khám phá')) {
      contextHint = 'GỢI Ý NGỮE CẢNH: Bot vừa hỏi về NHỊP ĐỘ, nên "vừa phải" nên được parse thành pace.';
    }
  }
  
  const prompt = nluPromptTemplate
    .replace("{QUERY}", normQuery)
    .replace("{CONTEXT_HINT}", contextHint);
    try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonText) as NLUResult;
  } catch (e) {
    console.error("Lỗi AI NLU (parseIntent):", e);
    return { intent: 'unknown', slots: {} };
  }
}

// [NÂNG CẤP] Thêm 'intent' để chọn đúng prompt
export async function generateAnswer(query: string, places: Place[], intent: Intent): Promise<string> {
  
  let prompt = "";
  const dataString = JSON.stringify(places);
  const dataCount = places.length; // [NÂNG CẤP] Đếm số lượng

  // [LOGIC MỚI] Chọn prompt dựa trên intent
  if (intent === 'itinerary') {
    prompt = itineraryAnswerPromptTemplate 
      .replace("{QUERY}", query)
      .replace(/{DATA_COUNT}/g, dataCount.toString()) // (Placeholder này không dùng trong itinerary prompt, nhưng an toàn)
      .replace("{DATA}", dataString);
  } else {
    prompt = answerPromptTemplate
      .replace("{QUERY}", query)
      .replace(/{DATA_COUNT}/g, dataCount.toString()) // [NÂNG CẤP]
      .replace("{DATA}", dataString);
  }
  
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Lỗi AI Viết câu (generateAnswer):", e);
    return "Xin lỗi, tôi gặp chút trục trặc khi tạo câu trả lời.";
  }
}

export async function getGeneralAnswer(query: string): Promise<string> {
  const prompt = generalAnswerPromptTemplate.replace("{QUERY}", query);
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Lỗi AI Kiến thức chung (getGeneralAnswer):", e);
    return "Xin lỗi, tôi không thể trả lời câu hỏi này.";
  }
}

// [NÂNG CẤP] Cập nhật danh sách 6 slot
export async function continueItinerary(query: string, knownSlots: ItinerarySlots): Promise<string> {
    const requiredSlots: (keyof ItinerarySlots)[] = [
      'days', 
      'groupSize', 
      'traveler_type', 
      'budget', 
      'theme', 
      'pace'
    ];
    const missingSlots = requiredSlots.filter(slot => !knownSlots[slot]);
    if (missingSlots.length > 0) {
      return askForNextSlot(knownSlots, missingSlots[0]);
    }
    return "Tôi đã có đủ thông tin!";
}

// [HÀM MỚI]
export async function askForNextSlot(knownSlots: ItinerarySlots, nextSlot: string): Promise<string> {
  const prompt = itinerarySlotFillPrompt
    .replace("{KNOWN_SLOTS}", JSON.stringify(knownSlots))
    .replace(/{NEXT_SLOT}/g, nextSlot); 
    
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Lỗi AI Slot-Fill (askForNextSlot):", e);
    return "Xin lỗi, tôi gặp chút trục trặc. Bạn có thể thử lại được không?";
  }
}