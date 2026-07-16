"use client";

import { X } from "lucide-react";
import { useRef } from "react";

import {
  RECORD_FOOD_NAME_MAX,
  RECORD_FOODS_MAX,
} from "@/src/services/record-food";

type OrderedFoodFieldProps = {
  rows: string[];
  onRowsChange: (rows: string[]) => void;
};

export default function OrderedFoodField({
  rows,
  onRowsChange,
}: OrderedFoodFieldProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function updateRow(index: number, value: string) {
    const next = [...rows];
    next[index] = value.slice(0, RECORD_FOOD_NAME_MAX);
    onRowsChange(next);
  }

  function removeRow(index: number) {
    const next = rows.filter((_, rowIndex) => rowIndex !== index);
    onRowsChange(next.length === 0 ? [""] : next);
  }

  function addRowAfter(index: number) {
    if (rows.length >= RECORD_FOODS_MAX) {
      return;
    }

    const next = [...rows];
    next.splice(index + 1, 0, "");
    onRowsChange(next);

    requestAnimationFrame(() => {
      inputRefs.current[index + 1]?.focus();
    });
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addRowAfter(index);
  }

  return (
    <div className="space-y-2">
      {rows.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            value={value}
            onChange={(event) => updateRow(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            placeholder="例：牛肉麵"
            aria-label={`點餐品項 ${index + 1}`}
            className="min-w-0 flex-1 rounded-xl border border-border bg-cream-bg/60 px-3 py-2 text-sm text-deep-brown placeholder:text-cocoa/50 focus:outline-none focus:ring-1 focus:ring-caramel/40"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            aria-label={`刪除點餐品項 ${index + 1}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-rice-white text-cocoa transition-colors hover:bg-cream-bg hover:text-deep-brown"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ))}

      {rows.length >= RECORD_FOODS_MAX ? (
        <p className="text-center text-xs text-cocoa/60">
          已達上限（{RECORD_FOODS_MAX} 筆）
        </p>
      ) : null}
    </div>
  );
}
