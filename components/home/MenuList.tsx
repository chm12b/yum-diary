import MenuCard from "@/components/home/MenuCard";
import { menuItems } from "@/src/lib/home-data";

export default function MenuList() {
  return (
    <section className="flex flex-col gap-3 px-5 pt-6">
      {menuItems.map((item) => (
        <MenuCard
          key={item.id}
          id={item.id}
          label={item.label}
          trailing={item.trailing}
        />
      ))}
    </section>
  );
}
