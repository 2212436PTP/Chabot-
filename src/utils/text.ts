// src/utils/text.ts
// Thay đổi import: dùng 'diacritics'
import { remove as stripDiacritics } from 'diacritics';

/**
 * Chuẩn hóa text: bỏ dấu, viết thường, trim
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  // Hàm `stripDiacritics` vẫn hoạt động y hệt
  return stripDiacritics(text).toLowerCase().trim();
}