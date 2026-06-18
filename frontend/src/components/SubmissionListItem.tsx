import { useNavigate } from 'react-router-dom';
import type { HoseSubmission } from '../lib/adminSubmissions';
import { CopyableField } from './CopyableField';

interface SubmissionListItemProps {
  submission: HoseSubmission;
  cityLabel: string | null;
}

const conditionClass: Record<string, string> = {
  Good: 'condition-badge--good',
  Fair: 'condition-badge--fair',
  Poor: 'condition-badge--poor',
  Unknown: 'condition-badge--unknown',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export const SubmissionListItem: React.FC<SubmissionListItemProps> = ({
  submission,
  cityLabel,
}) => {
  const navigate = useNavigate();
  const coords = formatCoords(submission.lat, submission.lng);

  const handleClick = () => {
    navigate(`/admin/submissions/${submission.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className="submission-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View submission in ${cityLabel ?? 'unknown location'}`}
    >
      <div className="submission-card__header">
        <h2 className="submission-card__title">
          {cityLabel ?? (
            <span className="inline-flex items-center gap-2">
              <span className="spinner" />
              Resolving location...
            </span>
          )}
        </h2>
        <svg
          className="submission-card__chevron"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>

      <div className="submission-card__meta">
        <span className={`condition-badge ${conditionClass[submission.condition] ?? 'condition-badge--unknown'}`}>
          {submission.condition}
        </span>
        <span className="submission-card__detail">{submission.length_ft} ft</span>
        <span className="submission-card__detail">{formatDate(submission.submitted_at)}</span>
      </div>

      <p className="submission-card__address">{submission.address}</p>

      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="submission-card__copy">
        <CopyableField value={coords} label="Copy coordinates" />
      </div>
    </article>
  );
};
