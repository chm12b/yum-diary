export {
  DEFAULT_IMAGE_EXTENSION,
  STORAGE_FOLDERS,
  diaryPhotoPath,
  menuFolder,
  menuPhotoPath,
  padPhotoIndex,
  recordFolder,
  restaurantCoverPath,
  restaurantFolder,
  restaurantPhotoPath,
} from "./file-name";
export type { StorageFolder } from "./file-name";
export {
  assertImageFile,
  getImageDimensions,
  isImageFile,
} from "./image";
export {
  COMPRESS_IMAGE_MAX_EDGE_PX,
  COMPRESS_IMAGE_WEBP_QUALITY,
  compressImage,
  fitWithinMaxEdge,
} from "./compressImage";
export {
  SUPPORTED_IMAGE_MIME_TYPES,
  WEBP_MIME_TYPE,
  isImageMimeType,
  isSupportedImageMimeType,
} from "./mime";
export type { SupportedImageMimeType } from "./mime";
