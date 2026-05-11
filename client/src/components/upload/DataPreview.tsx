import type { RawMessage } from '../../parser';
import type { SelfFilterResult } from '../../parser/self-filter';

interface DataPreviewProps {
  messages: RawMessage[];
  selfFilter: SelfFilterResult;
}

export default function DataPreview({ messages, selfFilter }: DataPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-medium text-wechat-text">解析预览</p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-wechat-green">{messages.length}</p>
            <p className="text-xs text-wechat-text-secondary">总消息数</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-wechat-link">{selfFilter.selfMessages.length}</p>
            <p className="text-xs text-wechat-text-secondary">你的消息数</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-wechat-text-secondary mb-1">识别为你：</p>
          <p className="text-sm font-medium text-wechat-text">{selfFilter.selfName}</p>
          {selfFilter.otherSenders.length > 0 && (
            <>
              <p className="text-xs text-wechat-text-secondary mt-2 mb-1">其他人：</p>
              <p className="text-sm text-wechat-text-secondary">
                {selfFilter.otherSenders.join('、')}
              </p>
            </>
          )}
          <p className="text-xs text-wechat-text-secondary mt-1">
            置信度：{(selfFilter.confidence * 100).toFixed(0)}%
          </p>
        </div>

        {/* Sample messages */}
        <div>
          <p className="text-xs text-wechat-text-secondary mb-2">消息示例：</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {selfFilter.selfMessages.slice(0, 5).map((m, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-wechat-text-secondary shrink-0">{m.timestamp?.slice(0, 16) || '-'}</span>
                <span className="text-wechat-text truncate">{m.content}</span>
              </div>
            ))}
          </div>
        </div>

        {messages.length < 100 && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            消息量较少（{messages.length}条），建议至少 500 条以获得更好的还原度
          </p>
        )}
      </div>
    </div>
  );
}
