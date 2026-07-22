import { fetchVisionApi } from "./vision.client";
import type {
  GoogleVisionAnnotateImageResponse,
  GoogleVisionAnnotateResponseBody,
  VisionFeatureType,
} from "./types";

export type VisionImageInput =
  | { kind: "base64"; imageBase64: string }
  | { kind: "gcs"; gcsUri: string };

export type AnnotateImageOptions = {
  feature?: VisionFeatureType;
  languageHints?: string[];
};

const DEFAULT_MENU_LANGUAGE_HINTS = ["zh-TW", "zh-Hant", "en"] as const;

function buildImagePayload(
  input: VisionImageInput,
): { content: string } | { source: { imageUri: string } } {
  if (input.kind === "gcs") {
    return { source: { imageUri: input.gcsUri } };
  }

  return { content: input.imageBase64 };
}

/**
 * Calls Cloud Vision `images:annotate` for a single image.
 * Returns the raw first response — no menu parsing.
 */
export async function annotateImage(
  input: VisionImageInput,
  options: AnnotateImageOptions = {},
) {
  const feature = options.feature ?? "DOCUMENT_TEXT_DETECTION";
  const languageHints =
    options.languageHints ?? [...DEFAULT_MENU_LANGUAGE_HINTS];

  const result = await fetchVisionApi<GoogleVisionAnnotateResponseBody>(
    "/images:annotate",
    {
      requests: [
        {
          image: buildImagePayload(input),
          features: [{ type: feature, maxResults: 1 }],
          imageContext: { languageHints },
        },
      ],
    },
  );

  if (!result.ok) {
    return result;
  }

  const first = result.data.responses?.[0];

  return {
    ok: true as const,
    data: (first ?? {}) as GoogleVisionAnnotateImageResponse,
  };
}

/**
 * Convenience wrapper for menu OCR foundation — still returns raw Vision output.
 */
export async function detectDocumentText(
  input: VisionImageInput,
  options: Omit<AnnotateImageOptions, "feature"> = {},
) {
  return annotateImage(input, {
    ...options,
    feature: "DOCUMENT_TEXT_DETECTION",
  });
}
