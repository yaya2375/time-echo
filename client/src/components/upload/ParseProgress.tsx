import type { ParseProgress as ParseProgressType } from '../../parser';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const stageLabels: Record<string, string> = {
  detecting: '检测文件格式',
  parsing: '解析聊天记录',
  filtering: '筛选你的消息',
  extracting: '提取语言特征',
  done: '解析完成',
  error: '解析失败',
};

interface ParseProgressProps {
  progress: ParseProgressType;
}

export default function ParseProgress({ progress }: ParseProgressProps) {
  const { stage, message, error } = progress;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        {stage === 'error' ? (
          <AlertCircle className="w-6 h-6 text-red-500" />
        ) : stage === 'done' ? (
          <CheckCircle className="w-6 h-6 text-wechat-green" />
        ) : (
          <Loader2 className="w-6 h-6 text-wechat-green animate-spin" />
        )}
        <span className="text-sm font-medium text-wechat-text">
          {stageLabels[stage] || stage}
        </span>
      </div>

      {stage !== 'error' && stage !== 'done' && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-wechat-green h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress.progress, 100)}%` }}
          />
        </div>
      )}

      {message && <p className="text-xs text-wechat-text-secondary">{message}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
