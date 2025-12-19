'use client';

import { useState, useCallback, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UseTranslateOptions {
  sessionId: string;
  history?: Message[];
  onComplete?: (content: string) => void;
}

interface UseTranslateReturn {
  translate: (message: string) => Promise<void>;
  content: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * 异步持久化会话（不阻塞主流程）
 */
async function persistSession(sessionId: string, userMessage: string, assistantMessage: string) {
  try {
    await fetch('/api/session/persist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, userMessage, assistantMessage }),
    });
  } catch (e) {
    console.error('Failed to persist session:', e);
  }
}

export function useTranslate({ sessionId, history, onComplete }: UseTranslateOptions): UseTranslateReturn {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<string>('');

  const translate = useCallback(async (message: string) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    currentMessageRef.current = message;

    setContent('');
    setError(null);
    setIsLoading(true);
    setIsStreaming(false);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message, history }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'start') {
              setIsStreaming(true);
              setIsLoading(false);
            } else if (data.type === 'chunk' && data.data) {
              fullContent += data.data;
              setContent(fullContent);
            } else if (data.type === 'done') {
              setIsStreaming(false);
              // 清空流式内容（因为会被添加到 messages 中）
              setContent('');
              // 异步持久化会话
              persistSession(sessionId, currentMessageRef.current, fullContent);
              onComplete?.(fullContent);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message);
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [sessionId, history, onComplete]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setContent('');
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  return { translate, content, isLoading, isStreaming, error, reset };
}

