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

// Shape of the uploads endpoint response. Tolerates both the standard envelope
// ({ success, data: { urls } }) and the legacy flat shape ({ success, urls }).
interface UploadResponse {
  success?: boolean;
  urls?: string[];
  data?: { urls?: string[] };
  message?: string | { en?: string; hi?: string };
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
  const urls = json.data?.urls ?? json.urls;
  if (!response.ok || json.success === false || !urls || urls.length === 0) {
    const message =
      typeof json.message === 'string' ? json.message : 'Upload failed';
    throw new Error(message);
  }
  return urls;
}
