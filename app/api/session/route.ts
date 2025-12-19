/**
 * Session API 路由
 * GET /api/session - 获取会话列表
 * GET /api/session?id=xxx - 获取指定会话
 * POST /api/session - 创建新会话（返回临时ID）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, readSessionFile, createTempSession } from '@/lib/session/manager';
import { generateTraceId } from '@/lib/trace';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/session
 */
export async function GET(request: NextRequest) {
  const traceId = generateTraceId();
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');

  try {
    if (sessionId) {
      // 获取指定会话
      logger.info(traceId, 'SessionAPI', 'Get session', { sessionId });
      const session = await readSessionFile(sessionId);
      
      if (!session) {
        return NextResponse.json(
          { error: '会话不存在' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(session);
    } else {
      // 获取会话列表
      logger.info(traceId, 'SessionAPI', 'Get session list');
      const sessions = await getAllSessions();
      return NextResponse.json(sessions);
    }
  } catch (error) {
    const err = error as Error;
    logger.error(traceId, 'SessionAPI', 'Error', { error: err.message });
    return NextResponse.json(
      { error: '获取会话失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/session
 * 创建新的临时会话（仅返回ID，不持久化）
 */
export async function POST() {
  const traceId = generateTraceId();
  
  try {
    const tempSession = createTempSession();
    logger.info(traceId, 'SessionAPI', 'Create temp session', { sessionId: tempSession.id });
    
    return NextResponse.json({
      id: tempSession.id,
      createdAt: tempSession.createdAt,
      messages: [],
    });
  } catch (error) {
    const err = error as Error;
    logger.error(traceId, 'SessionAPI', 'Error creating session', { error: err.message });
    return NextResponse.json(
      { error: '创建会话失败' },
      { status: 500 }
    );
  }
}

