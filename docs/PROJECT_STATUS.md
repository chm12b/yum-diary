# Yum Diary Project Status

Version：v0.9.0-dev

Last Updated：2026-08-03

---

# Overall Progress

| Module | Status |
|---------|--------|
| Foundation | ✅ Completed |
| Authentication | ✅ Completed |
| Group | ✅ Completed |
| Restaurant | ✅ Completed |
| Menu | ✅ Completed |
| Diary（美食日記） | ✅ Completed |
| Favorites | ✅ Completed |
| Restaurant Filter | ✅ Completed（MVP） |
| Decide（今天吃什麼） | ✅ Completed（MVP） |
| Group Order（揪團點餐） | ✅ Completed（MVP） |
| Restaurant Archive | ✅ Completed（v1 + v2） |
| Image Compression | ✅ Completed |
| Settings | ✅ Completed（MVP） |

---

# Module Snapshot

## ✅ Foundation

- Supabase + Auth + Session
- RLS、Group permission
- `profiles.current_group_id` 為唯一 Group Source of Truth
- Storage Foundation（bucket：`yum-diary`）
- Path 慣例：`restaurants/`、`menus/`、`records/`

## ✅ Group

- Create / Join（邀請碼、邀請連結）
- Switch Group（Header）
- Group Detail：成員、邀請、改名、離開、解散（Owner）
- 預設位置（群組 reference lat/lng）

## ✅ Restaurant

- CRUD（新建／編輯／Detail）
- List：搜尋、排序、篩選（城市／行政區／分類／營業狀態／距離）
- Cover 上傳、Google 預覽入庫
- 收藏（Favorites）
- 常吃餐廳（依造訪次數）
- Nearby 匯入（Google Nearby grid）
- Auto Geocoding（地址 → lat/lng，不寫 `google_place_id`）
- 封存／恢復（`archived_at`；Settings 管理頁）

## ✅ Menu

- 菜單照片 Gallery
- 結構化菜單品項（menu_items）
- 管理頁：新增／編輯／刪除品項
- AI Menu JSON Import（使用者貼 JSON）
- Menu Browse（點餐流程使用）

## ✅ Diary

- 我的美食日記（**僅目前群組**）
- Restaurant 內 Timeline
- 新增／編輯／Detail
- 照片／點的食物 chips
- 由已完成共同點餐建立日記

## ✅ Decide（今天吃什麼）

- 首頁「幫我決定」
- 設定頁條件：營業中、城市／行政區、距離、收藏、分類
- 偏好存 localStorage（`yum-diary:decide-filters`）

## ✅ Group Order

- 發起點餐（Restaurant Detail；需先有菜單品項）
- Orders Hub：進行中／歷史
- 我的訂單、截止、重新開放、完成
- 分享連結
- 訂單總覽（依人／依品項）
- 完成後可寫美食日記

## ✅ Storage / Images

- 上傳前 Canvas 壓縮 WebP（長邊 ≤ 1200、quality 0.8）
- `cacheControl` 一年
- 一次性 migration script：`scripts/migratePhotoCompression.ts`（sharp，開發者手動）
- 列表頁 `loading="lazy"` / `decoding="async"`

## ✅ Settings

- 個人資料
- 群組管理
- 預設位置
- 今天吃什麼條件
- 已封存餐廳
- 關於／登出

---

# Bottom Navigation（實作）

| Icon | 頁面 |
|------|------|
| 🏠 | 首頁 |
| 🍽 | 餐廳列表 |
| ＋ | 新增（FAB） |
| ❤️ | 收藏 |
| ⚙️ | 設定 |

---

# Home 主要入口（實作）

- 幫我決定（Decide）
- 逛逛附近餐廳（預設：營業中 + 台南市／安定區）
- 美食日記
- 常吃餐廳
- 揪團點餐 → `/orders` Hub

---

# Backlog / Not done

- 永久刪除餐廳
- Cover crop／Blur placeholder
- 多個進行中點餐列表選擇（Hub 已列；首頁仍進 Hub）
- AA 分帳／外送串接／推播
- Wish List
- Email 驗證體驗優化

---

# Notes

- 一般餐廳列表預設 **排除** `archived_at IS NOT NULL`；歷史入口仍可開 Detail
- 封存餐廳不可新建共同點餐
- 我的美食日記只顯示目前群組（透過 `restaurants.group_id`）
- 編輯／新增完成後的 history 行為：避免 push 造成返回死循環（`replace` / `back`）
- 細節以本 repo 程式與 migrations（`001`–`035`）為準
