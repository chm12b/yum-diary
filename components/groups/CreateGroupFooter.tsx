import Image from "next/image";

import { homeAssets } from "@/src/lib/home-assets";

export default function CreateGroupFooter() {
  return (
    <footer className="mt-16 w-full px-0 pb-6">
      <Image
        src={homeAssets.createGroupBottom}
        alt=""
        width={847}
        height={294}
        className="mx-auto h-auto w-full object-contain"
      />
    </footer>
  );
}
