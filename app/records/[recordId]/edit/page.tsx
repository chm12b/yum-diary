import AddDiaryPage from "@/components/add-diary/AddDiaryPage";

type EditDiaryRouteProps = {
  params: Promise<{ recordId: string }>;
};

export default async function EditDiaryRoute({ params }: EditDiaryRouteProps) {
  const { recordId } = await params;

  return <AddDiaryPage mode="edit" recordId={recordId} />;
}
