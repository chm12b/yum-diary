import { NextResponse } from "next/server";

export type VisionApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export function visionSuccessResponse<T>(data: T, status = 200) {
  const body: VisionApiResponse<T> = { data, error: null };
  return NextResponse.json(body, { status });
}

export function visionErrorResponse(message: string, status = 400) {
  const body: VisionApiResponse<never> = { data: null, error: message };
  return NextResponse.json(body, { status });
}
