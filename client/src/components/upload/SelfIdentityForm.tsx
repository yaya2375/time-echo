import { useState } from 'react';

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

export default function SelfIdentityForm({ initialValues, onSubmit, loading }: SelfIdentityFormProps) {
  const [selfDescription, setSelfDescription] = useState(initialValues?.selfDescription || '');
  const [whatMattered, setWhatMattered] = useState(initialValues?.whatMattered || '');
  const [whatChanged, setWhatChanged] = useState(initialValues?.whatChanged || '');
  const [keyEvents, setKeyEvents] = useState(initialValues?.keyEvents?.join('\n') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      selfDescription,
      whatMattered,
      whatChanged,
      keyEvents: keyEvents.split('\n').filter((s) => s.trim()),
    });
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
          <textarea
            value={selfDescription}
            onChange={(e) => setSelfDescription(e.target.value)}
            placeholder="比如：大学刚毕业，满腔热血但有点迷茫..."
            className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-wechat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wechat-text mb-1">
            那时候的你最在意什么？
          </label>
          <input
            type="text"
            value={whatMattered}
            onChange={(e) => setWhatMattered(e.target.value)}
            placeholder="比如：朋友、自由、成就感..."
            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-wechat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wechat-text mb-1">
            现在的你觉得那时的自己...
          </label>
          <input
            type="text"
            value={whatChanged}
            onChange={(e) => setWhatChanged(e.target.value)}
            placeholder="比如：那时候好单纯 / 那时候勇气真大"
            className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-wechat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-wechat-text mb-1">
            印象深刻的事情（每行一个）
          </label>
          <textarea
            value={keyEvents}
            onChange={(e) => setKeyEvents(e.target.value)}
            placeholder="比如：&#10;毕业旅行&#10;第一次面试&#10;分手那天"
            className="w-full h-20 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none outline-none focus:border-wechat-green"
          />
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
