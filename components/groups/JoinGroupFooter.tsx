import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function JoinGroupFooter() {
  return (
    <footer className="mt-16 w-full px-0 pb-6">
      <Image
        src={homeAssets.joinGroupBottom}
        alt=""
        width={843}
        height={291}
        className="mx-auto h-auto w-full object-contain"
      />
    </footer>
  );
}
