'use client';

import { useState, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  createdAt: number;
  updatedAt: number;
  preview: string;
  messages: Message[];
}

interface SessionListItem {
  id: string;
  preview: string;
  updatedAt: number;
}

interface UseSessionReturn {
  currentSession: Session | null;
  sessionList: SessionListItem[];
  isLoading: boolean;
  createNewSession: () => Promise<void>;
  loadSession: (id: string) => Promise<void>;
  refreshSessionList: () => Promise<void>;
  addMessage: (message: Message) => void;
}

export function useSession(): UseSessionReturn {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionList, setSessionList] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载会话列表
  const refreshSessionList = useCallback(async () => {
    try {
      const response = await fetch('/api/session');
      if (response.ok) {
        const list = await response.json();
        setSessionList(list);
      }
    } catch (error) {
      console.error('Failed to load session list:', error);
    }
  }, []);

  // 创建新会话
  const createNewSession = useCallback(async () => {
    try {
      const response = await fetch('/api/session', { method: 'POST' });
      if (response.ok) {
        const session = await response.json();
        setCurrentSession({
          id: session.id,
          createdAt: session.createdAt,
          updatedAt: session.createdAt,
          preview: '',
          messages: [],
        });
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }, []);

  // 加载指定会话
  const loadSession = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/session?id=${id}`);
      if (response.ok) {
        const session = await response.json();
        setCurrentSession(session);
      } else if (response.status === 404) {
        // 会话不存在，创建新会话
        await createNewSession();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }, [createNewSession]);

  // 添加消息到当前会话
  const addMessage = useCallback((message: Message) => {
    setCurrentSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
        updatedAt: Date.now(),
        preview: message.role === 'user' ? message.content.substring(0, 30) : prev.preview,
      };
    });
  }, []);

  // 初始化：加载会话列表和最新会话
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await refreshSessionList();
      
      // 尝试加载最新会话，如果没有则创建新会话
      const response = await fetch('/api/session');
      if (response.ok) {
        const list = await response.json();
        if (list.length > 0) {
          await loadSession(list[0].id);
        } else {
          await createNewSession();
        }
      } else {
        await createNewSession();
      }
      
      setIsLoading(false);
    };
    
    init();
  }, [refreshSessionList, loadSession, createNewSession]);

  return {
    currentSession,
    sessionList,
    isLoading,
    createNewSession,
    loadSession,
    refreshSessionList,
    addMessage,
  };
}

