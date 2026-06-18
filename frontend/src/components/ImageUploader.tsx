import { useState, useRef } from 'react';
import type { ImageUploaderProps, PendingImage } from './types';
import { compressImageToMaxSize, readFileAsDataUrl } from '../lib/compressImage';
import { MAX_FILE_SIZE } from '../lib/submissions';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 2,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || isProcessing) return;

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      onError?.(`Maximum ${maxImages} photos allowed`);
      return;
    }

    const fileArray = Array.from(files).slice(0, remaining);
    setIsProcessing(true);

    try {
      const newImages: PendingImage[] = [];

      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          onError?.(`${file.name} is not an image`);
          return;
        }

        const compressed = await compressImageToMaxSize(file, MAX_FILE_SIZE);
        const previewUrl = await readFileAsDataUrl(compressed);
        newImages.push({ file: compressed, previewUrl });
      }

      onImagesChange([...images, ...newImages]);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
          Add photos{' '}
          <span className="font-normal text-base" style={{ color: 'var(--color-text-muted)' }}>
            (optional)
          </span>
        </h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Upload up to {maxImages} photos (max 10MB each). Large photos are automatically resized.{' '}
          {images.length} of {maxImages} added. You can skip this step if you have no photos.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isProcessing) fileInputRef.current?.click();
          }
        }}
        className={`drop-zone mb-4${isDragging ? ' drop-zone--active' : ''}${isProcessing ? ' opacity-60 pointer-events-none' : ''}`}
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
          {isProcessing ? 'Processing photos…' : 'Drag photos here'}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {isProcessing ? 'Resizing if needed' : 'or click to browse your device'}
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

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {images.map((item: PendingImage, index: number) => (
            <div key={index} className="relative group">
              <img
                src={item.previewUrl}
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
