import { useState, useRef, useCallback } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ onSend, disabled, placeholder }: MessageInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleVoiceResult = useCallback((transcript: string) => {
    setText((prev) => prev + transcript);
  }, []);

  const { isRecording, interimText, toggleRecording, hasSupport } = useVoiceInput(handleVoiceResult);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [text, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const displayText = text + interimText;

  return (
    <div className="flex items-end gap-2 px-3 py-2 bg-wechat-card border-t border-wechat-divider">
      {hasSupport && (
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-200 text-wechat-text-secondary hover:bg-gray-300'
          }`}
          title={isRecording ? '点击停止录音' : '语音输入'}
        >
          {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      )}
      <textarea
        ref={inputRef}
        value={displayText}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? '正在聆听...' : placeholder || '说点什么...'}
        disabled={disabled}
        rows={1}
        className="flex-1 max-h-[120px] px-3 py-2 text-sm bg-wechat-bg rounded-lg outline-none resize-none"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="shrink-0 w-9 h-9 bg-wechat-green text-white rounded-lg flex items-center justify-center disabled:opacity-40 transition-opacity"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
