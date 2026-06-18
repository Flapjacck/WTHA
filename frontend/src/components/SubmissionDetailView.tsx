import { Link } from 'react-router-dom';
import type { HoseSubmission } from '../lib/adminSubmissions';
import { StaticMapPreview } from './MapDisplay';
import { CopyableField } from './CopyableField';

interface SubmissionDetailViewProps {
  submission: HoseSubmission;
}

const conditionClass: Record<string, string> = {
  Good: 'condition-badge--good',
  Fair: 'condition-badge--fair',
  Poor: 'condition-badge--poor',
  Unknown: 'condition-badge--unknown',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({ submission }) => {
  const coords = `${submission.lat.toFixed(5)}, ${submission.lng.toFixed(5)}`;

  return (
    <div className="admin-detail space-y-4 sm:space-y-6">
      <Link to="/admin/dashboard" className="admin-detail__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to all submissions
      </Link>

      <div className="form-card admin-detail__card">
        <div className="admin-detail__body space-y-5 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`condition-badge ${conditionClass[submission.condition] ?? 'condition-badge--unknown'}`}>
              {submission.condition}
            </span>
            {submission.picked_up && (
              <span className="condition-badge condition-badge--good">Picked up</span>
            )}
          </div>

          <div className="review-card space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
              Location
            </p>
            <p className="text-sm">{submission.address}</p>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Coordinates
              </p>
              <CopyableField value={coords} label="Copy coordinates" />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Latitude
              </p>
              <CopyableField value={String(submission.lat)} label="Copy latitude" />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Longitude
              </p>
              <CopyableField value={String(submission.lng)} label="Copy longitude" />
            </div>
            <div className="admin-detail__map">
              <StaticMapPreview
                location={{
                  lat: submission.lat,
                  lng: submission.lng,
                  address: submission.address,
                }}
                height="300px"
              />
            </div>
          </div>

          <div className="review-card space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
              Hose details
            </p>
            <p className="text-sm">
              <strong>Length:</strong> {submission.length_ft} ft
            </p>
            {submission.notes && (
              <p className="text-sm">
                <strong>Notes:</strong> {submission.notes}
              </p>
            )}
          </div>

          {submission.image_urls.length > 0 && (
            <div className="review-card space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
                Photos
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {submission.image_urls.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt="Hose submission"
                      className="w-full h-48 object-cover rounded-lg border"
                      style={{ borderColor: 'var(--color-border)' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="review-card space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
              Metadata
            </p>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Submission ID
              </p>
              <CopyableField value={submission.id} label="Copy submission ID" />
            </div>
            <p className="text-sm">
              <strong>Submitted by:</strong> {submission.submitted_by}
            </p>
            <p className="text-sm">
              <strong>Submitted at:</strong> {formatDateTime(submission.submitted_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
