// --- 1. CẤU TRÚC DỮ LIỆU XÁC THỰC ---
export type Geo = { lat: number; lng: number };

export interface Place {
  slug: string;
  name: string;
  address: string;
  hours: string;
  verified: true;
  tags: string[];
  summary: string;     // Tóm tắt miễn phí
  geo?: Geo;
  imageUrl?: string;   // Nâng cấp: Hình ảnh
  gmapsLink?: string;  // Nâng cấp: Link Google Maps
  phone?: string;     // Nâng cấp: Số điện thoại
  rating?: number;             // Số sao (4.5)
  user_ratings_total?: number; // Số lượt đánh giá (1000)
  isOpen?: boolean;            // Trạng thái mở cửa (true/false)  
}

// --- 2. CẤU TRÚC KỊCH BẢN NÚT BẤM (FLOW) ---
export interface FlowChoice {
  label: string;
  next?: string | null; // Chuyển sang node khác
  link?: string; // Mở link (Google Maps)
}

export interface FlowNode {
  text: string;
  choices: FlowChoice[];
}

// --- 3. CẤU TRÚC AI (NLU) ---
export type Intent = 'nuong' | 'cafe' | 'sight' | 'itinerary' | 'specific_place' | 'general_knowledge' | 'context_followup' | 'unknown' | 'stay' | 'transport' | 'food' | 'recall_itinerary';

export interface Slots {
  [key: string]: any; // Linh hoạt
  near_place?: string;
  area?: string;
  theme?: string;
  days?: number;
  nights?: number;
  groupSize?: number;
  budget?: string;
  traveler_type?: string; 
  pace?: string;
  dish?: string; // <-- THÊM DÒNG NÀY (cho "phở", "bún"...)
}

export interface NLUResult {
  intent: Intent;
  slots: Slots;
}

// --- 4. CẤU TRÚC LỊCH TRÌNH (ITINERARY) ---
export interface ItinerarySlots {
  days?: number;
  nights?: number;
  groupSize?: number;
  budget?: string;
  theme?: string;
  traveler_type?: string; // <-- (NÂNG CẤP) Thêm slot kiểu người đi
  pace?: string;          // <-- (NÂNG CẤP) Thêm slot nhịp độ
}

// --- 5. CẤU TRÚC API (GIAO TIẾP CLIENT-SERVER) ---
export interface ClientPayload {
  action: 'go_node' | 'open_link' | 'open_booking' | 'export_itinerary';
  value: string; // Tên node (ví dụ 'sights') hoặc URL
  type?: string; // Loại (room/table/txt)
}export interface BotResponse {
  response: string;
  choices: Array<{
    label: string;
    payload: ClientPayload;
  }>;
}

// --- 6. CẤU TRÚC BỘ NHỚ (SESSION) ---
export interface SessionContext {
  lastIntent?: Intent;
  lastPickedPlace?: Place;
  lastBotQuestion?: string; // Câu hỏi cuối cùng bot hỏi (để context-aware NLU)
  itinerarySlots?: ItinerarySlots; // Bộ nhớ cho lịch trình đang tạo
  savedItinerary?: string; // Lịch trình đã tạo hoàn chỉnh
  savedItinerarySlots?: ItinerarySlots; // Thông tin lịch trình đã tạo
}