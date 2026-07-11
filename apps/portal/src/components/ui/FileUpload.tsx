"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { FileText, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
}

export function FileUpload({
  accept = ".pdf",
  maxSize = 5,
  onFileSelect,
  error,
  label,
  required = false,
  helperText,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function validateFile(file: File): string | null {
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Format file tidak didukung. Gunakan: ${accept.replace(/\./g, "").toUpperCase()}`;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `Ukuran file maksimal ${maxSize}MB`;
    }

    return null;
  }

  function handleFile(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }

  function handleClick() {
    inputRef.current?.click();
  }

  function handleRemove() {
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200",
          isDragging
            ? "border-primary-500 bg-primary-50"
            : selectedFile
              ? "border-green-300 bg-green-50"
              : error
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-gray-50",
        )}
      >
        {/* Hidden file input - using opacity approach instead of display:none */}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          tabIndex={-1}
        />

        {selectedFile ? (
          <div className="flex items-center justify-center gap-3 relative z-0 pointer-events-none">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 pointer-events-auto relative z-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="relative z-0 pointer-events-none">
            <Upload className="mx-auto w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {helperText || "Klik atau seret file di sini"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Format: {accept.replace(/\./g, "").toUpperCase()} (Maks. {maxSize}
              MB)
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
