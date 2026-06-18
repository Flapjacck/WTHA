import { useEffect, useState } from 'react';
import { AdminHeader } from '../components/AdminHeader';
import { SubmissionListItem } from '../components/SubmissionListItem';
import { fetchAllSubmissions, type HoseSubmission } from '../lib/adminSubmissions';
import { reverseGeocodeCity } from '../lib/geocoding';

export const AdminDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<HoseSubmission[]>([]);
  const [cityLabels, setCityLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllSubmissions();
        if (cancelled) return;
        setSubmissions(data);

        for (const submission of data) {
          reverseGeocodeCity(submission.lat, submission.lng).then((label) => {
            if (cancelled) return;
            setCityLabels((prev) => ({ ...prev, [submission.id]: label }));
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load submissions');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-bg admin-layout min-h-screen">
      <AdminHeader
        title="Hose Submissions"
        subtitle={`${submissions.length} total submission${submissions.length === 1 ? '' : 's'}`}
      />

      {loading && (
        <div className="form-card admin-state-card p-6 sm:p-8 text-center">
          <span className="spinner mr-2" />
          Loading submissions...
        </div>
      )}

      {error && <div className="alert alert-error mb-6">{error}</div>}

      {!loading && !error && submissions.length === 0 && (
        <div className="form-card admin-state-card p-6 sm:p-8 text-center info-box">
          No submissions yet.
        </div>
      )}

      {!loading && submissions.length > 0 && (
        <div className="admin-list space-y-3 sm:space-y-4">
          {submissions.map((submission) => (
            <SubmissionListItem
              key={submission.id}
              submission={submission}
              cityLabel={cityLabels[submission.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
};
