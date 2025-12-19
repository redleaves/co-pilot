/**
 * Session Markdown 存储
 * 每个 Session 存储为一个 .md 文件
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Session, Message } from './types';

const SESSIONS_DIR = path.join(process.cwd(), 'sessions');

/**
 * 获取 Session 文件路径
 */
function getSessionPath(sessionId: string): string {
  return path.join(SESSIONS_DIR, `${sessionId}.md`);
}

/**
 * 序列化 Session 为 Markdown
 */
export function serializeSession(session: Session): string {
  const lines: string[] = [];
  
  // YAML Front Matter
  lines.push('---');
  lines.push(`id: ${session.id}`);
  lines.push(`createdAt: ${session.createdAt}`);
  lines.push(`updatedAt: ${session.updatedAt}`);
  lines.push(`preview: "${session.preview.replace(/"/g, '\\"')}"`);
  lines.push('---');
  lines.push('');
  
  // 对话内容
  for (const msg of session.messages) {
    const roleLabel = msg.role === 'user' ? '## 👤 用户' : '## 🤖 助手';
    lines.push(roleLabel);
    lines.push(`<!-- id: ${msg.id} | ts: ${msg.timestamp} -->`);
    lines.push('');
    lines.push(msg.content);
    lines.push('');
  }
  
  return lines.join('\n');
}

/**
 * 解析 Markdown 为 Session
 */
export function parseSession(content: string): Session | null {
  try {
    // 解析 YAML Front Matter
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) return null;
    
    const frontMatter = frontMatterMatch[1];
    const idMatch = frontMatter.match(/id:\s*(.+)/);
    const createdAtMatch = frontMatter.match(/createdAt:\s*(\d+)/);
    const updatedAtMatch = frontMatter.match(/updatedAt:\s*(\d+)/);
    const previewMatch = frontMatter.match(/preview:\s*"(.*)"/);
    
    if (!idMatch || !createdAtMatch || !updatedAtMatch) return null;
    
    const session: Session = {
      id: idMatch[1].trim(),
      createdAt: parseInt(createdAtMatch[1]),
      updatedAt: parseInt(updatedAtMatch[1]),
      preview: previewMatch ? previewMatch[1] : '',
      messages: [],
    };
    
    // 解析对话内容 - 使用更可靠的正则匹配每个消息块
    const bodyContent = content.substring(frontMatterMatch[0].length);
    // 匹配 ## 👤 用户 或 ## 🤖 助手 开头的块
    const messageRegex = /## (👤 用户|🤖 助手)\n<!-- id: (\S+) \| ts: (\d+) -->\n\n([\s\S]*?)(?=\n## (?:👤|🤖)|$)/gu;

    let match;
    while ((match = messageRegex.exec(bodyContent)) !== null) {
      const [, roleLabel, msgId, ts, msgContent] = match;
      const role = roleLabel.includes('用户') ? 'user' : 'assistant';
      const trimmedContent = msgContent.trim();

      if (trimmedContent) {
        session.messages.push({
          id: msgId,
          role,
          content: trimmedContent,
          timestamp: parseInt(ts)
        });
      }
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * 读取 Session 文件
 */
export async function readSessionFile(sessionId: string): Promise<Session | null> {
  try {
    const filePath = getSessionPath(sessionId);
    const content = await fs.readFile(filePath, 'utf-8');
    return parseSession(content);
  } catch {
    return null;
  }
}

/**
 * 写入 Session 文件
 */
export async function writeSessionFile(session: Session): Promise<void> {
  const filePath = getSessionPath(session.id);
  const content = serializeSession(session);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 检查 Session 文件是否存在
 */
export async function sessionFileExists(sessionId: string): Promise<boolean> {
  try {
    await fs.access(getSessionPath(sessionId));
    return true;
  } catch {
    return false;
  }
}

