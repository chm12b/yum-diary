import type { GoogleVisionAnnotateRequestBody, GoogleVisionAnnotateResponseBody } from "./types";

const VISION_API_BASE = "https://vision.googleapis.com/v1";

export type VisionFetchResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      googleStatus?: string;
    };

/**
 * Server-side Google Cloud API key for Vision (and other non-Maps APIs).
 *
 * Resolution order:
 * 1. `GOOGLE_CLOUD_API_KEY` — optional dedicated key
 * 2. `GOOGLE_MAPS_API_KEY` — same GCP project key when both APIs are enabled
 */
export function getGoogleCloudApiKey(): string | null {
  const dedicated = process.env.GOOGLE_CLOUD_API_KEY?.trim();
  if (dedicated) {
    return dedicated;
  }

  const maps = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return maps ? maps : null;
}

/**
 * Low-level Cloud Vision REST helper.
 * @see https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate
 */
export async function fetchVisionApi<T extends GoogleVisionAnnotateResponseBody>(
  path: string,
  body: GoogleVisionAnnotateRequestBody,
): Promise<VisionFetchResult<T>> {
  const apiKey = getGoogleCloudApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message:
        "GOOGLE_CLOUD_API_KEY or GOOGLE_MAPS_API_KEY is not configured",
      googleStatus: "MISSING_API_KEY",
    };
  }

  const separator = path.includes("?") ? "&" : "?";
  const url = `${VISION_API_BASE}${path}${separator}key=${encodeURIComponent(apiKey)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Failed to reach Google Cloud Vision API",
    };
  }

  let payload = {} as T;

  try {
    payload = (await response.json()) as T;
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Google Cloud Vision API returned an invalid response",
    };
  }

  const firstResponseError = payload.responses?.[0]?.error;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        firstResponseError?.message ??
        `Google Cloud Vision API request failed (${response.status})`,
      googleStatus: firstResponseError?.status,
    };
  }

  if (firstResponseError) {
    return {
      ok: false,
      status: 502,
      message:
        firstResponseError.message ??
        "Google Cloud Vision API returned an image error",
      googleStatus: firstResponseError.status,
    };
  }

  return { ok: true, data: payload };
}
