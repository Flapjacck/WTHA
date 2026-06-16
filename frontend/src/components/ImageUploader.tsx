import { useState, useRef } from 'react';
import type { ImageUploaderProps } from './types';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 10 * 1024 * 1024,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    setError(null);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        const err = `${file.name} is not an image`;
        setError(err);
        onError?.(err);
        return;
      }

      if (file.size > maxFileSize) {
        const err = `${file.name} is too large (max ${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`;
        setError(err);
        onError?.(err);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === Object.keys(files).length) {
            const combined = [...images, ...newImages];
            if (combined.length > maxImages) {
              const err = `Too many images (max ${maxImages})`;
              setError(err);
              onError?.(err);
              return;
            }
            onImagesChange(combined);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
          Add photos
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Upload up to {maxImages} photos of the hose. {images.length} of {maxImages} added.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`drop-zone mb-4${isDragging ? ' drop-zone--active' : ''}`}
      >
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
          style={{ background: 'var(--color-primary-muted)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <p className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
          Drag photos here
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          or click to browse your device
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--color-accent)' }}>{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image: string, index: number) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full aspect-square object-cover rounded-lg"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                aria-label={`Remove photo ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
