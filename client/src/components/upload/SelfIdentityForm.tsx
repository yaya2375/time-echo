import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';

interface SelfIdentityFormProps {
  initialValues?: {
    selfDescription: string;
    whatMattered: string;
    whatChanged: string;
    keyEvents: string[];
  };
  onSubmit: (data: {
    selfDescription: string;
    whatMattered: string;
    whatChanged: string;
    keyEvents: string[];
  }) => void;
  loading?: boolean;
}

function VoiceTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className: string;
}) {
  const { isRecording, interimText, toggleRecording, hasSupport } = useVoiceInput(
    (transcript) => onChange(value + transcript)
  );

  return (
    <div className="flex items-start gap-2">
      <textarea
        value={value + interimText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isRecording ? '正在聆听...' : placeholder}
        className={className}
      />
      {hasSupport && (
        <button
          type="button"
          onClick={toggleRecording}
          className={`shrink-0 mt-1 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
          title={isRecording ? '点击停止' : '语音输入'}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
      )}
    </div>
  );
}

function VoiceInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className: string;
}) {
  const { isRecording, interimText, toggleRecording, hasSupport } = useVoiceInput(
    (transcript) => onChange(value + transcript)
  );

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value + interimText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isRecording ? '正在聆听...' : placeholder}
        className={className}
      />
      {hasSupport && (
        <button
          type="button"
          onClick={toggleRecording}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
          title={isRecording ? '点击停止' : '语音输入'}
        >
          {isRecording ? '⏹' : '🎤'}
        </button>
      )}
    </div>
  );
}

export default function SelfIdentityForm({ initialValues, onSubmit, loading }: SelfIdentityFormProps) {
  const [selfDescription, setSelfDescription] = useState(initialValues?.selfDescription || '');
  const [whatMattered, setWhatMattered] = useState(initialValues?.whatMattered || '');
  const [whatChanged, setWhatChanged] = useState(initialValues?.whatChanged || '');
  const [events, setEvents] = useState<string[]>(
    initialValues?.keyEvents?.length ? initialValues.keyEvents : ['']
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      selfDescription,
      whatMattered,
      whatChanged,
      keyEvents: events.filter((s) => s.trim()),
    });
  };

  const updateEvent = (index: number, value: string) => {
    setEvents((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const addEvent = () => {
    setEvents((prev) => [...prev, '']);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-medium text-wechat-text">描述那个时期的你</p>
        <p className="text-xs text-wechat-text-secondary">帮助 AI 更好理解当时的你（可选）</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-wechat-text mb-1">
            用几句话描述那个时期的你
          </label>
          <VoiceTextarea
            value={selfDescription}
            onChange={setSelfDescription}
            placeholder="比如：大学刚毕业，满腔热血但有点迷茫..."
            className="flex-1 h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-wechat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wechat-text mb-1">
            那时候的你最在意什么？
          </label>
          <VoiceInput
            value={whatMattered}
            onChange={setWhatMattered}
            placeholder="比如：朋友、自由、成就感..."
            className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-wechat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wechat-text mb-1">
            现在的你觉得那时的自己...
          </label>
          <VoiceInput
            value={whatChanged}
            onChange={setWhatChanged}
            placeholder="比如：那时候好单纯 / 那时候勇气真大"
            className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-wechat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wechat-text mb-2">
            印象深刻的事情
          </label>
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-wechat-text-secondary w-10 shrink-0">
                  事件{index + 1}
                </span>
                <VoiceInput
                  value={event}
                  onChange={(v) => updateEvent(index, v)}
                  placeholder={`描述第${index + 1}件事...`}
                  className="flex-1 h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-wechat-green"
                />
                {events.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEvent(index)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addEvent}
            className="mt-2 w-full h-10 border border-dashed border-gray-300 rounded-lg text-sm text-wechat-text-secondary flex items-center justify-center gap-1 hover:border-wechat-green hover:text-wechat-green transition-colors"
          >
            <Plus size={16} /> 新增事件
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-wechat-green text-white rounded-lg text-sm font-medium hover:bg-wechat-green-dark disabled:opacity-50 transition-colors"
        >
          {loading ? '分析中...' : '继续 →'}
        </button>
      </form>
    </div>
  );
}
