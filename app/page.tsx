'use client';

import { useCallback, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import SessionBar from '@/components/SessionBar';
import InputPanel from '@/components/InputPanel';
import ChatHistory from '@/components/ChatHistory';
import { useSession } from '@/hooks/useSession';
import { useTranslate } from '@/hooks/useTranslate';
import { nanoid } from 'nanoid';

export default function Home() {
  const {
    currentSession,
    sessionList,
    isLoading: isSessionLoading,
    createNewSession,
    loadSession,
    refreshSessionList,
    addMessage,
  } = useSession();

  const mainRef = useRef<HTMLDivElement>(null);

  const handleTranslateComplete = useCallback((content: string) => {
    addMessage({
      id: nanoid(8),
      role: 'assistant',
      content,
      timestamp: Date.now(),
    });
    refreshSessionList();
  }, [addMessage, refreshSessionList]);

  const {
    translate,
    content: streamingContent,
    isLoading: isTranslating,
    isStreaming,
    error,
    reset: resetTranslate,
  } = useTranslate({
    sessionId: currentSession?.id || '',
    history: currentSession?.messages,
    onComplete: handleTranslateComplete,
  });

  const handleSubmit = useCallback(async (content: string) => {
    addMessage({
      id: nanoid(8),
      role: 'user',
      content,
      timestamp: Date.now(),
    });
    await translate(content);
  }, [addMessage, translate]);

  const handleNewSession = useCallback(async () => {
    resetTranslate();
    await createNewSession();
  }, [resetTranslate, createNewSession]);

  const handleSelectSession = useCallback(async (id: string) => {
    resetTranslate();
    await loadSession(id);
  }, [resetTranslate, loadSession]);

  // 滚动到底部
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [currentSession?.messages, streamingContent]);

  if (isSessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onNewSession={handleNewSession} />

      <div className="flex-1 flex overflow-hidden">
        <SessionBar
          sessions={sessionList}
          currentSessionId={currentSession?.id || null}
          onSelectSession={handleSelectSession}
        />

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* 空状态 */}
            {!currentSession?.messages.length && !streamingContent && !isTranslating && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">开始对话</h2>
                <p className="text-gray-500 text-sm max-w-sm">
                  输入产品需求或技术成果，我来帮你翻译成对方能理解的语言
                </p>
              </div>
            )}

            {/* 对话历史 + 流式输出 */}
            <ChatHistory
              messages={currentSession?.messages || []}
              streamingContent={streamingContent}
              isStreaming={isStreaming}
            />

            {/* 错误提示 */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">出错了</span>
                </div>
                <p className="mt-1 text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* 底部间距 - 确保内容不被固定输入框遮挡 */}
            <div className="h-48" />
          </div>

          {/* 输入面板 - 固定底部 */}
          <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pt-6 pb-4 px-4">
            <div className="max-w-3xl mx-auto">
              <InputPanel
                onSubmit={handleSubmit}
                isLoading={isTranslating || isStreaming}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
