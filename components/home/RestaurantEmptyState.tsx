export default function RestaurantEmptyState() {
  return (
    <section className="flex flex-col items-center gap-3 px-5 pt-[50px] pb-2 text-center">
      <span className="text-4xl leading-none" aria-hidden>
        🐰
      </span>
      <h3 className="font-display text-base font-bold text-deep-brown">
        還沒有收藏任何餐廳
      </h3>
      <p className="max-w-[16rem] text-sm leading-relaxed text-text-secondary">
        點選下方的「＋」
        <br />
        收藏第一間餐廳吧！
      </p>
    </section>
  );
}
