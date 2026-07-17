"use client";

import { useContext } from "react";

import {
  CurrentGroupContext,
  type CurrentGroupContextValue,
} from "@/src/contexts/CurrentGroupContext";

export function useCurrentGroup(): CurrentGroupContextValue {
  const value = useContext(CurrentGroupContext);

  if (!value) {
    throw new Error("useCurrentGroup must be used within a CurrentGroupProvider");
  }

  return value;
}
