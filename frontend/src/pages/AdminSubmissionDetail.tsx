import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminHeader } from '../components/AdminHeader';
import { SubmissionDetailView } from '../components/SubmissionDetailView';
import { fetchSubmissionById, type HoseSubmission } from '../lib/adminSubmissions';

export const AdminSubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<HoseSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Submission not found');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSubmissionById(id!);
        if (cancelled) return;

        if (!data) {
          setError('Submission not found');
        } else {
          setSubmission(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load submission');
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
  }, [id]);

  return (
    <div className="page-bg admin-layout min-h-screen">
      <AdminHeader title="Submission Details" />

      {loading && (
        <div className="form-card admin-state-card p-6 sm:p-8 text-center">
          <span className="spinner mr-2" />
          Loading submission...
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && submission && <SubmissionDetailView submission={submission} />}
    </div>
  );
};
