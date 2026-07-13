import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function AuthFooter() {
  return (
    <footer className="mt-auto w-full max-w-[500px] px-0 pb-4 pt-6">
      <Image
        src={homeAssets.loginBottom}
        alt="今天也一起吃好吃的吧！"
        width={1000}
        height={380}
        className="mx-auto h-auto w-full max-w-[500px] object-contain"
      />
    </footer>
  );
}
