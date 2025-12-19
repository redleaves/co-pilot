/**
 * LLM 客户端
 * 封装 OpenAI SDK，支持流式调用
 */

import OpenAI from 'openai';
import { getLLMConfig, type LLMConfig } from './config';
import { logger } from '@/lib/logger';

export class LLMClient {
  private client: OpenAI;
  private model: string;
  private config: LLMConfig;

  constructor() {
    this.config = getLLMConfig();
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
    });
    this.model = this.config.model;
  }

  /**
   * 流式调用 LLM
   * @param systemPrompt System Prompt
   * @param userMessage 用户消息
   * @param traceId 追踪ID
   * @yields 每个 chunk 的内容
   */
  async *streamChat(
    systemPrompt: string,
    userMessage: string,
    traceId: string
  ): AsyncGenerator<string> {
    logger.info(traceId, 'LLMClient', 'Stream started', { model: this.model });

    const startTime = Date.now();
    let firstChunkReceived = false;
    let totalContent = '';

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          if (!firstChunkReceived) {
            firstChunkReceived = true;
            const latency = Date.now() - startTime;
            logger.info(traceId, 'LLMClient', 'First chunk received', { latency: `${latency}ms` });
          }
          totalContent += content;
          yield content;
        }
      }

      const duration = Date.now() - startTime;
      logger.info(traceId, 'LLMClient', 'Stream completed', { 
        duration: `${duration}ms`,
        contentLength: totalContent.length 
      });

    } catch (error) {
      const err = error as Error;
      logger.error(traceId, 'LLMClient', 'Stream error', { 
        error: err.message,
        name: err.name 
      });
      
      // 处理常见错误
      if (err.message.includes('rate limit')) {
        throw new LLMError('RATE_LIMIT', '请求过于频繁，请稍后再试');
      }
      if (err.message.includes('timeout')) {
        throw new LLMError('TIMEOUT', 'AI 服务响应超时，请重试');
      }
      if (err.message.includes('API key')) {
        throw new LLMError('AUTH_ERROR', 'API 认证失败');
      }
      
      throw new LLMError('LLM_ERROR', 'AI 服务暂时不可用，请稍后重试');
    }
  }
}

/**
 * LLM 错误类
 */
export class LLMError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'LLMError';
  }
}

// 导出单例
let llmClient: LLMClient | null = null;

export function getLLMClient(): LLMClient {
  if (!llmClient) {
    llmClient = new LLMClient();
  }
  return llmClient;
}

