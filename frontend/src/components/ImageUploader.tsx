import { useState, useRef } from 'react';
import type { ImageUploaderProps } from './types';

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
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

      // Create preview URL
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
    <div className="w-full max-w-lg mx-auto">
      <label className="block text-lg font-semibold mb-3" style={{ color: '#06445b' }}>
        Upload Photos of Hose
      </label>
      <p className="text-sm text-gray-600 mb-4">
        {images.length} / {maxImages} images uploaded
      </p>

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition mb-4"
        style={{
          borderColor: isDragging ? '#fbb12a' : '#ccc',
          backgroundColor: isDragging ? '#fef3c7' : '#f9fafb',
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-lg font-semibold mb-2">📸 Drag images here</p>
        <p className="text-sm text-gray-600">or click to browse</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {error && <p className="text-sm mb-4" style={{ color: '#ff6b35' }}>{error}</p>}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image: string, index: number) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
