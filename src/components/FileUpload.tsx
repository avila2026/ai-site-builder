'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Sparkles, Check, Upload, Loader2 } from 'lucide-react';

export interface UploadedFile {
  url: string;
  filename: string;
  type: string;
  size: number;
  category: string;
  base64?: string;
  content?: string;
}

interface FileUploadProps {
  category: 'logo' | 'product' | 'prompt' | 'palette' | 'reference';
  label: string;
  description: string;
  accept: string;
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved: () => void;
  existingFile?: UploadedFile | null;
}

const categoryIcons: Record<string, typeof ImageIcon> = {
  logo: ImageIcon,
  product: ImageIcon,
  prompt: Sparkles,
  palette: Sparkles,
  reference: Sparkles,
};

export default function FileUpload({
  category,
  label,
  description,
  accept,
  onFileUploaded,
  onFileRemoved,
  existingFile,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(existingFile?.base64 || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simular progresso (já que a API não fornece progresso real)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha no upload');
      }

      const result = await response.json();

      setTimeout(() => {
        onFileUploaded(result);
        if (result.base64) {
          setPreview(result.base64);
        }
      }, 300); // Pequeno delay para mostrar 100% completo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onFileRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const Icon = categoryIcons[category];

  // Se já tem arquivo, mostrar preview
  if (existingFile || preview) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground/80">
          {label}
        </label>
        <div className="group relative overflow-hidden rounded-lg border border-primary/30 bg-primary/5 p-4 shadow-lg shadow-primary/5">
          <div className="flex items-center gap-4">
            {preview && (
              <div className="relative overflow-hidden rounded-lg bg-accent transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={existingFile?.filename || 'Preview'}
                  className="h-16 w-16 object-cover"
                />
              </div>
            )}
            {!preview && existingFile && (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent/50 transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {existingFile?.filename || 'Arquivo selecionado'}
              </p>
              <p className="text-xs text-muted-foreground">
                {existingFile && `${(existingFile.size / 1024).toFixed(1)} KB`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full p-2 text-destructive transition-all duration-300 hover:bg-destructive/20 hover:scale-110"
              title="Remover arquivo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
            <Check className="h-3 w-3" />
            <span>Arquivo carregado com sucesso</span>
          </div>
          {/* Brilho no hover */}
          <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground/80">
        {label}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative overflow-hidden rounded-lg border-2 border-dashed p-6 transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
            : isUploading
              ? 'border-primary/50 bg-primary/5'
              : 'border-input hover:border-primary/50 hover:bg-accent/50'
        } ${isDragOver ? 'animate-pulse' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          title="Selecione um arquivo de upload"
          aria-label="Selecione um arquivo de upload"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {/* Barra de Progresso */}
        {isUploading && (
          <div className="absolute left-0 top-0 h-1 w-full bg-primary/10">
            <div
              className="h-full bg-linear-to-r from-primary via-secondary to-accent transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <>
              <div className="relative mb-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Enviando arquivo...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {uploadProgress}% concluído
              </p>
            </>
          ) : isDragOver ? (
            <>
              <Upload className="h-10 w-10 mb-3 text-primary animate-bounce" />
              <p className="text-sm font-semibold text-primary">
                Solte o arquivo aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </>
          ) : (
            <>
              <Icon className="h-10 w-10 text-muted-foreground mb-3 transition-transform duration-300 group-hover:scale-110" />
              <p className="text-sm font-medium text-foreground">
                Arraste e solte ou <span className="text-primary font-semibold">clique para selecionar</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {accept.replace(/,/g, ' • ')}
              </p>
            </>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive text-center animate-slide-in">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
