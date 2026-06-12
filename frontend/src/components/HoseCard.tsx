import { useState } from 'react';
import type { HoseCardProps } from './types';

export const HoseCard: React.FC<HoseCardProps> = ({ hose, onEdit, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? hose.images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === hose.images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this hose report?')) {
      onDelete?.(hose.id);
    }
  };

  const formattedDate = new Date(hose.submittedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const conditionColor: { [key in typeof hose.condition]: string } = {
    Good: '#10b981',
    Fair: '#f59e0b',
    Poor: '#ef4444',
    Unknown: '#6b7280',
  };

  return (
    <div
      className="border-2 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
      style={{ borderColor: '#e5e7eb' }}
    >
      {/* Image Carousel */}
      {hose.images.length > 0 && (
        <div className="relative bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
          <img
            src={hose.images[currentImageIndex]}
            alt={`Hose ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Carousel Controls */}
          {hose.images.length > 1 && (
            <>
              <button
                onClick={goToPrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 text-lg"
              >
                ‹
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 text-lg"
              >
                ›
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1} / {hose.images.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 font-semibold uppercase">📍 Location</p>
          <p className="text-sm font-semibold" style={{ color: '#06445b' }}>
            {hose.location.address}
          </p>
          <p className="text-xs text-gray-500">
            {hose.location.lat.toFixed(4)}, {hose.location.lng.toFixed(4)}
          </p>
        </div>

        {/* Hose Details */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Length</p>
            <p className="text-lg font-bold" style={{ color: '#06445b' }}>
              {hose.length} ft
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Condition</p>
            <p
              className="text-lg font-bold text-white rounded px-2 py-1 text-center"
              style={{ backgroundColor: conditionColor[hose.condition] }}
            >
              {hose.condition}
            </p>
          </div>
        </div>

        {/* Notes */}
        {hose.notes && (
          <div className="mb-3 p-2 bg-gray-50 rounded border-l-2" style={{ borderColor: '#fbb12a' }}>
            <p className="text-xs text-gray-500 font-semibold uppercase">Notes</p>
            <p className="text-sm text-gray-700">{hose.notes}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-500 mb-4 pb-4 border-b-2 border-gray-200">
          <p>Reported by: <span className="font-semibold">{hose.submittedBy}</span></p>
          <p>Date: {formattedDate}</p>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(hose.id)}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded text-white transition hover:opacity-90"
                style={{ backgroundColor: '#06445b' }}
              >
                ✎ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex-1 px-3 py-2 text-sm font-semibold rounded text-white bg-red-500 transition hover:bg-red-600"
              >
                🗑 Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
