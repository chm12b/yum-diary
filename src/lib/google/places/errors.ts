import { NextResponse } from "next/server";

import type { PlacesApiResponse } from "./types";

export function placesSuccessResponse<T>(data: T, status = 200) {
  const body: PlacesApiResponse<T> = { data, error: null };
  return NextResponse.json(body, { status });
}

export function placesErrorResponse(message: string, status = 400) {
  const body: PlacesApiResponse<never> = { data: null, error: message };
  return NextResponse.json(body, { status });
}
