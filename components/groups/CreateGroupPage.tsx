import CreateGroupFooter from "@/components/groups/CreateGroupFooter";
import CreateGroupForm from "@/components/groups/CreateGroupForm";
import CreateGroupHeader from "@/components/groups/CreateGroupHeader";

export default function CreateGroupPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-rice-white">
      <CreateGroupHeader />

      <main className="mt-12 flex flex-1 flex-col px-6">
        <CreateGroupForm />
      </main>

      <CreateGroupFooter />
    </div>
  );
}
