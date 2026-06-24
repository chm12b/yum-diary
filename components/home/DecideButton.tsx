import { Dices } from "lucide-react";

export default function DecideButton() {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-3xl bg-caramel px-5 py-4 text-left text-white"
    >
      <Dices className="h-7 w-7 shrink-0" strokeWidth={2} />
      <span className="flex flex-col">
        <span className="text-lg font-bold leading-tight">幫我決定</span>
        <span className="text-sm font-normal opacity-90">讓兔兔幫你挑選吧～</span>
      </span>
    </button>
  );
}
