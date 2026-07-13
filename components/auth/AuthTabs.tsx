export type AuthTab = "login" | "register";

type AuthTabsProps = {
  value: AuthTab;
  onChange: (value: AuthTab) => void;
};

export default function AuthTabs({ value, onChange }: AuthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="登入或註冊"
      className="mx-auto flex w-full max-w-[280px] rounded-full bg-milk-tea p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "login"}
        onClick={() => onChange("login")}
        className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
          value === "login"
            ? "bg-caramel text-rice-white shadow-soft"
            : "bg-transparent text-text-secondary hover:text-deep-brown"
        }`}
      >
        登入
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "register"}
        onClick={() => onChange("register")}
        className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-colors ${
          value === "register"
            ? "bg-caramel text-rice-white shadow-soft"
            : "bg-transparent text-text-secondary hover:text-deep-brown"
        }`}
      >
        註冊
      </button>
    </div>
  );
}
