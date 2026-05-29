// Mirrors UploadAssetType enum on the BE — keep in sync.
export const UPLOAD_ASSET_TYPES = [
  'TEACHER_AVATAR',
  'COURSE_COVER',
  'COURSE_INTRO_VIDEO',
  'BLOG_COVER'
] as const;
export type UploadAssetType = (typeof UPLOAD_ASSET_TYPES)[number];

// URL path segment for each business asset type. Mirrors the controller routes.
export const UPLOAD_ASSET_PATH: Record<UploadAssetType, string> = {
  TEACHER_AVATAR: 'teacher-avatar',
  COURSE_COVER: 'course-cover',
  COURSE_INTRO_VIDEO: 'course-intro-video',
  BLOG_COVER: 'blog-cover'
};

export type StorageType = 'LOCAL' | 'CLOUDINARY' | 'S3' | 'AZURE' | 'GOOGLE_CLOUD';

export type FileUploadResponse = {
  id: number;
  originalName: string;
  storedName: string;
  fileSize: number;
  contentType: string;
  storageType: StorageType;
  accessUrl: string;
  message: string;
};
