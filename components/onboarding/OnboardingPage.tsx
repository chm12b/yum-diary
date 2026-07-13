import ActionCard from "@/components/onboarding/ActionCard";
import OnboardingFooter from "@/components/onboarding/OnboardingFooter";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-rice-white">
      <OnboardingHeader />

      <main className="mt-10 flex flex-1 flex-col px-6">
        <div className="flex flex-col gap-5">
          <ActionCard
            iconName="circle-plus"
            title="建立新的群組"
            href="/groups/create"
            iconBackground="bg-milk-tea"
            className="-mt-[25px]"
          />
          <ActionCard
            iconName="users"
            title="加入現有群組"
            href="/groups/join"
            iconBackground="bg-rice-white"
            className="-mt-[5px]"
          />
        </div>
      </main>

      <OnboardingFooter />
    </div>
  );
}
