import { supabase } from './supabase';
import { getAdminPassword } from './adminAuth';
import type { Tables } from '../types/database';

export type HoseSubmission = Tables<'hose_submissions'>;

function requirePassword(): string {
  const password = getAdminPassword();
  if (!password) {
    throw new Error('Not authenticated');
  }
  return password;
}

export async function fetchAllSubmissions(): Promise<HoseSubmission[]> {
  const password = requirePassword();

  const { data, error } = await supabase.rpc('admin_get_submissions', {
    p_password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchSubmissionById(id: string): Promise<HoseSubmission | null> {
  const password = requirePassword();

  const { data, error } = await supabase.rpc('admin_get_submission', {
    p_id: id,
    p_password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data?.[0] ?? null;
}
