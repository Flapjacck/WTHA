const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

export async function compressImageToMaxSize(
  file: File,
  maxBytes: number = MAX_OUTPUT_BYTES
): Promise<File> {
  if (file.size <= maxBytes) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;

  const maxDimension = 4096;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process image');
  }

  let quality = 0.92;

  while (quality >= 0.1) {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= maxBytes) {
      bitmap.close();
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    }

    quality -= 0.08;
  }

  while (width > 320 && height > 320) {
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, 0.85);
    if (blob.size <= maxBytes) {
      bitmap.close();
      const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
      return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
    }
  }

  bitmap.close();
  throw new Error(`Could not compress ${file.name} below 10MB. Try a smaller photo.`);
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to compress image'))),
      'image/jpeg',
      quality
    );
  });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
