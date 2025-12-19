'use client';

import ReactMarkdown from 'react-markdown';

/**
 * 对话历史组件 - DeepSeek 风格
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatHistoryProps {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
}

export default function ChatHistory({ messages, streamingContent, isStreaming }: ChatHistoryProps) {
  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 渲染助手消息内容
  const renderAssistantContent = (content: string, streaming = false) => (
    <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-lg font-bold text-gray-900 mt-4 mb-3 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold text-gray-800 mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-gray-700">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-gray-700">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700 text-sm leading-relaxed">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="text-gray-600">{children}</em>,
          code: ({ children }) => (
            <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-blue-400 pl-4 my-3 text-gray-600 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
      {streaming && (
        <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );

  if (messages.length === 0 && !streamingContent) {
    return null;
  }

  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <div key={msg.id} className="animate-fadeIn">
          {msg.role === 'user' ? (
            // 用户消息 - 简洁样式
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">你</span>
                  <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ) : (
            // 助手消息 - 卡片样式
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">翻译助手</span>
                  <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  {renderAssistantContent(msg.content)}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 流式输出中的内容 */}
      {streamingContent && (
        <div className="flex items-start gap-3 animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-900">翻译助手</span>
              <span className="text-xs text-gray-400">正在输出...</span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              {renderAssistantContent(streamingContent, isStreaming)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

