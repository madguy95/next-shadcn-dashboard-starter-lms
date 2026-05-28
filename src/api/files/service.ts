import { apiClient } from '@/lib/api-client';
import { UPLOAD_ASSET_PATH, type FileUploadResponse, type UploadAssetType } from './types';

/**
 * Upload a single file to its business-typed endpoint on the BE.
 *
 * The BE applies its own size + content-type validation per asset type:
 *   - TEACHER_AVATAR: jpg/jpeg/png/webp, max 5MB
 *   - COURSE_COVER: jpg/jpeg/png/webp, max 10MB
 *   - COURSE_INTRO_VIDEO: mp4/mov/webm/mkv, max 200MB
 *
 * apiClient skips the Content-Type header automatically when the body is FormData,
 * so the multipart boundary is set correctly by the browser.
 */
export async function uploadAsset(
  file: File,
  assetType: UploadAssetType
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient<FileUploadResponse>(`/api/files/upload/${UPLOAD_ASSET_PATH[assetType]}`, {
    method: 'POST',
    body: formData
  });
}

/**
 * Convenience helper: if a File is provided, upload it and return the access URL;
 * otherwise return undefined so callers can spread the result into request bodies
 * without conditionals. Used by teacher / course form submit flows that upload
 * media before persisting the entity.
 */
export async function uploadIfPresent(
  file: File | undefined,
  assetType: UploadAssetType
): Promise<string | undefined> {
  if (!file) return undefined;
  const res = await uploadAsset(file, assetType);
  return res.accessUrl;
}
