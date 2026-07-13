import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

type AddRestaurantFooterProps = {
  onSubmit?: () => void;
  isSubmitting?: boolean;
};

export default function AddRestaurantFooter({
  onSubmit,
  isSubmitting = false,
}: AddRestaurantFooterProps) {
  return (
    <section className="space-y-3 px-5 pt-2 pb-8">
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="relative flex w-full items-center justify-center gap-2 rounded-full bg-caramel px-6 py-3.5 text-base font-bold text-rice-white shadow-button transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-1.5 rounded-full border border-dashed border-rice-white/60"
        />
        <Image
          src={homeAssets.memoBunny}
          alt=""
          width={80}
          height={80}
          aria-hidden
          className="-mx-2.5 -my-[25px] h-20 w-20 object-contain"
        />
        {isSubmitting ? "新增中..." : "儲存餐廳"}
        <Image
          src={homeAssets.navFavorites}
          alt=""
          width={30}
          height={30}
          aria-hidden
          className="h-[30px] w-[30px] rotate-[15deg] object-contain"
        />
      </button>

      <p className="text-center text-xs text-text-secondary">
        🌿 每一家店，都值得被好好收藏。
      </p>
    </section>
  );
}
