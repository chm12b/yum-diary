import { Bell, Menu } from "lucide-react";

export default function TopBar() {
  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-1">
      <button
        type="button"
        aria-label="開啟選單"
        className="flex h-10 w-10 items-center justify-center justify-self-start text-text-primary transition-transform active:scale-[0.98]"
      >
        <Menu className="h-6 w-6" strokeWidth={2} />
      </button>
      <h1 className="text-center font-mono text-2xl text-text-primary">
        Yum Diary
      </h1>
      <button
        type="button"
        aria-label="通知"
        className="flex h-10 w-10 items-center justify-center justify-self-end text-text-primary transition-transform active:scale-[0.98]"
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
