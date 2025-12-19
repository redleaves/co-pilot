/**
 * Append-Only JSONL 索引管理
 * 文件：sessions/_index.jsonl
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { SessionIndexEntry, SessionListItem } from './types';

const SESSIONS_DIR = path.join(process.cwd(), 'sessions');
const INDEX_FILE = path.join(SESSIONS_DIR, '_index.jsonl');

/**
 * 确保 sessions 目录存在
 */
async function ensureSessionsDir(): Promise<void> {
  try {
    await fs.access(SESSIONS_DIR);
  } catch {
    await fs.mkdir(SESSIONS_DIR, { recursive: true });
  }
}

/**
 * 追加写入索引日志
 * O(1) 写入操作
 */
export async function appendLog(entry: SessionIndexEntry): Promise<void> {
  await ensureSessionsDir();
  const line = JSON.stringify(entry) + '\n';
  await fs.appendFile(INDEX_FILE, line, 'utf-8');
}

/**
 * 读取所有索引条目
 */
async function readAllEntries(): Promise<SessionIndexEntry[]> {
  try {
    const content = await fs.readFile(INDEX_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line) as SessionIndexEntry);
  } catch {
    return [];
  }
}

/**
 * 获取所有会话列表（合并后的最新状态）
 * 按更新时间倒序排列
 */
export async function getAllSessions(): Promise<SessionListItem[]> {
  const entries = await readAllEntries();
  
  // 使用 Map 合并同一 session 的多条记录
  const sessionMap = new Map<string, SessionListItem>();
  
  for (const entry of entries) {
    if (entry.op === 'D') {
      sessionMap.delete(entry.id);
    } else {
      sessionMap.set(entry.id, {
        id: entry.id,
        preview: entry.pv || '',
        updatedAt: entry.ts,
      });
    }
  }
  
  // 转换为数组并按更新时间倒序
  return Array.from(sessionMap.values())
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * 获取最新的 Session ID
 */
export async function getLatestSessionId(): Promise<string | null> {
  const sessions = await getAllSessions();
  return sessions.length > 0 ? sessions[0].id : null;
}

/**
 * 记录创建会话
 */
export async function logCreateSession(id: string, preview: string): Promise<void> {
  await appendLog({
    op: 'C',
    id,
    ts: Date.now(),
    pv: preview.substring(0, 30),
  });
}

/**
 * 记录更新会话
 */
export async function logUpdateSession(id: string, preview: string): Promise<void> {
  await appendLog({
    op: 'U',
    id,
    ts: Date.now(),
    pv: preview.substring(0, 30),
  });
}

