// src/components/FileUpload.tsx
import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf'];

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  isProcessing?: boolean;
}

interface FileValidationError {
  file: string;
  error: string;
}

export const FileUpload: React.Component<FileUploadProps> = ({
  onFilesSelected,
  uploadedFiles,
  onRemoveFile,
  isProcessing = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<FileValidationError[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];
    const validationErrors: FileValidationError[] = [];

    files.forEach(file => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        validationErrors.push({ file: file.name, error: 'Only PDF files are allowed' });
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        validationErrors.push({ file: file.name, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` });
        return;
      }
      if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
        validationErrors.push({ file: file.name, error: 'File already uploaded' });
        return;
      }
      validFiles.push(file);
    });

    return { valid: validFiles, errors: validationErrors };
  }, [uploadedFiles]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const totalFiles = uploadedFiles.length + fileArray.length;

    if (totalFiles > MAX_FILES) {
      setErrors([{
        file: 'System',
        error: `Cannot upload more than ${MAX_FILES} files. Currently have ${uploadedFiles.length} file(s).`
      }]);
      return;
    }

    const { valid, errors: validationErrors } = validateFiles(fileArray);
    
    setErrors(validationErrors);

    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  }, [uploadedFiles.length, validateFiles, onFilesSelected]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const remainingSlots = MAX_FILES - uploadedFiles.length;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-sm font-medium text-blue-900">
          Files: {uploadedFiles.length} / {MAX_FILES}
        </span>
        {remainingSlots > 0 && (
          <span className="text-xs text-blue-700">{remainingSlots} slot(s) remaining</span>
        )}
      </div>

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error.file}</p>
                <p className="text-xs text-red-700">{error.error}</p>
              </div>
              <button
                onClick={() => setErrors(currentErrors => currentErrors.filter((_, i) => i !== index))}
                className="ml-auto text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing || uploadedFiles.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        aria-disabled={isProcessing || uploadedFiles.length >= MAX_FILES}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={handleChange}
          disabled={isProcessing || uploadedFiles.length >= MAX_FILES}
          className="sr-only"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {uploadedFiles.length >= MAX_FILES
            ? 'Maximum files reached'
            : 'Drop PDF files here or click to browse'}
        </p>
        <p className="text-sm text-gray-500">
          {uploadedFiles.length >= MAX_FILES
            ? 'Remove files to upload more'
            : `Upload up to ${remainingSlots} more PDF file(s) (max ${MAX_FILE_SIZE_MB}MB each)`}
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
          {uploadedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(index)}
                disabled={isProcessing}
                className="p-1 text-gray-400 hover:text-red-600 rounded disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};