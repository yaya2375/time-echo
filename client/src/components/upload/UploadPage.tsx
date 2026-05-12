import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadStore } from '../../stores/useUploadStore';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ROUTES } from '../../config/routes';
import FileDropZone from './FileDropZone';
import ParseProgress from './ParseProgress';
import DataPreview from './DataPreview';
import SelfIdentityForm from './SelfIdentityForm';
import FeatureSummary from './FeatureSummary';
import http from '../../services/http';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PeriodPicker from '../shared/PeriodPicker';

export default function UploadPage() {
  const navigate = useNavigate();
  const { processFile } = useFileUpload();
  const store = useUploadStore();
  const [generating, setGenerating] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [personaType, setPersonaType] = useState<'past_self' | 'other_person'>('past_self');

  const steps = ['选择时期', '上传文件', '确认身份', '自我画像', '开始创建'];

  const stepIndex = {
    'select-period': 0,
    upload: 1,
    preview: 2,
    identity: 3,
    generating: 4,
    done: 4,
  }[store.step];

  const handleFile = async (file: File) => {
    store.setStep('upload');
    const result = await processFile(file);
    if (result) {
      store.setStep('preview');
    }
  };

  const handleIdentitySubmit = async (data: {
    selfDescription: string;
    whatMattered: string;
    whatChanged: string;
    keyEvents: string[];
  }) => {
    store.setQuestionnaire(data);
    setGenerating(true);
    store.setStep('generating');

    try {
      // 1. Create persona
      const personaRes = await http.post('/personas', {
        name: personaName || `${store.periodStart || '某时期'}的我`,
        type: personaType,
        time_period_start: store.periodStart,
        time_period_end: store.periodEnd,
      });
      const personaId = personaRes.data.data.id;

      // 2. Submit feature vector
      await http.post('/upload/features', {
        feature_vector: store.featureVector,
        persona_id: personaId,
      });

      // 3. Trigger generation (non-blocking - fails gracefully if no API key)
      try {
        await http.post(`/personas/${personaId}/generate`, {
          feature_vector: store.featureVector,
          questionnaire: {
            self_description: data.selfDescription,
            self_tags: store.selfTags,
            key_events: data.keyEvents,
            what_mattered: data.whatMattered,
            what_changed: data.whatChanged,
          },
        });
      } catch (genErr: any) {
        console.warn('Persona generation failed (API key may be missing):', genErr.message);
        // Continue anyway - persona exists as draft with features
      }

      store.setStep('done');
      store.reset();
      navigate(`${ROUTES.CHAT}/${personaId}`);
    } catch (err: any) {
      setGenerating(false);
      store.setStep('identity');
      alert(err.response?.data?.error || '创建失败，请重试');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-6">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  i <= (stepIndex || 0)
                    ? 'bg-wechat-green text-white'
                    : 'bg-gray-200 text-wechat-text-secondary'
                }`}
              >
                {i < (stepIndex || 0) ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i <= (stepIndex || 0) ? 'text-wechat-text' : 'text-wechat-text-secondary'}`}>
                {label}
              </span>
              {i < steps.length - 1 && <div className="w-4 h-px bg-gray-300 mx-0.5" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        {store.step === 'select-period' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-sm font-medium text-wechat-text mb-3">创建什么类型的分身？</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPersonaType('past_self')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    personaType === 'past_self'
                      ? 'border-wechat-green bg-green-50'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <p className="text-lg mb-1">🧑‍💻</p>
                  <p className="text-sm font-medium">以前的自己</p>
                  <p className="text-xs text-wechat-text-secondary">只用自己的聊天记录</p>
                </button>
                <button
                  onClick={() => setPersonaType('other_person')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${
                    personaType === 'other_person'
                      ? 'border-wechat-green bg-green-50'
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <p className="text-lg mb-1">💞</p>
                  <p className="text-sm font-medium">重要的人</p>
                  <p className="text-xs text-wechat-text-secondary">需要双方聊天记录</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <label className="block text-sm font-medium text-wechat-text mb-2">分身名称</label>
              <input
                type="text"
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="例如：2023年的我、大学时期的我"
                className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-wechat-green"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <label className="block text-sm font-medium text-wechat-text mb-2">时期范围</label>
              <div className="space-y-2">
                <PeriodPicker
                  value={store.periodStart}
                  onChange={(v) => store.setPeriod(v, store.periodEnd)}
                />
                <div className="flex items-center justify-center">
                  <span className="text-xs text-wechat-text-secondary">至</span>
                </div>
                <PeriodPicker
                  value={store.periodEnd}
                  onChange={(v) => store.setPeriod(store.periodStart, v)}
                />
              </div>
            </div>

            <button
              onClick={() => store.setStep('upload')}
              className="w-full h-11 bg-wechat-green text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              下一步 <ArrowRight size={16} />
            </button>
          </div>
        )}

        {store.step === 'upload' && (
          <div className="space-y-4">
            <button onClick={() => store.setStep('select-period')} className="flex items-center gap-1 text-sm text-wechat-text-secondary">
              <ArrowLeft size={14} /> 返回
            </button>
            <FileDropZone onFile={handleFile} disabled={!!store.progress && store.progress.stage !== 'done' && store.progress.stage !== 'error'} />
            {store.progress && <ParseProgress progress={store.progress} />}
          </div>
        )}

        {store.step === 'preview' && store.selfFilter && (
          <div className="space-y-4">
            <DataPreview messages={store.messages} selfFilter={store.selfFilter} />
            {store.featureVector && <FeatureSummary featureVector={store.featureVector} />}
            <div className="flex gap-3">
              <button onClick={() => store.setStep('upload')} className="flex-1 h-11 bg-gray-100 rounded-lg text-sm font-medium">
                重新上传
              </button>
              <button onClick={() => store.setStep('identity')} className="flex-1 h-11 bg-wechat-green text-white rounded-lg text-sm font-medium">
                确认继续
              </button>
            </div>
          </div>
        )}

        {store.step === 'identity' && (
          <SelfIdentityForm
            onSubmit={handleIdentitySubmit}
            loading={generating}
          />
        )}

        {store.step === 'generating' && (
          <div className="flex flex-col items-center py-12">
            <div className="text-5xl mb-4 animate-pulse">⏳</div>
            <p className="text-base font-medium text-wechat-text mb-2">正在生成你的人格画像...</p>
            <p className="text-xs text-wechat-text-secondary">AI 正在分析你的语言特征</p>
            <p className="text-xs text-wechat-text-secondary">这可能需要 15-30 秒</p>
          </div>
        )}
      </div>
    </div>
  );
}
