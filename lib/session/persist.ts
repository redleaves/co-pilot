/**
 * 异步持久化模块
 * 不阻塞 SSE 主流程
 */

import { logger } from '@/lib/logger';
import { writeSessionFile, sessionFileExists } from './storage';
import { logCreateSession, logUpdateSession } from './index-log';
import type { Session, Message } from './types';

/**
 * 异步持久化一轮对话
 * 在首次查询时创建会话文件，后续更新
 * 
 * @param session 当前会话
 * @param userMessage 用户消息
 * @param assistantMessage 助手消息
 * @param traceId 追踪ID
 */
export async function persistTurnAsync(
  session: Session,
  userMessage: Message,
  assistantMessage: Message,
  traceId: string
): Promise<void> {
  // 异步执行，不阻塞主流程
  setImmediate(async () => {
    try {
      const isNewSession = !(await sessionFileExists(session.id));
      
      // 更新会话数据
      session.messages.push(userMessage, assistantMessage);
      session.updatedAt = Date.now();
      session.preview = userMessage.content.substring(0, 30);
      
      // 写入文件
      await writeSessionFile(session);
      
      // 更新索引
      if (isNewSession) {
        await logCreateSession(session.id, session.preview);
        logger.info(traceId, 'Persist', 'New session created', { sessionId: session.id });
      } else {
        await logUpdateSession(session.id, session.preview);
        logger.info(traceId, 'Persist', 'Session updated', { sessionId: session.id });
      }
      
    } catch (error) {
      const err = error as Error;
      logger.error(traceId, 'Persist', 'Failed to persist session', { 
        sessionId: session.id,
        error: err.message 
      });
    }
  });
}

/**
 * 同步持久化（用于需要等待完成的场景）
 */
export async function persistTurnSync(
  session: Session,
  userMessage: Message,
  assistantMessage: Message,
  traceId: string
): Promise<void> {
  try {
    const isNewSession = !(await sessionFileExists(session.id));
    
    session.messages.push(userMessage, assistantMessage);
    session.updatedAt = Date.now();
    session.preview = userMessage.content.substring(0, 30);
    
    await writeSessionFile(session);
    
    if (isNewSession) {
      await logCreateSession(session.id, session.preview);
      logger.info(traceId, 'Persist', 'New session created (sync)', { sessionId: session.id });
    } else {
      await logUpdateSession(session.id, session.preview);
      logger.info(traceId, 'Persist', 'Session updated (sync)', { sessionId: session.id });
    }
    
  } catch (error) {
    const err = error as Error;
    logger.error(traceId, 'Persist', 'Failed to persist session', { 
      sessionId: session.id,
      error: err.message 
    });
    throw err;
  }
}

