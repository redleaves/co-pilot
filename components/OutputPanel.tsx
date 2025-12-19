'use client';

import ReactMarkdown from 'react-markdown';

/**
 * 输出面板组件
 */

interface OutputPanelProps {
  content: string;
  isStreaming: boolean;
  error?: string | null;
}

export default function OutputPanel({ content, isStreaming, error }: OutputPanelProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">出错了</span>
        </div>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!content && !isStreaming) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🔄</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">等待输入</h3>
        <p className="text-gray-500 text-sm">
          输入产品需求或技术成果，我来帮你翻译成对方能理解的语言
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="prose prose-blue max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-medium text-gray-700 mt-4 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3">{children}</ol>,
            li: ({ children }) => <li className="text-gray-700">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            code: ({ children }) => (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
        
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}

