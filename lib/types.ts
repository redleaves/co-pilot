/**
 * 全局类型定义
 */

/**
 * 场景识别类型
 */
export type SceneType = 
  | 'product_to_dev'    // 产品→开发
  | 'dev_to_product'    // 开发→产品
  | 'insufficient'      // 信息不足
  | 'unrecognized';     // 无法识别

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
 */
export interface SessionIndexEntry {
  op: 'C' | 'U' | 'D';  // Create, Update, Delete
  id: string;
  ts: number;
  pv?: string;  // preview
}

/**
 * 翻译请求
 */
export interface TranslateRequest {
  sessionId: string;
  message: string;
  history?: Message[];
}

/**
 * SSE 事件类型
 */
export interface SSEEvent {
  type: 'start' | 'chunk' | 'done' | 'error';
  data?: string;
  error?: string;
}

