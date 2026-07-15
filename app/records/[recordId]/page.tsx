import DiaryDetailPage from "@/components/diary-detail/DiaryDetailPage";

type DiaryDetailRouteProps = {
  params: Promise<{ recordId: string }>;
};

export default async function DiaryDetailRoute({
  params,
}: DiaryDetailRouteProps) {
  const { recordId } = await params;

  return <DiaryDetailPage recordId={recordId} />;
}
