import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, disabled }) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const MAX_RECOMMENDED_SIZE_MB = 200;
  const totalSize = files.reduce((acc, curr) => acc + curr.file.size, 0);
  const totalSizeMB = totalSize / 1024 / 1024;
  const isOverSizeLimit = totalSizeMB > MAX_RECOMMENDED_SIZE_MB;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      const validFiles: File[] = [];
      const invalidNames: string[] = [];

      selectedFiles.forEach(file => {
        if (file.type === 'application/pdf') {
          validFiles.push(file);
        } else {
          invalidNames.push(file.name);
        }
      });

      if (invalidNames.length > 0) {
        setValidationError(`Invalid file type. Only PDFs are allowed. Skipped: ${invalidNames.slice(0, 3).join(', ')}${invalidNames.length > 3 ? '...' : ''}`);
      }

      if (validFiles.length > 0) {
        const newFiles = validFiles.map((file: File) => ({
          file,
          id: Math.random().toString(36).substring(7),
          previewUrl: URL.createObjectURL(file)
        }));

        setFiles(prev => {
          const combined = [...prev, ...newFiles];
          // Limit to 10 files
          return combined.slice(0, 10);
        });
      }
    }
    // Reset input
    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full space-y-4">
      <div className={`relative border-2 border-dashed border-slate-600 rounded-xl p-8 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-slate-800/50'}`}>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          disabled={disabled || files.length >= 10}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          data-testid="file-upload"
        />
        <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
          <Upload className="w-10 h-10 mb-2 text-blue-400" />
          <p className="text-lg font-medium text-slate-200">
            {files.length >= 10 ? 'Limit Reached (10 files)' : 'Drop PDFs here or click to upload'}
          </p>
          <p className="text-sm text-slate-500">Max 10 files. PDF only.</p>
        </div>
      </div>

      {(files.length > 0 || validationError) && (
        <div className="space-y-3">
          {/* Validation Error */}
          {validationError && (
            <div className="flex items-start p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-200 animate-fade-in">
              <AlertOctagon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Upload Failed</p>
                <p className="opacity-80">{validationError}</p>
              </div>
              <button 
                onClick={() => setValidationError(null)}
                className="ml-auto text-red-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Size Warning */}
          {isOverSizeLimit && (
            <div className="flex items-start p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg text-amber-200 animate-fade-in">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Large Total Size ({totalSizeMB.toFixed(1)} MB)</p>
                <p className="opacity-80">
                  Total size exceeds {MAX_RECOMMENDED_SIZE_MB}MB. This may result in longer processing times or API timeouts.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {files.map((fileObj, index) => (
              <div key={fileObj.id} className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg group">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500/10 rounded flex items-center justify-center text-red-500">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-200 truncate pr-2" title={fileObj.file.name}>
                      {index + 1}. {fileObj.file.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                {!disabled && (
                  <button
                    onClick={() => removeFile(fileObj.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {files.length === 0 && !validationError && (
        <div className="flex items-center p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg text-blue-200">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm">Please upload at least one PDF to begin.</p>
        </div>
      )}
    </div>
  );
};
