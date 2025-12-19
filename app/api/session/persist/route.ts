/**
 * Session 持久化 API
 * POST /api/session/persist
 * 在翻译完成后调用，异步持久化会话
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  readSessionFile, 
  writeSessionFile, 
  sessionFileExists,
  logCreateSession,
  logUpdateSession,
  type Session,
  type Message,
  generateMessageId
} from '@/lib/session/manager';
import { generateTraceId } from '@/lib/trace';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PersistRequestBody {
  sessionId: string;
  userMessage: string;
  assistantMessage: string;
}

export async function POST(request: NextRequest) {
  const traceId = generateTraceId();

  try {
    const body: PersistRequestBody = await request.json();
    const { sessionId, userMessage, assistantMessage } = body;

    if (!sessionId || !userMessage || !assistantMessage) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    logger.info(traceId, 'PersistAPI', 'Persisting session', { sessionId });

    const now = Date.now();
    const isNewSession = !(await sessionFileExists(sessionId));

    // 读取或创建会话
    let session: Session;
    if (isNewSession) {
      session = {
        id: sessionId,
        createdAt: now,
        updatedAt: now,
        preview: userMessage.substring(0, 30),
        messages: [],
      };
    } else {
      const existing = await readSessionFile(sessionId);
      session = existing || {
        id: sessionId,
        createdAt: now,
        updatedAt: now,
        preview: userMessage.substring(0, 30),
        messages: [],
      };
    }

    // 添加消息
    const userMsg: Message = {
      id: generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: now,
    };
    const assistantMsg: Message = {
      id: generateMessageId(),
      role: 'assistant',
      content: assistantMessage,
      timestamp: now,
    };

    session.messages.push(userMsg, assistantMsg);
    session.updatedAt = now;
    session.preview = userMessage.substring(0, 30);

    // 写入文件
    await writeSessionFile(session);

    // 更新索引
    if (isNewSession) {
      await logCreateSession(sessionId, session.preview);
      logger.info(traceId, 'PersistAPI', 'New session created', { sessionId });
    } else {
      await logUpdateSession(sessionId, session.preview);
      logger.info(traceId, 'PersistAPI', 'Session updated', { sessionId });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    const err = error as Error;
    logger.error(traceId, 'PersistAPI', 'Error', { error: err.message });
    return NextResponse.json(
      { error: '持久化失败' },
      { status: 500 }
    );
  }
}

