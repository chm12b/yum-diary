import type { OpenAiApiErrorPayload, OpenAiResponsesPayload } from "./types";

const OPENAI_API_BASE = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MENU_PARSER_MODEL = "gpt-5.5-mini";

export type OpenAiFetchResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      openaiCode?: string;
    };

export function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key ? key : null;
}

/** Reads OPENAI_MENU_PARSER_MODEL; falls back to gpt-5.5-mini. */
export function getOpenAiMenuParserModel(): string {
  const configured = process.env.OPENAI_MENU_PARSER_MODEL?.trim();
  return configured ? configured : DEFAULT_OPENAI_MENU_PARSER_MODEL;
}

/**
 * Calls OpenAI Responses API.
 * @see https://platform.openai.com/docs/api-reference/responses
 */
export async function createResponse(options: {
  model?: string;
  input: string;
}): Promise<OpenAiFetchResult<OpenAiResponsesPayload>> {
  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "OPENAI_API_KEY is not configured",
      openaiCode: "MISSING_API_KEY",
    };
  }

  let response: Response;

  try {
    response = await fetch(`${OPENAI_API_BASE}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options.model ?? getOpenAiMenuParserModel(),
        input: options.input,
      }),
      cache: "no-store",
    });
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Failed to reach OpenAI Responses API",
    };
  }

  let payload: OpenAiResponsesPayload = {};

  try {
    payload = (await response.json()) as OpenAiResponsesPayload;
  } catch {
    return {
      ok: false,
      status: 502,
      message: "OpenAI Responses API returned an invalid response",
    };
  }

  if (!response.ok) {
    const error = (payload as OpenAiApiErrorPayload).error;
    return {
      ok: false,
      status: response.status,
      message:
        error?.message ??
        `OpenAI Responses API request failed (${response.status})`,
      openaiCode: error?.code ?? error?.type,
    };
  }

  return { ok: true, data: payload };
}

export function extractResponseText(payload: OpenAiResponsesPayload): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const chunks: string[] = [];

  for (const item of payload.output ?? []) {
    for (const part of item.content ?? []) {
      if (typeof part.text === "string" && part.text.trim()) {
        chunks.push(part.text);
      }
    }
  }

  return chunks.join("\n").trim();
}
