// src/components/FileUpload.tsx
import { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { SecurityService } from '@core/services/securityService';

const MAX_FILES = parseInt(import.meta.env.VITE_MAX_FILES || '10');
const MAX_FILE_SIZE_BYTES = parseInt(
  import.meta.env.VITE_MAX_FILE_SIZE || '209715200',
);
const MAX_FILE_SIZE_MB = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));
const ALLOWED_MIME_TYPES = ['application/pdf'];

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  isProcessing?: boolean;
}

interface FileValidationError {
  id: string;
  file: string;
  error: string;
}

export const FileUpload = ({
  onFilesSelected,
  uploadedFiles,
  onRemoveFile,
  isProcessing = false,
}: FileUploadProps): React.ReactElement => {
  const [dragActive, setDragActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<FileValidationError[]>([]);

  const validateFiles = useCallback(
    async (
      files: File[],
    ): Promise<{ valid: File[]; errors: FileValidationError[] }> => {
      const validFiles: File[] = [];
      const validationErrors: FileValidationError[] = [];

      for (const file of files) {
        // Check file type (MIME)
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          validationErrors.push({
            id: `${file.name}-type-${Date.now()}`,
            file: file.name,
            error: 'Only PDF files are allowed (detected by MIME)',
          });
          continue;
        }

        // Deep check: %PDF magic bytes
        const hasCorrectMagicBytes =
          await SecurityService.validateFileType(file);
        if (!hasCorrectMagicBytes) {
          validationErrors.push({
            id: `${file.name}-magic-${Date.now()}`,
            file: file.name,
            error: 'Invalid PDF content (magic bytes mismatch)',
          });
          continue;
        }

        // Check file size
        if (!SecurityService.validateFileSize(file)) {
          validationErrors.push({
            id: `${file.name}-size-${Date.now()}`,
            file: file.name,
            error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
          });
          continue;
        }

        // Check for duplicates
        if (
          uploadedFiles.some(
            (f) => f.name === file.name && f.size === file.size,
          )
        ) {
          validationErrors.push({
            id: `${file.name}-dup-${Date.now()}`,
            file: file.name,
            error: 'File already uploaded',
          });
          continue;
        }

        validFiles.push(file);
      }

      return { valid: validFiles, errors: validationErrors };
    },
    [uploadedFiles],
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const totalFiles = uploadedFiles.length + fileArray.length;

      // Check 10-file limit
      if (totalFiles > MAX_FILES) {
        setErrors([
          {
            id: `system-limit-${Date.now()}`,
            file: 'System',
            error: `Cannot upload more than ${MAX_FILES} files. Currently have ${uploadedFiles.length} file(s). Attempting to add ${fileArray.length} more.`,
          },
        ]);
        return;
      }

      setIsValidating(true);
      try {
        const { valid, errors: validationErrors } =
          await validateFiles(fileArray);

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
        } else {
          setErrors([]);
        }

        if (valid.length > 0) {
          onFilesSelected(valid);
        }
      } finally {
        setIsValidating(false);
      }
    },
    [uploadedFiles, onFilesSelected, validateFiles],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      void handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      void handleFiles(e.target.files);
    },
    [handleFiles],
  );

  const remainingSlots = MAX_FILES - uploadedFiles.length;

  return (
    <div className="w-full space-y-4">
      {/* File Counter */}
      <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
        <span className="text-sm font-medium text-blue-200">
          Files: {uploadedFiles.length} / {MAX_FILES}
        </span>
        {remainingSlots > 0 && (
          <span className="text-xs text-blue-400">
            {remainingSlots} slot(s) remaining
          </span>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error) => (
            <div
              key={error.id}
              className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{error.file}</p>
                <p className="text-xs text-red-300">{error.error}</p>
              </div>
              <button
                onClick={() =>
                  setErrors(errors.filter((e) => e.id !== error.id))
                }
                className="text-red-400 hover:text-red-300"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-700 hover:border-slate-600'
        } ${isProcessing || uploadedFiles.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleChange}
          disabled={isProcessing || uploadedFiles.length >= MAX_FILES}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload PDF files"
        />
        {isValidating ? (
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
        ) : (
          <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        )}
        <p className="text-lg font-medium text-slate-200 mb-2">
          {uploadedFiles.length >= MAX_FILES
            ? 'Maximum files reached'
            : 'Drop PDF files here or click to browse'}
        </p>
        <p className="text-sm text-slate-500">
          {uploadedFiles.length >= MAX_FILES
            ? 'Remove files to upload more'
            : `Upload up to ${remainingSlots} more PDF file(s) (max ${MAX_FILE_SIZE_MB}MB each)`}
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(index)}
                  disabled={isProcessing}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
