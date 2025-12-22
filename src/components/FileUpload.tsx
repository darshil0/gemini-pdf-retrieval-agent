// src/components/FileUpload.tsx
import React, { useCallback, useState } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 200;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf"];

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

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  uploadedFiles,
  onRemoveFile,
  isProcessing = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<FileValidationError[]>([]);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: FileValidationError[] } => {
      const validFiles: File[] = [];
      const validationErrors: FileValidationError[] = [];

      files.forEach((file) => {
        // Check file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          validationErrors.push({
            file: file.name,
            error: "Only PDF files are allowed",
          });
          return;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          validationErrors.push({
            file: file.name,
            error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
          });
          return;
        }

        // Check for duplicates
        if (
          uploadedFiles.some(
            (f) => f.name === file.name && f.size === file.size,
          )
        ) {
          validationErrors.push({
            file: file.name,
            error: "File already uploaded",
          });
          return;
        }

        validFiles.push(file);
      });

      return { valid: validFiles, errors: validationErrors };
    },
    [uploadedFiles],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const totalFiles = uploadedFiles.length + fileArray.length;

      // Check 10-file limit
      if (totalFiles > MAX_FILES) {
        setErrors([
          {
            file: "System",
            error: `Cannot upload more than ${MAX_FILES} files. Currently have ${uploadedFiles.length} file(s). Attempting to add ${fileArray.length} more.`,
          },
        ]);
        return;
      }

      const { valid, errors: validationErrors } = validateFiles(fileArray);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        setErrors([]);
      }

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [uploadedFiles, onFilesSelected, validateFiles],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      handleFiles(e.target.files);
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
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-200">{error.file}</p>
                <p className="text-xs text-red-300">{error.error}</p>
              </div>
              <button
                onClick={() => setErrors(errors.filter((_, i) => i !== index))}
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
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-700 hover:border-slate-600"
        } ${isProcessing || uploadedFiles.length >= MAX_FILES ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
        <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-lg font-medium text-slate-200 mb-2">
          {uploadedFiles.length >= MAX_FILES
            ? "Maximum files reached"
            : "Drop PDF files here or click to browse"}
        </p>
        <p className="text-sm text-slate-500">
          {uploadedFiles.length >= MAX_FILES
            ? "Remove files to upload more"
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
