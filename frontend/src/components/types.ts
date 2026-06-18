export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export type HoseCondition = 'Good' | 'Fair' | 'Poor' | 'Unknown';

export interface PendingImage {
  file: File;
  previewUrl: string;
}

export interface HoseSubmissionData {
  location: Location;
  images: string[];
  condition: HoseCondition;
  length: number;
  notes?: string;
  submittedBy?: string;
  id?: string;
}

export interface HoseSubmissionFormProps {
  onSubmit: (data: Omit<HoseSubmissionData, 'images'> & { images: PendingImage[] }) => void | Promise<void>;
  isLoading?: boolean;
  onError?: (error: string) => void;
  onClearError?: () => void;
}

export interface LocationInputProps {
  value: Location | null;
  onChange: (location: Location) => void;
  onError?: (error: string) => void;
  onGeocodingChange?: (isGeocoding: boolean) => void;
  placeholder?: string;
}

export interface ImageUploaderProps {
  images: PendingImage[];
  onImagesChange: (images: PendingImage[]) => void;
  maxImages?: number;
  onError?: (error: string) => void;
}

export interface HoseDetailsFormProps {
  condition: HoseCondition;
  length: number;
  notes: string;
  onChange: (details: { condition: HoseCondition; length: number; notes: string }) => void;
  onError?: (error: string) => void;
}
