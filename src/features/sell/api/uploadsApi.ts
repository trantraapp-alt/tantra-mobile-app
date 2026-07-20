// Step 1 of listing creation: upload image files and get back their URLs.
// Uses fetch so the platform sets the multipart boundary (Content-Type is not
// set manually, per the API contract).
import { endpoints, env } from '@/config';
import { tokenStore } from '@/lib';

// A local image file to upload.
export interface UploadableFile {
  // Local file URI from the image picker.
  uri: string;
  // File name sent to the server.
  name: string;
  // MIME type, e.g. "image/jpeg".
  type: string;
}

// Shape of the uploads endpoint response.
interface UploadResponse {
  success?: boolean;
  urls?: string[];
  message?: string;
}

// Uploads files under the field name "files" and returns their relative URLs.
export async function uploadImages(files: UploadableFile[]): Promise<string[]> {
  const body = new FormData();
  for (const file of files) {
    body.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob);
  }

  const token = tokenStore.getAccessToken();
  const response = await fetch(
    `${env.apiBaseUrl}${endpoints.listings.uploads}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    },
  );

  const json = (await response.json()) as UploadResponse;
  if (!response.ok || !json.success || !json.urls) {
    throw new Error(json.message ?? 'Upload failed');
  }
  return json.urls;
}
