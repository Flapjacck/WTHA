import type { HoseSubmissionData } from './types';

interface SuccessModalProps {
  data: HoseSubmissionData;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(6, 68, 91, 0.2)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-2xl max-w-md w-full p-8"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        role="dialog"
        aria-labelledby="success-title"
      >
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}
          >
            ✓
          </div>
        </div>

        <h2
          id="success-title"
          className="text-2xl font-bold text-center mb-2"
          style={{ color: 'var(--color-primary)' }}
        >
          Submitted!
        </h2>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Your hose report has been successfully submitted.
        </p>

        <div className="info-box mb-6 space-y-3">
          <div className="flex justify-between gap-4">
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Location</span>
            <span className="text-right">{data.location.address}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Condition</span>
            <span>{data.condition}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Length</span>
            <span>{data.length} ft</span>
          </div>
          {data.images.length > 0 && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Photos</span>
              <span>{data.images.length} uploaded</span>
            </div>
          )}
          {data.notes && (
            <div className="flex justify-between gap-4">
              <span className="font-semibold shrink-0" style={{ color: 'var(--color-primary)' }}>Notes</span>
              <span className="text-right line-clamp-2">{data.notes}</span>
            </div>
          )}
        </div>

        <button type="button" onClick={onClose} className="btn btn-secondary w-full">
          Submit another report
        </button>
      </div>
    </div>
  );
};
