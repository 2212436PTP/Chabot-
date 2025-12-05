import { Geo } from '../types.js';

/**
 * Tính khoảng cách giữa 2 điểm (km)
 */
export function haversineDistance(geo1: Geo, geo2: Geo): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = (geo2.lat - geo1.lat) * Math.PI / 180;
  const dLng = (geo2.lng - geo1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(geo1.lat * Math.PI / 180) * Math.cos(geo2.lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Khoảng cách (km)
}