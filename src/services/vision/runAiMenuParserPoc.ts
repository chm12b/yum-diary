import type { MenuParserResult } from "@/src/lib/openai/types";

type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export async function runAiMenuParserPoc(
  imageUrl: string,
): Promise<MenuParserResult> {
  const response = await fetch("/api/dev/ai-menu-parser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  let payload: ApiResponse<MenuParserResult> = {
    data: null,
    error: null,
  };

  try {
    payload = (await response.json()) as ApiResponse<MenuParserResult>;
  } catch {
    throw new Error("AI Menu Parser returned an invalid response");
  }

  if (!response.ok || payload.error) {
    throw new Error(
      payload.error ?? `AI Menu Parser failed (${response.status})`,
    );
  }

  if (!payload.data) {
    throw new Error("AI Menu Parser returned no data");
  }

  return payload.data;
}
