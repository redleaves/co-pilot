'use client';

/**
 * 会话侧边栏组件 - 简洁风格
 */

interface SessionItem {
  id: string;
  preview: string;
  updatedAt: number;
}

interface SessionBarProps {
  sessions: SessionItem[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  isLoading?: boolean;
}

export default function SessionBar({
  sessions,
  currentSessionId,
  onSelectSession,
  isLoading = false,
}: SessionBarProps) {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <aside className="hidden md:block w-64 bg-white border-r border-gray-100 p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">历史会话</h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-gray-100 p-4 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">历史会话</h2>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-sm text-gray-400">暂无历史会话</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                currentSessionId === session.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <p className={`text-sm truncate ${
                currentSessionId === session.id ? 'font-medium' : 'font-normal'
              }`}>
                {session.preview || '新会话'}
              </p>
              <p className={`text-xs mt-0.5 ${
                currentSessionId === session.id ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {formatTime(session.updatedAt)}
              </p>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

