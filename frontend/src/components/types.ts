export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export type HoseCondition = 'Good' | 'Fair' | 'Poor' | 'Unknown';

export interface HoseSubmissionData {
  location: Location;
  images: string[];
  condition: HoseCondition;
  length: number;
  notes?: string;
  submittedBy?: string;
}

export interface HoseSubmissionFormProps {
  onSubmit: (data: HoseSubmissionData) => void | Promise<void>;
  isLoading?: boolean;
  onError?: (error: string) => void;
}

export interface LocationInputProps {
  value: Location | null;
  onChange: (location: Location) => void;
  onError?: (error: string) => void;
  placeholder?: string;
}

export interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number;
  onError?: (error: string) => void;
}

export interface HoseDetailsFormProps {
  condition: HoseCondition;
  length: number;
  notes: string;
  onChange: (details: { condition: HoseCondition; length: number; notes: string }) => void;
  onError?: (error: string) => void;
}
