"use client";

import { ArrowLeft, Ellipsis, Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type DiaryDetailHeaderProps = {
  restaurantId: string;
  recordId: string;
  /** Only the record author may edit / delete. */
  canEdit: boolean;
};

const iconButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-rice-white/95 text-deep-brown shadow-soft";

export default function DiaryDetailHeader({
  restaurantId,
  recordId,
  canEdit,
}: DiaryDetailHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="grid grid-cols-3 items-center px-5 pt-4 pb-2">
      <Link
        href={`/restaurants/${restaurantId}/records`}
        aria-label="返回全部紀錄"
        className={`${iconButtonClass} justify-self-start`}
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={2} />
      </Link>
      <h1 className="text-center font-display text-base font-bold text-deep-brown">
        用餐紀錄
      </h1>
      {canEdit ? (
        <div className="relative justify-self-end" ref={menuRef}>
          <button
            type="button"
            aria-label="更多"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={iconButtonClass}
          >
            <Ellipsis className="h-5 w-5" strokeWidth={2} />
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="absolute top-11 right-0 z-30 min-w-[11rem] overflow-hidden rounded-2xl border border-border bg-rice-white py-1 shadow-card"
            >
              <Link
                href={`/records/${recordId}/edit`}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-deep-brown transition-colors hover:bg-cream-bg"
              >
                <Pencil
                  className="h-4 w-4 shrink-0 text-caramel"
                  strokeWidth={2}
                />
                編輯紀錄
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <span aria-hidden />
      )}
    </header>
  );
}
