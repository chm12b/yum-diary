"use client";

type QuantityStepperProps = {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  disabled?: boolean;
};

/**
 * Compact capsule stepper: [－  2  ＋]
 * Visual height ~36px; button hit areas remain ≥44px (Apple HIG).
 */
export default function QuantityStepper({
  quantity,
  onDecrement,
  onIncrement,
  disabled = false,
}: QuantityStepperProps) {
  const hitButtonClass =
    "flex h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 items-center justify-center text-sm font-bold text-[#6E4F38] transition-colors hover:bg-cream-bg/70 active:bg-cream-bg disabled:cursor-not-allowed disabled:opacity-55";

  return (
    <div className="inline-flex h-9 items-center overflow-visible rounded-full border border-caramel/50 bg-rice-white shadow-soft">
      <button
        type="button"
        aria-label="減少數量"
        disabled={disabled}
        onClick={onDecrement}
        className={`${hitButtonClass} -my-1 rounded-l-full`}
      >
        －
      </button>
      <span
        className="min-w-[1.5rem] px-0.5 text-center font-display text-sm font-bold tabular-nums text-[#6E4F38]"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        aria-label="增加數量"
        disabled={disabled}
        onClick={onIncrement}
        className={`${hitButtonClass} -my-1 rounded-r-full`}
      >
        ＋
      </button>
    </div>
  );
}

type QuantityAddButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
};

/** Rounded capsule 「＋」 for items not yet in the order (min 44px). */
export function QuantityAddButton({
  onClick,
  disabled = false,
  busy = false,
}: QuantityAddButtonProps) {
  return (
    <button
      type="button"
      aria-label="加入餐點"
      disabled={disabled || busy}
      onClick={onClick}
      className="inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-caramel/50 bg-cream-bg/80 px-4 text-base font-bold text-[#6E4F38] shadow-soft transition-[filter] hover:brightness-[0.99] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {busy ? "…" : "＋"}
    </button>
  );
}
