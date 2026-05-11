import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import type { Persona } from '@time-echo/shared';

interface LayerViewerProps {
  persona: Persona;
  editable?: boolean;
  onEditLayer?: (layerKey: string, content: Record<string, unknown>) => void;
}

const layerConfig: Array<{ key: string; label: string; color: string; getData: (p: Persona) => Record<string, unknown> | null }> = [
  { key: '0_hard_rules', label: '硬规则', color: 'from-red-400 to-red-600', getData: (p) => p.layer_0_hard_rules },
  { key: '1_identity', label: '身份', color: 'from-blue-400 to-blue-600', getData: (p) => p.layer_1_identity },
  { key: '2_speech_style', label: '说话风格', color: 'from-green-400 to-green-600', getData: (p) => p.layer_2_speech_style },
  { key: '3_emotional_patterns', label: '情感模式', color: 'from-yellow-400 to-yellow-600', getData: (p) => p.layer_3_emotional_patterns },
  { key: '4_relationship_behavior', label: '关系行为', color: 'from-purple-400 to-purple-600', getData: (p) => p.layer_4_relationship_behavior },
  { key: '5_values', label: '价值观', color: 'from-pink-400 to-pink-600', getData: (p) => p.layer_5_values },
  { key: '6_knowledge_boundaries', label: '知识边界', color: 'from-orange-400 to-orange-600', getData: (p) => p.layer_6_knowledge_boundaries },
  { key: '7_time_anchor', label: '时间锚定', color: 'from-cyan-400 to-cyan-600', getData: (p) => p.layer_7_time_anchor },
];

export default function LayerViewer({ persona, editable, onEditLayer }: LayerViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatValue = (val: unknown): string => {
    if (Array.isArray(val)) {
      return val.join('、') || '-';
    }
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val, null, 1);
    }
    return String(val ?? '-');
  };

  return (
    <div className="space-y-2">
      {layerConfig.map(({ key, label, color, getData }) => {
        const data = getData(persona);
        const isExpanded = expanded[key];
        const hasData = data && Object.keys(data).length > 0;

        return (
          <div key={key} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${color}`} />
              <span className="flex-1 text-sm font-medium text-wechat-text">{label}</span>
              {editable && onEditLayer && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditLayer(key, data || {}); }}
                  className="p-1 text-wechat-text-secondary hover:text-wechat-green"
                >
                  <Edit3 size={14} />
                </button>
              )}
              {isExpanded ? <ChevronUp size={16} className="text-wechat-text-secondary" /> : <ChevronDown size={16} className="text-wechat-text-secondary" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-1">
                {hasData ? (
                  Object.entries(data).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="text-wechat-text-secondary shrink-0 w-20 truncate">{k}：</span>
                      <span className="text-wechat-text">{formatValue(v)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-wechat-text-secondary">暂无数据</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
