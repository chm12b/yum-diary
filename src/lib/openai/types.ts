export type ParsedMenuItem = {
  category: string | null;
  name: string;
  price: number | null;
};

export type OpenAiApiErrorPayload = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

/** Minimal Responses API payload used by the PoC. */
export type OpenAiResponsesPayload = OpenAiApiErrorPayload & {
  id?: string;
  status?: string;
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

export type MenuParserResult = {
  rawText: string;
  model: string;
  rawModelOutput: string;
  items: ParsedMenuItem[];
  prettyJson: string;
  isValidJson: boolean;
};
