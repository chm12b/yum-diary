import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function RestaurantPageHeader() {
  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href="/"
        aria-label="返回"
        className="flex h-10 w-10 items-center justify-center justify-self-start text-deep-brown"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={2} />
      </Link>
      <h1 className="text-center text-lg font-bold text-deep-brown">所有餐廳</h1>
      <button
        type="button"
        aria-label="篩選"
        className="flex h-10 w-10 items-center justify-center justify-self-end text-deep-brown"
      >
        <SlidersHorizontal className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
