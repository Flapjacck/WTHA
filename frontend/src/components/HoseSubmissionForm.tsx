import { useState } from 'react';
import type { Location, HoseCondition, HoseSubmissionFormProps } from './types';
import { LocationInput } from './LocationInput';
import { ImageUploader } from './ImageUploader';
import { HoseDetailsForm } from './HoseDetailsForm';

const STEPS = [
  { id: 'location' as const, label: 'Location' },
  { id: 'images' as const, label: 'Photos' },
  { id: 'details' as const, label: 'Details' },
  { id: 'review' as const, label: 'Review' },
];

type FormStep = (typeof STEPS)[number]['id'];

export const HoseSubmissionForm: React.FC<HoseSubmissionFormProps> = ({
  onSubmit,
  isLoading = false,
  onError,
}) => {
  const [step, setStep] = useState<FormStep>('location');
  const [location, setLocation] = useState<Location | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [condition, setCondition] = useState<HoseCondition>('Unknown');
  const [length, setLength] = useState(0);
  const [notes, setNotes] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [error, setError] = useState<string | null>(null);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const handleNextStep = () => {
    setError(null);

    if (step === 'location' && !location) {
      const err = 'Please provide a location';
      setError(err);
      onError?.(err);
      return;
    }

    if (step === 'images' && images.length === 0) {
      const err = 'Please upload at least one image';
      setError(err);
      onError?.(err);
      return;
    }

    if (currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!location || images.length === 0 || !submittedBy.trim()) {
      const err = 'Please complete all required fields';
      setError(err);
      onError?.(err);
      return;
    }

    try {
      await onSubmit({
        location,
        images,
        condition,
        length,
        notes,
        submittedBy,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Submission failed';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  return (
    <div className="w-full">
      <div className="form-card-header">
        <h2 className="text-xl sm:text-2xl font-bold">Report Lost Hose</h2>
        <p className="mt-1 text-sm opacity-80">
          Step {currentStepIndex + 1} of {STEPS.length} — {STEPS[currentStepIndex].label}
        </p>
      </div>

      <div className="px-6 sm:px-8 pt-6 pb-2">
        <nav className="stepper mb-8" aria-label="Form progress">
          {STEPS.map((s, i) => {
            const isActive = i === currentStepIndex;
            const isDone = i < currentStepIndex;
            return (
              <div
                key={s.id}
                className={`step-item${isActive ? ' step-item--active' : ''}${isDone ? ' step-item--done' : ''}`}
              >
                <div className="step-circle" aria-hidden="true">
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="step-label">{s.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="min-h-[280px]">
          {step === 'location' && (
            <LocationInput
              value={location}
              onChange={setLocation}
              onError={setError}
            />
          )}

          {step === 'images' && (
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              onError={setError}
            />
          )}

          {step === 'details' && (
            <HoseDetailsForm
              condition={condition}
              length={length}
              notes={notes}
              onChange={({ condition: c, length: l, notes: n }) => {
                setCondition(c);
                setLength(l);
                setNotes(n);
              }}
              onError={setError}
            />
          )}

          {step === 'review' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-primary)' }}>
                  Review your report
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Check everything looks right before submitting.
                </p>
              </div>

              <div className="space-y-3">
                <div className="review-card">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-primary)' }}>
                    Location
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>{location?.address}</p>
                </div>

                <div className="review-card">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-primary)' }}>
                    Photos
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>{images.length} photo{images.length !== 1 ? 's' : ''} attached</p>
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Preview ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-md shrink-0"
                          style={{ border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="review-card">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--color-primary)' }}>
                    Hose details
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {length > 0 ? `${length} ft · ` : ''}{condition} condition
                    {notes && <span className="block mt-1 opacity-75">{notes}</span>}
                  </p>
                </div>

                <div>
                  <label className="form-label" htmlFor="submitted-by">
                    Your name or site ID <span style={{ color: 'var(--color-accent)' }}>*</span>
                  </label>
                  <input
                    id="submitted-by"
                    type="text"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    placeholder="e.g. John Smith or Site #5"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mt-4">{error}</div>
        )}
      </div>

      <div
        className="flex gap-3 px-6 sm:px-8 py-5 mt-2"
        style={{ borderTop: '1px solid var(--color-border)', background: '#fafbfc' }}
      >
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
          className="btn btn-outline flex-1"
        >
          Back
        </button>

        {step === 'review' ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !submittedBy.trim()}
            className="btn btn-success flex-1"
          >
            {isLoading ? 'Submitting…' : 'Submit report'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isLoading}
            className="btn btn-primary flex-1"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};
