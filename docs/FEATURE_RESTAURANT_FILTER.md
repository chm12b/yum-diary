# FEATURE: Restaurant Filter

Status: ✅ Completed（MVP）  
Last Updated: 2026-08-03

---

# Overview

當餐廳數量增加時，僅依靠搜尋與滑動列表已難以快速找到目標餐廳。

Restaurant Filter 提供多條件篩選，讓使用者縮小範圍，同時保留簡潔手帳 UI。

城市／行政區為 **data-driven**（依目前群組內既有餐廳的 `city` / `district`），不寫死清單。

---

# Implemented UI

Restaurant List 搜尋列 + 右側篩選入口 → Bottom Sheet。

## Filter Panel 項目（已上線）

- 距離（需群組預設位置；`maxDistanceMeters`）
- 城市 (City)
- 行政區 (District；依所選城市連動)
- 類別 (Category)
- 營業狀態 (Open Status)

## Filter Chips

套用後在搜尋框下方顯示可單獨移除的條件 chip。

## Sort（已上線）

- 距離最近（需 reference 位置）
- 最近新增
- 名稱
- Google 評分高→低／低→高

## Search

- 店名
- 地址
- city
- district

---

# Database

`restaurants` 欄位：

- `city` text null（migration `028`）
- `district` text null

寫入時機：

- Create／Update 時以 Address Parser（`resolveCityDistrict`）自地址解析
- 失敗時不強制阻擋；Edit 時解析失敗不覆寫既有 city/district

Backfill：

```bash
npm run backfill:city-district
```

（`scripts/backfill-city-district.ts` + Service Role Key）

---

# Query Layer

`listRestaurants({ groupId, filter, sort, search, referencePoint, includeArchived })`

Filter 欄位（`RestaurantFilter`）：

- `city`
- `district`
- `category`
- `openStatus`
- `maxDistanceMeters`

預設：

- `includeArchived: false`（`archived_at IS NULL`）
- 排序預設 `distance`

---

# Home：逛逛附近餐廳

首頁入口帶 query flag：`/restaurants?nearby=1`

預設條件（`src/lib/restaurants/nearby-quick-browse.ts`）：

- `openStatus: "open"`
- `city: "台南市"`
- `district: "安定區"`
- 排序：`distance`  
（已移除早期「1 公里內」距離條件）

---

# Decide 設定

「今天吃什麼」設定頁亦有城市／行政區篩選，偏好存 **localStorage**（與 List 共用 location options 資料來源）。

---

# Not in MVP Panel（Future）

- Google Rating 下限
- Favorite-only filter（收藏有獨立 `/favorites` 頁）
- Map mode、價格級距 chips 等擴充

---

# Design Principles

- 畫面簡潔；進階條件集中於 Sheet
- Data-driven city／district
- 可擴充 filter key，不必改主列表骨架
