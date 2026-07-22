type WizardStepProgressProps = {
  currentStep: 1 | 2;
  totalSteps?: number;
};

export default function WizardStepProgress({
  currentStep,
  totalSteps = 2,
}: WizardStepProgressProps) {
  return (
    <div className="px-5 pt-2 pb-1">
      <p className="text-center text-xs font-medium text-text-secondary">
        Step {currentStep} / {totalSteps}
      </p>
      <div className="mx-auto mt-2 flex max-w-[12rem] gap-2" aria-hidden>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const active = step <= currentStep;
          return (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${
                active ? "bg-caramel" : "bg-border"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
