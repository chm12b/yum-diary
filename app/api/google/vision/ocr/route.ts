import { detectDocumentText } from "@/src/lib/google/vision/vision.service";
import {
  visionErrorResponse,
  visionSuccessResponse,
} from "@/src/lib/google/vision/errors";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function isDevRequest() {
  return process.env.NODE_ENV === "development";
}

export async function POST(request: Request) {
  if (!isDevRequest()) {
    return visionErrorResponse("Vision OCR smoke test is only available in development", 404);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return visionErrorResponse("Request body must be valid JSON", 400);
  }

  const imageUrl =
    typeof body === "object" &&
    body !== null &&
    "imageUrl" in body &&
    typeof (body as { imageUrl: unknown }).imageUrl === "string"
      ? (body as { imageUrl: string }).imageUrl.trim()
      : "";

  if (!imageUrl) {
    return visionErrorResponse('Missing or empty "imageUrl" field', 400);
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return visionErrorResponse("Invalid imageUrl", 400);
  }

  if (parsedUrl.protocol !== "https:") {
    return visionErrorResponse("imageUrl must use HTTPS", 400);
  }

  let imageResponse: Response;

  try {
    imageResponse = await fetch(imageUrl, { cache: "no-store" });
  } catch {
    return visionErrorResponse("Failed to fetch menu image", 502);
  }

  if (!imageResponse.ok) {
    return visionErrorResponse(
      `Failed to fetch menu image (${imageResponse.status})`,
      502,
    );
  }

  const contentType = imageResponse.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return visionErrorResponse("Menu image URL did not return an image", 400);
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  if (imageBuffer.byteLength === 0) {
    return visionErrorResponse("Menu image is empty", 400);
  }

  if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
    return visionErrorResponse("Menu image exceeds 10 MB limit", 413);
  }

  const result = await detectDocumentText({
    kind: "base64",
    imageBase64: imageBuffer.toString("base64"),
  });

  if (!result.ok) {
    if (result.googleStatus === "MISSING_API_KEY") {
      return visionErrorResponse(result.message, 500);
    }

    if (result.status >= 400 && result.status < 500) {
      return visionErrorResponse(result.message, result.status);
    }

    return visionErrorResponse(result.message, 502);
  }

  const text = result.data.fullTextAnnotation?.text ?? "";

  return visionSuccessResponse({ text });
}
