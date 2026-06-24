import { Bell, Menu } from "lucide-react";

export default function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 pt-4">
      <button
        type="button"
        aria-label="開啟選單"
        className="flex h-10 w-10 items-center justify-center text-deep-brown"
      >
        <Menu className="h-6 w-6" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="通知"
        className="flex h-10 w-10 items-center justify-center text-deep-brown"
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
