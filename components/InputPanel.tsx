'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * 输入面板组件 - DeepSeek 风格
 */

interface InputPanelProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function InputPanel({ onSubmit, isLoading, disabled = false }: InputPanelProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || isLoading || disabled) return;

    if (trimmed.length > 5000) {
      alert('输入内容不能超过5000字符');
      return;
    }

    onSubmit(trimmed);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入产品需求或技术成果，我来帮你翻译..."
        className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-400 text-base leading-relaxed p-4 pb-2"
        rows={3}
        disabled={isLoading || disabled}
      />

      <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-100">
        <div className="text-sm text-gray-400">
          {content.length > 0 && (
            <span className={content.length > 5000 ? 'text-red-500' : ''}>
              {content.length} / 5000
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-400 hidden sm:inline">⌘ + Enter 发送</span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isLoading || disabled}
            className={`px-5 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
              isLoading
                ? 'bg-blue-600 text-white cursor-wait'
                : !content.trim() || disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>翻译中...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>开始翻译</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

