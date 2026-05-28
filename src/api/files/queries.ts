import { useMutation } from '@tanstack/react-query';
import { uploadAsset } from './service';
import type { FileUploadResponse, UploadAssetType } from './types';

/**
 * React Query mutation for a single asset upload. Used by uploader UI that
 * wants progress / pending state for a standalone "Upload" button. The submit
 * flows that upload media inside a larger form usually call `uploadIfPresent`
 * directly rather than going through this hook.
 */
export function useUploadAsset() {
  return useMutation<FileUploadResponse, Error, { file: File; assetType: UploadAssetType }>({
    mutationFn: ({ file, assetType }) => uploadAsset(file, assetType)
  });
}
