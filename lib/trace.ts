/**
 * TraceId 生成器
 * 用于请求链路追踪
 */

import { nanoid } from 'nanoid';

/**
 * 生成 8 位短 TraceId
 * 格式示例：abc12345
 */
export function generateTraceId(): string {
  return nanoid(8);
}

