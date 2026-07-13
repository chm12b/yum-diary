import RecordsFab from "@/components/records/RecordsFab";
import RecordsHeader from "@/components/records/RecordsHeader";
import RecordsTimeline from "@/components/records/RecordsTimeline";
import RecordsTitleSection from "@/components/records/RecordsTitleSection";
import type { RestaurantDetail } from "@/src/lib/restaurant-types";

type RecordsPageProps = {
  restaurant: RestaurantDetail;
};

export default function RecordsPage({ restaurant }: RecordsPageProps) {
  const records = restaurant.records ?? [];

  return (
    <div className="home-grid-bg min-h-full">
      <RecordsHeader restaurant={restaurant} />
      <RecordsTitleSection recordCount={records.length} />
      <RecordsTimeline records={records} />
      <RecordsFab restaurantId={restaurant.id} />
    </div>
  );
}
