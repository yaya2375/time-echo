import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

const SpeechRecognitionAPI: typeof SpeechRecognition | undefined =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function MessageInput({ onSend, disabled, placeholder }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setText((prev) => prev + final);
      }
      // Show interim text via a data attribute trick: append to current text visually
      if (interim && inputRef.current) {
        const current = text + final;
        // We store interim separately to avoid polluting the actual text state
        inputRef.current.value = current + interim;
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition error:', event.error);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      // Restore actual text value
      if (inputRef.current) {
        inputRef.current.value = text;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex items-end gap-2 px-3 py-2 bg-wechat-card border-t border-wechat-divider">
      {SpeechRecognitionAPI && (
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
        value={text}
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
