import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { usePersonaStore } from '../stores/usePersonaStore';
import { useChatStream } from '../hooks/useChatStream';
import ChatView from '../components/chat/ChatView';
import ChatList from '../components/chat/ChatList';
import MessageInput from '../components/chat/MessageInput';
import AIBadge from '../components/layout/AIBadge';
import { ROUTES } from '../config/routes';
import type { ChatMessage } from '@time-echo/shared';

export default function ChatPage() {
  const { personaId, sessionId } = useParams<{ personaId: string; sessionId: string }>();
  const navigate = useNavigate();

  const {
    sessions,
    messages,
    currentSessionId,
    isLoading,
    loadSessions,
    loadMessages,
    startNewSession,
    removeSession,
    addMessage,
    addStreamingMessage,
    removeStreamingMessage,
  } = useChatStore();

  const { currentPersona, loadPersona } = usePersonaStore();

  const [showSidebar, setShowSidebar] = useState(false);
  const [sending, setSending] = useState(false);

  // Load persona
  useEffect(() => {
    if (personaId) {
      loadPersona(personaId);
      loadSessions(personaId);
    }
  }, [personaId, loadPersona, loadSessions]);

  // Load session messages
  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId, loadMessages]);

  // SSE hook (only when we have a session)
  const { send, streaming, streamingText } = useChatStream({
    sessionId: currentSessionId || sessionId || '',
  });

  // Watch streaming text
  useEffect(() => {
    if (streaming && streamingText) {
      addStreamingMessage(streamingText);
    }
    if (!streaming) {
      removeStreamingMessage();
    }
  }, [streaming, streamingText, addStreamingMessage, removeStreamingMessage]);

  const handleSend = useCallback(
    async (content: string) => {
      let sid = currentSessionId || sessionId;

      // Create session if needed
      if (!sid && personaId) {
        sid = await startNewSession(personaId);
        navigate(`${ROUTES.CHAT}/${personaId}/${sid}`, { replace: true });
      }

      if (!sid) return;

      // Add user message to UI
      const userMsg: ChatMessage = {
        id: 'user-' + Date.now(),
        session_id: sid,
        role: 'user',
        content,
        token_count: 0,
        is_correction: false,
        correction_of: null,
        ai_labeled: false,
        created_at: new Date().toISOString(),
      };
      addMessage(userMsg);

      setSending(true);
      try {
        const { messageId, fullText } = await send(content);
        // Add AI message to UI
        const aiMsg: ChatMessage = {
          id: messageId,
          session_id: sid,
          role: 'assistant',
          content: fullText,
          token_count: 0,
          is_correction: false,
          correction_of: null,
          ai_labeled: true,
          created_at: new Date().toISOString(),
        };
        addMessage(aiMsg);
      } catch (err: any) {
        // Add error message
        const errMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          session_id: sid,
          role: 'system',
          content: `AI 回复失败：${err.message}`,
          token_count: 0,
          is_correction: false,
          correction_of: null,
          ai_labeled: false,
          created_at: new Date().toISOString(),
        };
        addMessage(errMsg);
      } finally {
        setSending(false);
      }
    },
    [currentSessionId, sessionId, personaId, addMessage, send, startNewSession, navigate]
  );

  const handleSelectSession = useCallback(
    (sid: string) => {
      setShowSidebar(false);
      navigate(`${ROUTES.CHAT}/${personaId}/${sid}`);
    },
    [personaId, navigate]
  );

  const handleDeleteSession = useCallback(
    (sid: string) => {
      removeSession(sid);
      if (sid === (currentSessionId || sessionId)) {
        navigate(`${ROUTES.CHAT}/${personaId}`, { replace: true });
      }
    },
    [removeSession, currentSessionId, sessionId, personaId, navigate]
  );

  const handleNewChat = useCallback(async () => {
    if (!personaId) return;
    const sid = await startNewSession(personaId);
    navigate(`${ROUTES.CHAT}/${personaId}/${sid}`);
  }, [personaId, startNewSession, navigate]);

  const timePeriod = currentPersona
    ? `${currentPersona.time_period_start || '?'} — ${currentPersona.time_period_end || '?'}`
    : '';

  return (
    <div className="h-full flex flex-col bg-wechat-bg">
      {/* Header */}
      <div className="h-11 flex items-center bg-wechat-card border-b border-wechat-divider px-2 shrink-0">
        <button onClick={() => navigate(-1)} className="p-1 mr-1">
          <ArrowLeft size={20} className="text-wechat-text" />
        </button>
        <div className="flex-1 text-center min-w-0">
          <p className="text-sm font-medium text-wechat-text truncate">
            {currentPersona?.name || '选择分身'}
          </p>
          {timePeriod && (
            <p className="text-[10px] text-wechat-text-secondary truncate">{timePeriod}</p>
          )}
        </div>
        <button onClick={() => setShowSidebar(!showSidebar)} className="p-1 ml-1">
          <List size={20} className="text-wechat-text" />
        </button>
      </div>

      {/* AI Badge */}
      <AIBadge />

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main chat */}
        <div className="flex-1 flex flex-col">
          <ChatView
            messages={messages}
            personaName={currentPersona?.name}
            timePeriod={timePeriod}
            loading={isLoading}
          />
          <MessageInput
            onSend={handleSend}
            disabled={sending}
            placeholder={currentPersona ? `和${currentPersona.name}说点什么...` : '请先选择一个分身'}
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="absolute inset-0 z-10 flex animate-fade-in">
            <div className="flex-1 bg-black/30" onClick={() => setShowSidebar(false)} />
            <div className="w-64 bg-white h-full overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-wechat-divider">
                <span className="text-sm font-medium">对话记录</span>
                <button
                  onClick={handleNewChat}
                  className="text-xs text-wechat-green font-medium"
                >
                  + 新对话
                </button>
              </div>
              <ChatList
                sessions={sessions}
                currentSessionId={currentSessionId || sessionId || null}
                onSelect={handleSelectSession}
                onDelete={handleDeleteSession}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
