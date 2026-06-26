type BunnyMessageProps = {
  message?: string;
};

export default function BunnyMessage({
  message = "今天也想吃得開心呢～",
}: BunnyMessageProps) {
  return (
    <p className="max-w-[16rem] rounded-2xl bg-rice-white/80 px-4 py-2.5 text-center text-sm leading-relaxed text-cocoa shadow-soft">
      {message}
    </p>
  );
}
