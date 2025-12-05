// src/services/chatHistoryService.ts
import pool from '../db/database.js';

export interface ChatMessage {
  id?: number;
  user_id: number;
  message: string;
  sender: 'user' | 'bot';
  created_at?: Date;
}

// Lưu tin nhắn vào database
export async function saveChatMessage(userId: number, message: string, sender: 'user' | 'bot'): Promise<boolean> {
  try {
    await pool.query(
      `INSERT INTO chat_history (user_id, message, sender)
       VALUES ($1, $2, $3)`,
      [userId, message, sender]
    );
    return true;
  } catch (error) {
    console.error('Lỗi lưu tin nhắn:', error);
    return false;
  }
}

// Lấy lịch sử chat của user (giới hạn số tin nhắn)
export async function getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
  try {
    const result = await pool.query(
      `SELECT id, user_id, message, sender, created_at
       FROM chat_history
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    // Đảo ngược để tin nhắn cũ nhất ở đầu
    return result.rows.reverse();
  } catch (error) {
    console.error('Lỗi lấy lịch sử chat:', error);
    return [];
  }
}

// Xóa toàn bộ lịch sử chat của user
export async function clearChatHistory(userId: number): Promise<boolean> {
  try {
    await pool.query(
      'DELETE FROM chat_history WHERE user_id = $1',
      [userId]
    );
    return true;
  } catch (error) {
    console.error('Lỗi xóa lịch sử:', error);
    return false;
  }
}

// Đếm số tin nhắn của user
export async function countUserMessages(userId: number): Promise<number> {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM chat_history WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Lỗi đếm tin nhắn:', error);
    return 0;
  }
}
