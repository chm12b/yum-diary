import type { VisionApiResponse } from "@/src/lib/google/vision/errors";

export type VisionOcrSmokeTestResult = {
  text: string;
};

export async function runVisionOcrSmokeTest(
  imageUrl: string,
): Promise<VisionOcrSmokeTestResult> {
  const response = await fetch("/api/google/vision/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  let payload: VisionApiResponse<VisionOcrSmokeTestResult> = {
    data: null,
    error: null,
  };

  try {
    payload = (await response.json()) as VisionApiResponse<VisionOcrSmokeTestResult>;
  } catch {
    throw new Error("Vision OCR returned an invalid response");
  }

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? `Vision OCR failed (${response.status})`);
  }

  if (!payload.data) {
    throw new Error("Vision OCR returned no data");
  }

  return payload.data;
}
