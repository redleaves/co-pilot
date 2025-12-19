/**
 * 翻译 API 路由
 * POST /api/translate
 * 支持 SSE 流式输出
 */

import { NextRequest } from 'next/server';
import { getLLMClient, LLMError } from '@/lib/llm/client';
import { SYSTEM_PROMPT } from '@/lib/prompts/system-prompt';
import { generateTraceId } from '@/lib/trace';
import { logger } from '@/lib/logger';
import type { Message } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TranslateRequestBody {
  sessionId: string;
  message: string;
  history?: Message[];
}

/**
 * 构建用户消息（包含历史上下文）
 */
function buildUserMessage(message: string, history?: Message[]): string {
  if (!history || history.length === 0) {
    return `请分析并翻译以下内容：

"""
${message}
"""`;
  }

  // 构建历史对话上下文
  const historyText = history
    .map((msg, idx) => {
      const role = msg.role === 'user' ? '用户输入' : '系统输出';
      const TRUNCATE_LENGTH = 1000;
      return `第${Math.floor(idx / 2) + 1}轮：${role}"${msg.content.substring(0, TRUNCATE_LENGTH)}${msg.content.length > TRUNCATE_LENGTH ? '...' : ''}"`;
    })
    .join('\n');

  return `[历史对话]
${historyText}

[当前输入]
请分析并翻译以下内容：

"""
${message}
"""`;
}

export async function POST(request: NextRequest) {
  const traceId = generateTraceId();
  const encoder = new TextEncoder();

  logger.info(traceId, 'TranslateAPI', 'Request received');

  try {
    const body: TranslateRequestBody = await request.json();
    const { sessionId, message, history } = body;

    if (!message || !message.trim()) {
      logger.warn(traceId, 'TranslateAPI', 'Empty message');
      return new Response(
        JSON.stringify({ error: '请输入内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info(traceId, 'TranslateAPI', 'Processing', { 
      sessionId, 
      messageLength: message.length,
      historyCount: history?.length || 0 
    });

    const userMessage = buildUserMessage(message, history);

    // 临时日志：查看实际传入的历史内容
    logger.info(traceId, 'TranslateAPI', 'UserMessage Preview', {
      userMessageLength: userMessage.length,
      userMessagePreview: userMessage.substring(0, 500) + (userMessage.length > 500 ? '...[TRUNCATED]' : '')
    });

    const llmClient = getLLMClient();

    // 创建 SSE 流
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送开始事件
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

          // 流式获取 LLM 响应
          for await (const chunk of llmClient.streamChat(SYSTEM_PROMPT, userMessage, traceId)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`));
          }

          // 发送完成事件
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          logger.info(traceId, 'TranslateAPI', 'Stream completed');

        } catch (error) {
          const err = error as LLMError | Error;
          logger.error(traceId, 'TranslateAPI', 'Stream error', { error: err.message });
          
          const errorMessage = err instanceof LLMError ? err.message : 'AI 服务暂时不可用，请稍后重试';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Trace-Id': traceId,
      },
    });

  } catch (error) {
    const err = error as Error;
    logger.error(traceId, 'TranslateAPI', 'Request error', { error: err.message });
    
    return new Response(
      JSON.stringify({ error: '请求处理失败' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

