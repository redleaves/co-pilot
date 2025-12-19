/**
 * 会话管理类型定义
 */

import { nanoid } from 'nanoid';

/**
 * 对话消息
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * 会话数据
 */
export interface Session {
  id: string;
  createdAt: number;
  updatedAt: number;
  preview: string;
  messages: Message[];
}

/**
 * 会话索引项（用于 JSONL 索引）
 * op: C=Create, U=Update, D=Delete
 */
export interface SessionIndexEntry {
  op: 'C' | 'U' | 'D';
  id: string;
  ts: number;
  pv?: string;  // preview (前30字符)
}

/**
 * 会话列表项（用于侧边栏显示）
 */
export interface SessionListItem {
  id: string;
  preview: string;
  updatedAt: number;
}

/**
 * 生成 Session ID
 * 格式：{timestamp}_{nanoid(6)}
 * 示例：1734412800000_a1b2c3
 */
export function generateSessionId(): string {
  return `${Date.now()}_${nanoid(6)}`;
}

/**
 * 生成 Message ID
 */
export function generateMessageId(): string {
  return nanoid(8);
}

/**
 * 创建新会话（内存中的临时会话）
 */
export function createTempSession(): Session {
  const now = Date.now();
  return {
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
    preview: '',
    messages: [],
  };
}

/**
 * 创建消息
 */
export function createMessage(role: 'user' | 'assistant', content: string): Message {
  return {
    id: generateMessageId(),
    role,
    content,
    timestamp: Date.now(),
  };
}

