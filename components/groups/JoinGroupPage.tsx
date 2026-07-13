import JoinGroupFooter from "@/components/groups/JoinGroupFooter";
import JoinGroupForm from "@/components/groups/JoinGroupForm";
import JoinGroupHeader from "@/components/groups/JoinGroupHeader";

export default function JoinGroupPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-rice-white">
      <JoinGroupHeader />

      <main className="mt-12 flex flex-1 flex-col px-6">
        <JoinGroupForm />
      </main>

      <JoinGroupFooter />
    </div>
  );
}
