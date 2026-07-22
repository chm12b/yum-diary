export { getGoogleCloudApiKey, fetchVisionApi } from "./vision.client";
export type { VisionFetchResult } from "./vision.client";
export {
  annotateImage,
  detectDocumentText,
} from "./vision.service";
export type {
  AnnotateImageOptions,
  VisionImageInput,
} from "./vision.service";
export type {
  GoogleVisionAnnotateImageResponse,
  GoogleVisionAnnotateRequestBody,
  GoogleVisionAnnotateResponseBody,
  GoogleVisionFullTextAnnotation,
  GoogleVisionTextAnnotation,
  VisionFeatureType,
} from "./types";
