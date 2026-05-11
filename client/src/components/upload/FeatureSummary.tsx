import type { FeatureVector } from '@time-echo/shared';

interface FeatureSummaryProps {
  featureVector: FeatureVector;
}

export default function FeatureSummary({ featureVector }: FeatureSummaryProps) {
  const { linguistic_features, emotional_features, metadata } = featureVector;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-medium text-wechat-text">特征提取摘要</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="平均消息长度" value={`${linguistic_features.average_message_length}字`} />
          <StatCard label="emoji 使用" value={`${linguistic_features.emoji_usage.length}种`} />
          <StatCard label="问句比例" value={`${(linguistic_features.question_ratio * 100).toFixed(0)}%`} />
        </div>

        <div>
          <p className="text-xs font-medium text-wechat-text mb-2">高频词汇 Top 10</p>
          <div className="flex flex-wrap gap-1">
            {linguistic_features.top_words.slice(0, 10).map(([word, count], i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-gray-100 rounded text-xs"
                style={{
                  fontSize: `${Math.max(11, 14 - i * 0.3)}px`,
                  opacity: 1 - i * 0.05,
                }}
              >
                {word} <span className="text-wechat-text-secondary">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {linguistic_features.catchphrases.length > 0 && (
          <div>
            <p className="text-xs font-medium text-wechat-text mb-2">口头禅</p>
            <div className="flex flex-wrap gap-1">
              {linguistic_features.catchphrases.slice(0, 8).map(([phrase, count], i) => (
                <span key={i} className="px-2 py-0.5 bg-green-50 text-wechat-green rounded text-xs">
                  {phrase} ×{count}
                </span>
              ))}
            </div>
          </div>
        )}

        {linguistic_features.emoji_usage.length > 0 && (
          <div>
            <p className="text-xs font-medium text-wechat-text mb-2">常用 Emoji</p>
            <div className="flex gap-2 text-lg">
              {linguistic_features.emoji_usage.slice(0, 6).map(([emoji], i) => (
                <span key={i}>{emoji}</span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-wechat-text mb-2">情绪分布</p>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="bg-green-400 h-full transition-all"
              style={{ width: `${emotional_features.sentiment_distribution.positive * 100}%` }}
            />
            <div
              className="bg-gray-300 h-full transition-all"
              style={{ width: `${emotional_features.sentiment_distribution.neutral * 100}%` }}
            />
            <div
              className="bg-red-400 h-full transition-all"
              style={{ width: `${emotional_features.sentiment_distribution.negative * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-wechat-text-secondary mt-1">
            <span>正面 {(emotional_features.sentiment_distribution.positive * 100).toFixed(0)}%</span>
            <span>负面 {(emotional_features.sentiment_distribution.negative * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-wechat-text">{value}</p>
      <p className="text-xs text-wechat-text-secondary">{label}</p>
    </div>
  );
}
