import { Place, Geo } from '../types.js';
import { normalizeText } from '../utils/text.js';
// [NÂNG CẤP] Import dữ liệu từ file JSON
import allPlacesData from './dalat.json' with { type: 'json' };

// Trung tâm (Chợ Đà Lạt)
export const CENTER: Geo = { lat: 11.9404, lng: 108.4583 };

// [NÂNG CẤP] Gán dữ liệu đã import vào biến allPlaces
// Chúng ta ép kiểu (as Place[]) để TypeScript tin tưởng dữ liệu từ JSON
export const allPlaces: Place[] = allPlacesData as Place[];

/**
 * Tiện ích: Tìm một địa điểm theo slug hoặc tên
 * [SỬA LỖI] - Dùng .includes() để linh hoạt hơn
 */
export function findPlace(slugOrName: string): Place | undefined {
  if (!slugOrName) return undefined;
  const normQuery = normalizeText(slugOrName); // Ví dụ: "quan nuong ngoi cu duc"

  // Ưu tiên 1: Tìm slug chính xác
  const slugMatch = allPlaces.find(p => p.slug === normQuery);
  if (slugMatch) return slugMatch;

  // Ưu tiên 2: Tìm tên chính xác (tuyệt đối)
  const exactNameMatch = allPlaces.find(p => normalizeText(p.name) === normQuery);
  if (exactNameMatch) return exactNameMatch;

  // Ưu tiên 3: Tìm xem tên địa điểm (CSDL) CÓ NẰM TRONG câu hỏi
  // (Ví dụ: "nuong ngoi cu duc" CÓ NẰM TRONG "quan nuong ngoi cu duc")
  return allPlaces.find(p => {
    const normPlaceName = normalizeText(p.name); // Ví dụ: "nuong ngoi cu duc"
    return normQuery.includes(normPlaceName);
  });
}