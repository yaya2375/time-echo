import { useCallback, useRef } from 'react';
import { useUploadStore } from '../stores/useUploadStore';
import { parseChatFile } from '../parser/wechat-parser';
import { extractFeatures } from '../parser/feature-extractor';
import type { FeatureVector } from '@time-echo/shared';

export function useFileUpload() {
  const { setFile, setMessages, setSelfFilter, setFeatureVector, setProgress } = useUploadStore();
  const abortRef = useRef(false);

  const processFile = useCallback(
    async (file: File) => {
      abortRef.current = false;
      setFile(file);

      try {
        const { result, selfFilter } = await parseChatFile(file, {}, (p) => {
          if (!abortRef.current) setProgress(p);
        });

        if (abortRef.current) return null;

        setMessages(result.messages);
        setSelfFilter(selfFilter);

        // Extract features from self messages
        const fv: FeatureVector = extractFeatures(selfFilter.selfMessages, result.messages);
        setFeatureVector(fv);

        setProgress({ stage: 'done', progress: 100, message: '解析完成' });
        return { result, selfFilter, featureVector: fv };
      } catch (err: any) {
        setProgress({ stage: 'error', progress: 0, error: err.message || '解析失败' });
        return null;
      }
    },
    [setFile, setMessages, setSelfFilter, setFeatureVector, setProgress]
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { processFile, abort };
}
