import { supabase } from './supabase';
import type { HoseSubmissionData } from '../components/types';

const BUCKET_NAME = 'hose_pictures';
export const MAX_IMAGES = 2;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface PendingImage {
  file: File;
  previewUrl: string;
}

interface SubmissionResult {
  id: string;
  location: HoseSubmissionData['location'];
  condition: HoseSubmissionData['condition'];
  length: number;
  notes?: string;
  submittedBy: string;
  imageUrls: string[];
}

export async function submitHoseReport(
  data: HoseSubmissionData,
  images: PendingImage[]
): Promise<SubmissionResult> {
  const submissionId = crypto.randomUUID();
  const imageUrls: string[] = [];

  if (!data.location?.address.trim()) {
    throw new Error('Location is required');
  }

  if (images.length > MAX_IMAGES) {
    throw new Error(`Maximum ${MAX_IMAGES} photos allowed per submission`);
  }

  try {
    for (let i = 0; i < images.length; i++) {
      const { file } = images[i];

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Photo ${i + 1} is still too large after compression`);
      }

      const filename = `${i}-${sanitizeFilename(file.name)}`;
      const path = `${submissionId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicUrl } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      if (!publicUrl.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      imageUrls.push(publicUrl.publicUrl);
    }

    const { error: rpcError } = await supabase.rpc('insert_hose_submission', {
      p_id: submissionId,
      p_lat: data.location.lat,
      p_lng: data.location.lng,
      p_address: data.location.address,
      p_condition: data.condition,
      p_length_ft: data.length,
      p_notes: data.notes ?? '',
      p_submitted_by: data.submittedBy?.trim() || 'Anonymous',
      p_image_urls: imageUrls,
    });

    if (rpcError) {
      const message = rpcError.message.includes('Rate limit exceeded')
        ? 'You can submit up to 4 reports per hour. Please try again later.'
        : rpcError.message;
      throw new Error(message);
    }

    return {
      id: submissionId,
      location: data.location,
      condition: data.condition,
      length: data.length,
      notes: data.notes,
      submittedBy: data.submittedBy?.trim() || 'Anonymous',
      imageUrls,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('Unknown error during submission');
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 100);
}
