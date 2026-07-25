type WizardMenuStepFooterProps = {
  onComplete: () => void;
  isBusy?: boolean;
};

export default function WizardMenuStepFooter({
  onComplete,
  isBusy = false,
}: WizardMenuStepFooterProps) {
  return (
    <section className="space-y-3 px-5 pt-2 pb-8">
      <button
        type="button"
        disabled={isBusy}
        onClick={onComplete}
        className="flex h-12 w-full items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
      >
        完成
      </button>
      <p className="text-center text-xs text-text-secondary">
        菜單之後也可以在餐廳詳情隨時補上。
      </p>
    </section>
  );
}
