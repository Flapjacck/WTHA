import { useState } from 'react';
import type { HoseSubmissionData } from '../components/types';
import { HoseSubmissionForm } from '../components/HoseSubmissionForm';
import { SuccessModal } from '../components/SuccessModal';

export const Main: React.FC = () => {
  const [successData, setSuccessData] = useState<HoseSubmissionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: HoseSubmissionData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      console.log('Form submitted:', data);

      const submission = {
        ...data,
        id: `hose_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        submittedBy: data.submittedBy || 'Anonymous',
      };

      const existingSubmissions = JSON.parse(
        localStorage.getItem('hoseSubmissions') || '[]'
      );
      localStorage.setItem(
        'hoseSubmissions',
        JSON.stringify([...existingSubmissions, submission])
      );

      setSuccessData(data);
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
    setTimeout(() => setError(null), 5000);
  };

  return (
    <div className="page-bg min-h-screen py-8 px-4 sm:py-12">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-8 sm:mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}
          >
            Field Report
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            Where The Hose At?
          </h1>
          <p className="mt-3 text-base sm:text-lg max-w-md mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Spot a lost hose on site? Report it in a few quick steps.
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
