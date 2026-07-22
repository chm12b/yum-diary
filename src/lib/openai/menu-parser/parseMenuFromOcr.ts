import {
  createResponse,
  extractResponseText,
  getOpenAiMenuParserModel,
} from "@/src/lib/openai/client";
import { buildMenuParserInput } from "@/src/lib/openai/menu-parser/prompt";
import type {
  MenuParserResult,
  ParsedMenuItem,
} from "@/src/lib/openai/types";

function stripMarkdownFences(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function toParsedMenuItem(value: unknown): ParsedMenuItem | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";

  if (!name) {
    return null;
  }

  let category: string | null = null;

  if (typeof record.category === "string") {
    category = record.category.trim() || null;
  } else if (record.category === null || record.category === undefined) {
    category = null;
  }

  let price: number | null = null;

  if (typeof record.price === "number" && Number.isFinite(record.price)) {
    price = record.price;
  } else if (record.price === null || record.price === undefined) {
    price = null;
  } else if (typeof record.price === "string") {
    const parsed = Number(record.price.trim().replace(/,/g, ""));
    price = Number.isFinite(parsed) ? parsed : null;
  }

  return { category, name, price };
}

export function parseMenuJsonOutput(rawModelOutput: string): {
  items: ParsedMenuItem[];
  prettyJson: string;
  isValidJson: boolean;
} {
  const cleaned = stripMarkdownFences(rawModelOutput);

  try {
    const parsed: unknown = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      return {
        items: [],
        prettyJson: cleaned,
        isValidJson: false,
      };
    }

    const items = parsed
      .map(toParsedMenuItem)
      .filter((item): item is ParsedMenuItem => item !== null);

    return {
      items,
      prettyJson: JSON.stringify(items, null, 2),
      isValidJson: true,
    };
  } catch {
    return {
      items: [],
      prettyJson: cleaned,
      isValidJson: false,
    };
  }
}

/**
 * PoC: OCR raw text → OpenAI Responses API → structured menu JSON.
 * Does not persist anything.
 */
export async function parseMenuFromOcrText(
  ocrText: string,
): Promise<
  | { ok: true; data: Omit<MenuParserResult, "rawText" | "model"> }
  | {
      ok: false;
      status: number;
      message: string;
      openaiCode?: string;
    }
> {
  const trimmed = ocrText.trim();

  if (!trimmed) {
    return {
      ok: true,
      data: {
        rawModelOutput: "[]",
        items: [],
        prettyJson: "[]",
        isValidJson: true,
      },
    };
  }

  const response = await createResponse({
    model: getOpenAiMenuParserModel(),
    input: buildMenuParserInput(trimmed),
  });

  if (!response.ok) {
    return response;
  }

  const rawModelOutput = extractResponseText(response.data);

  if (!rawModelOutput) {
    return {
      ok: false,
      status: 502,
      message: "OpenAI returned an empty response",
    };
  }

  const parsed = parseMenuJsonOutput(rawModelOutput);

  return {
    ok: true,
    data: {
      rawModelOutput,
      items: parsed.items,
      prettyJson: parsed.prettyJson,
      isValidJson: parsed.isValidJson,
    },
  };
}
