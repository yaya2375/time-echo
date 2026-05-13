import { useState, useCallback, DragEvent } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileDropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropZone({ onFile, disabled }: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile, disabled]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver
          ? 'border-wechat-green bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        type="file"
        accept=".txt,.csv,.html,.htm,.json,.jpg,.jpeg,.png,.gif,.webp,.zip"
        onChange={handleChange}
        className="hidden"
        id="file-input"
        disabled={disabled}
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <Upload className="w-10 h-10 text-wechat-text-secondary mx-auto mb-3" />
        <p className="text-sm text-wechat-text font-medium mb-1">点击上传或拖拽文件到此处</p>
        <p className="text-xs text-wechat-text-secondary">
          支持 WeChatMsg / 留痕 导出的聊天记录
        </p>
        <p className="text-xs text-wechat-text-secondary mt-1">
          .txt .csv .html .json .zip .jpg .png
        </p>
        <div className="mt-3 inline-flex items-center gap-1 text-xs text-wechat-green bg-green-50 px-2 py-1 rounded">
          <FileText size={12} />
          文件在本地解析，原始内容不上传
        </div>
      </label>
    </div>
  );
}
