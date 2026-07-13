import Image from "next/image";

type SectionHeadingProps = {
  iconSrc: string;
  title: string;
  iconSize?: number;
  className?: string;
};

export default function SectionHeading({
  iconSrc,
  title,
  iconSize = 28,
  className = "mb-3 flex items-center gap-2",
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <Image
        src={iconSrc}
        alt=""
        width={iconSize}
        height={iconSize}
        aria-hidden
        className="object-contain"
        style={{ width: iconSize, height: iconSize }}
      />
      <h2 className="text-base font-bold text-deep-brown">{title}</h2>
    </div>
  );
}
