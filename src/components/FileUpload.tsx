'use client';

import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(existingFile?.base64 || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha no upload');
      }

      const result = await response.json();

      onFileUploaded(result);

      if (result.base64) {
        setPreview(result.base64);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
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
        <div className="relative rounded-lg border border-input bg-background/50 p-4">
          <div className="flex items-center gap-4">
            {preview && (
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-accent">
                <img
                  src={preview}
                  alt={existingFile?.filename || 'Preview'}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {!preview && existingFile && (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-accent">
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
              className="rounded-full p-2 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-green-500">
            <Check className="h-3 w-3" />
            <span>Arquivo carregado com sucesso</span>
          </div>
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
        className={`relative rounded-lg border-2 border-dashed p-6 transition-all duration-300 ${
          isUploading
            ? 'border-primary bg-primary/5'
            : 'border-input hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center text-center">
          {isUploading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <Icon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Arraste e solte ou <span className="text-primary">clique para selecionar</span>
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
          <p className="mt-3 text-sm text-destructive text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
