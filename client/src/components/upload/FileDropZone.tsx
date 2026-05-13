import { useState, useCallback, DragEvent } from 'react';
import { Upload, FileText, X, Image, Archive } from 'lucide-react';
import type { UploadedFile } from '../../stores/useUploadStore';

interface FileDropZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
  uploadedFiles?: UploadedFile[];
  onRemove?: (index: number) => void;
}

function fileIcon(name: string) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return <Image size={14} />;
  if (ext === '.zip') return <Archive size={14} />;
  return <FileText size={14} />;
}

export default function FileDropZone({ onFile, disabled, uploadedFiles = [], onRemove }: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const fileList = e.dataTransfer.files;
      for (let i = 0; i < fileList.length; i++) {
        onFile(fileList[i]);
      }
    },
    [onFile, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      const fileList = e.target.files;
      if (fileList) {
        for (let i = 0; i < fileList.length; i++) {
          onFile(fileList[i]);
        }
      }
      e.target.value = '';
    },
    [onFile, disabled]
  );

  return (
    <div className="space-y-3">
      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-xs font-medium text-wechat-text mb-2">
            已添加 {uploadedFiles.length} 个文件
          </p>
          <div className="space-y-1.5">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-wechat-text-secondary">{fileIcon(f.name)}</span>
                <span className="flex-1 truncate text-wechat-text text-xs">{f.name}</span>
                <span className="text-xs text-wechat-text-secondary shrink-0">{f.messageCount} 条</span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver
            ? 'border-wechat-green bg-green-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept=".txt,.csv,.html,.htm,.json,.jpg,.jpeg,.png,.gif,.webp,.zip"
          multiple
          onChange={handleChange}
          className="hidden"
          id="file-input"
          disabled={disabled}
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <Upload className="w-10 h-10 text-wechat-text-secondary mx-auto mb-3" />
          <p className="text-sm text-wechat-text font-medium mb-1">
            {uploadedFiles.length > 0 ? '继续添加文件' : '点击上传或拖拽文件到此处'}
          </p>
          <p className="text-xs text-wechat-text-secondary">
            支持 WeChatMsg / 留痕 导出的聊天记录
          </p>
          <p className="text-xs text-wechat-text-secondary mt-1">
            .txt .csv .html .json .zip .jpg .png（可多选）
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-xs text-wechat-green bg-green-50 px-2 py-1 rounded">
            <FileText size={12} />
            文件在本地解析，原始内容不上传
          </div>
        </label>
      </div>
    </div>
  );
}
