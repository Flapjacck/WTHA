import { useState } from 'react';
import type { HoseSubmissionData, PendingImage } from '../components/types';
import { HoseSubmissionForm } from '../components/HoseSubmissionForm';
import { SuccessModal } from '../components/SuccessModal';
import { submitHoseReport } from '../lib/submissions';

interface SuccessData {
  id: string;
  location: HoseSubmissionData['location'];
  condition: HoseSubmissionData['condition'];
  length: number;
  notes?: string;
  submittedBy: string;
}

export const Main: React.FC = () => {
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (
    data: Omit<HoseSubmissionData, 'images'> & { images: PendingImage[] }
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const { images, ...submission } = data;

      if (!submission.location?.address.trim()) {
        throw new Error('Location is required');
      }

      const result = await submitHoseReport(
        {
          location: submission.location,
          images: [],
          condition: submission.condition,
          length: submission.length,
          notes: submission.notes,
          submittedBy: submission.submittedBy,
        },
        images
      );

      setSuccessData({
        id: result.id,
        location: result.location,
        condition: result.condition,
        length: result.length,
        notes: result.notes,
        submittedBy: result.submittedBy,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit form';
      setError(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSuccessData(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="page-bg min-h-screen py-8 px-4 sm:py-12">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-8 sm:mb-10">
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            Where The Hose At?
          </h1>
          <p className="mt-3 text-base sm:text-lg max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Report your hose when you&apos;re done — nobody likes chasing loose hose.
          </p>
        </header>

        {error && (
          <div className="alert alert-error mb-6">
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        )}

        <div className="form-card">
          <HoseSubmissionForm
            key={successData ? 'reset' : 'active'}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
            onError={handleError}
            onClearError={() => setError(null)}
          />
        </div>
      </div>

      {successData && (
        <SuccessModal
          data={successData}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};
