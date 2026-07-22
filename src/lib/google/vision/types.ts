/** Subset of Cloud Vision feature types used by Yum Diary. */
export type VisionFeatureType =
  | "TEXT_DETECTION"
  | "DOCUMENT_TEXT_DETECTION";

export type GoogleVisionImage = {
  /** Base64-encoded image bytes. */
  content?: string;
  source?: {
    /** Public `gs://` URI or HTTPS URL (Vision-supported). */
    imageUri?: string;
    /** GCS object generation (optional). */
    gcsImageUri?: string;
  };
};

export type GoogleVisionFeature = {
  type: VisionFeatureType;
  maxResults?: number;
};

export type GoogleVisionImageContext = {
  languageHints?: string[];
};

export type GoogleVisionAnnotateImageRequest = {
  image: GoogleVisionImage;
  features: GoogleVisionFeature[];
  imageContext?: GoogleVisionImageContext;
};

export type GoogleVisionAnnotateRequestBody = {
  requests: GoogleVisionAnnotateImageRequest[];
};

export type GoogleVisionApiError = {
  code?: number;
  message?: string;
  status?: string;
};

export type GoogleVisionTextAnnotation = {
  locale?: string;
  description?: string;
  boundingPoly?: {
    vertices?: Array<{ x?: number; y?: number }>;
  };
};

export type GoogleVisionFullTextAnnotation = {
  text?: string;
};

export type GoogleVisionAnnotateImageResponse = {
  textAnnotations?: GoogleVisionTextAnnotation[];
  fullTextAnnotation?: GoogleVisionFullTextAnnotation;
  error?: GoogleVisionApiError;
};

export type GoogleVisionAnnotateResponseBody = {
  responses?: GoogleVisionAnnotateImageResponse[];
};
