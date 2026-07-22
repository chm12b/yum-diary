import { NextResponse } from "next/server";

import { detectDocumentText } from "@/src/lib/google/vision/vision.service";
import { getOpenAiMenuParserModel } from "@/src/lib/openai/client";
import { parseMenuFromOcrText } from "@/src/lib/openai/menu-parser/parseMenuFromOcr";
import type { MenuParserResult } from "@/src/lib/openai/types";

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

function successResponse<T>(data: T, status = 200) {
  const body: ApiResponse<T> = { data, error: null };
  return NextResponse.json(body, { status });
}

function errorResponse(message: string, status = 400) {
  const body: ApiResponse<never> = { data: null, error: message };
  return NextResponse.json(body, { status });
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function isDevRequest() {
  return process.env.NODE_ENV === "development";
}

async function fetchMenuImageAsBase64(imageUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return { ok: false as const, message: "Invalid imageUrl", status: 400 };
  }

  if (parsedUrl.protocol !== "https:") {
    return {
      ok: false as const,
      message: "imageUrl must use HTTPS",
      status: 400,
    };
  }

  let imageResponse: Response;

  try {
    imageResponse = await fetch(imageUrl, { cache: "no-store" });
  } catch {
    return {
      ok: false as const,
      message: "Failed to fetch menu image",
      status: 502,
    };
  }

  if (!imageResponse.ok) {
    return {
      ok: false as const,
      message: `Failed to fetch menu image (${imageResponse.status})`,
      status: 502,
    };
  }

  const contentType = imageResponse.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return {
      ok: false as const,
      message: "Menu image URL did not return an image",
      status: 400,
    };
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  if (imageBuffer.byteLength === 0) {
    return { ok: false as const, message: "Menu image is empty", status: 400 };
  }

  if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
    return {
      ok: false as const,
      message: "Menu image exceeds 10 MB limit",
      status: 413,
    };
  }

  return {
    ok: true as const,
    imageBase64: imageBuffer.toString("base64"),
  };
}

/**
 * Dev-only PoC: Menu Photo → Vision OCR → OpenAI GPT-5.5 → JSON preview.
 * Does not write to Database.
 */
export async function POST(request: Request) {
  if (!isDevRequest()) {
    return errorResponse("AI Menu Parser PoC is only available in development", 404);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON", 400);
  }

  const imageUrl =
    typeof body === "object" &&
    body !== null &&
    "imageUrl" in body &&
    typeof (body as { imageUrl: unknown }).imageUrl === "string"
      ? (body as { imageUrl: string }).imageUrl.trim()
      : "";

  if (!imageUrl) {
    return errorResponse('Missing or empty "imageUrl" field', 400);
  }

  const imageResult = await fetchMenuImageAsBase64(imageUrl);

  if (!imageResult.ok) {
    return errorResponse(imageResult.message, imageResult.status);
  }

  const ocrResult = await detectDocumentText({
    kind: "base64",
    imageBase64: imageResult.imageBase64,
  });

  if (!ocrResult.ok) {
    if (ocrResult.googleStatus === "MISSING_API_KEY") {
      return errorResponse(ocrResult.message, 500);
    }

    if (ocrResult.status >= 400 && ocrResult.status < 500) {
      return errorResponse(ocrResult.message, ocrResult.status);
    }

    return errorResponse(ocrResult.message, 502);
  }

  const rawText = ocrResult.data.fullTextAnnotation?.text ?? "";

  const parserResult = await parseMenuFromOcrText(rawText);

  if (!parserResult.ok) {
    if (parserResult.openaiCode === "MISSING_API_KEY") {
      return errorResponse(parserResult.message, 500);
    }

    if (parserResult.status >= 400 && parserResult.status < 500) {
      return errorResponse(parserResult.message, parserResult.status);
    }

    return errorResponse(parserResult.message, 502);
  }

  const data: MenuParserResult = {
    rawText,
    model: getOpenAiMenuParserModel(),
    rawModelOutput: parserResult.data.rawModelOutput,
    items: parserResult.data.items,
    prettyJson: parserResult.data.prettyJson,
    isValidJson: parserResult.data.isValidJson,
  };

  return successResponse(data);
}
