type WizardMenuStepFooterProps = {
  onSkip: () => void;
  onComplete: () => void;
  isBusy?: boolean;
};

export default function WizardMenuStepFooter({
  onSkip,
  onComplete,
  isBusy = false,
}: WizardMenuStepFooterProps) {
  return (
    <section className="space-y-3 px-5 pt-2 pb-8">
      <div className="flex gap-2.5">
        <button
          type="button"
          disabled={isBusy}
          onClick={onSkip}
          className="flex h-12 flex-1 items-center justify-center rounded-full border border-border bg-cream-bg/60 text-sm font-bold text-deep-brown transition-colors hover:bg-cream-bg active:scale-[0.98] disabled:opacity-70"
        >
          略過
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={onComplete}
          className="flex h-12 flex-1 items-center justify-center rounded-full bg-caramel text-sm font-bold text-rice-white shadow-button transition-[filter] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
        >
          完成
        </button>
      </div>
      <p className="text-center text-xs text-text-secondary">
        菜單之後也可以在餐廳詳情隨時補上。
      </p>
    </section>
  );
}
