# FEATURES

**Product:** Yum Diary  
**Document type:** Feature Specification  
**Version:** 1.1  
**Last Updated:** 2026-08-03  
**Status legend:** ✅ 已完成 · 🚧 開發中 · 📌 預留

細部互動見各規格文件；狀態以本檔與 `PROJECT_STATUS.md` 為準。

---

# Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Register | ✅ | Email／密碼／顯示名稱 → profile |
| Login | ✅ | Session + 有無群組導向 |
| Logout | ✅ | Settings 登出 |
| Session Restore | ✅ | Auth Context |
| Forgot / Reset password | ✅ | `/forgot-password`、`/reset-password` |
| Email 驗證體驗 | 📌 | 提示與錯誤在地化可再優化 |

---

# Group

| Feature | Status | Notes |
|---------|--------|-------|
| Create Group | ✅ | RPC；切換 `current_group_id` |
| Join Group（邀請碼） | ✅ | `/groups/join` |
| Join（邀請連結） | ✅ | `/join/{inviteCode}` |
| Switch Group | ✅ | Header |
| Invite Member | ✅ | 碼／連結；Group Detail |
| Leave Group | ✅ | RPC |
| Delete／解散 Group | ✅ | Owner RPC |
| 預設位置 | ✅ | 群組 reference lat/lng |
| 改名／成員列表 | ✅ | Settings → 群組 |

---

# Restaurant

| Feature | Status | Notes |
|---------|--------|-------|
| Create Restaurant | ✅ | 手動 + Google 輔助；Wizard 完成用 `replace` |
| Edit Restaurant | ✅ | |
| Archive Restaurant | ✅ | `archived_at`；Detail 封存 |
| Unarchive | ✅ | Settings → 已封存餐廳 |
| Permanent Delete | 📌 | 不做硬刪歷史 |
| Auto Geocoding | ✅ | 只寫 lat/lng，不寫 `google_place_id` |
| Google Search | ✅ | |
| Google Auto Fill | ✅ | |
| Google Sync（Detail） | ✅ | 更新評分／時段等 |
| Category Mapper | ✅ | Google type → App Category |
| Business Hours | ✅ | jsonb；Open Status 顯示 |
| Cover Path | ✅ | `restaurant_cover_path` + 上傳 |
| Google Photo → Cover | ✅ | 預覽後入庫 Storage |
| City / District | ✅ | 寫入時解析地址；可 backfill |
| Photo Gallery | ✅ | `restaurant_photos`（caption / is_cover） |
| Image Compression | ✅ | 上傳前 WebP；見 Storage |

---

# Restaurant List

| Feature | Status | Notes |
|---------|--------|-------|
| Search | ✅ | 名稱／地址／城市／行政區 |
| Filters | ✅ | 距離、城市、行政區、分類、營業狀態 |
| Filter chips | ✅ | 可單除 |
| Sort | ✅ | 距離／新增／名稱／Google 評分 |
| 排除封存 | ✅ | 預設 `archived_at IS NULL` |
| Nearby quick browse | ✅ | Home `?nearby=1` 預設台南市／安定區／營業中 |
| Map mode | 📌 | |

詳見 `FEATURE_RESTAURANT_FILTER.md`。

---

# Restaurant Detail

| Feature | Status | Notes |
|---------|--------|-------|
| Info + Status Badge | ✅ | |
| Cover | ✅ | |
| 收藏 Toggle | ✅ | |
| 菜單入口 | ✅ | 瀏覽／管理 |
| 日記 Timeline／新增 | ✅ | |
| 揪團點餐 | ✅ | 需有 menu_items |
| 封存 | ✅ | |
| 附近匯入入口 | ✅ | `/restaurants/nearby` |

---

# Menu

| Feature | Status | Notes |
|---------|--------|-------|
| 菜單照片 | ✅ | `menu_photos` |
| 品項 CRUD | ✅ | `menu_items` |
| JSON Import | ✅ | 使用者貼上 JSON；規格見 `AI_MENU_IMPORT_SPEC` |
| Menu Browse | ✅ | 點餐選品項 |

---

# Favorites & Frequent

| Feature | Status | Notes |
|---------|--------|-------|
| Favorites list | ✅ | `/favorites`；不含封存 |
| Favorite toggle | ✅ | `restaurant_favorites` |
| 常吃餐廳 | ✅ | 依造訪次數 `/restaurants/frequent` |

---

# Diary（美食日記）

| Feature | Status | Notes |
|---------|--------|-------|
| 我的日記列表 | ✅ | **僅目前群組**（`restaurants.group_id`） |
| Restaurant Timeline | ✅ | |
| Create / Edit / Detail | ✅ | |
| Photos | ✅ | `record_photos` + 壓縮上傳 |
| 點的食物 | ✅ | `record_foods` chips |
| 由 Group Order 建立 | ✅ | `group_order_id`；每人每活動一筆 |
| 跨群組統計 | 📌 | |

---

# Decide（今天吃什麼）

| Feature | Status | Notes |
|---------|--------|-------|
| 推薦流程 | ✅ | 首頁／`/decide` |
| 條件設定 | ✅ | 營業中、城市、行政區、距離、收藏、分類 |
| 偏好持久化 | ✅ | localStorage，非 DB |

---

# Group Order（揪團點餐）

| Feature | Status | Notes |
|---------|--------|-------|
| Create | ✅ | Detail 發起；無菜單阻擋 |
| Orders Hub | ✅ | `/orders` 進行中＋歷史入口 |
| My order | ✅ | 選品項／數量／備註 |
| Close / Reopen / Complete | ✅ | Host |
| Share link | ✅ | |
| Summary | ✅ | 依人／依品項 |
| History | ✅ | |
| 封存店禁新建 | ✅ | |
| AA／外送／推播 | 📌 | |

詳見 `GROUP_ORDER_SPEC.md`。

---

# Settings

| Feature | Status | Notes |
|---------|--------|-------|
| 個人資料 | ✅ | |
| 群組管理 | ✅ | |
| 預設位置 | ✅ | |
| 今天吃什麼 | ✅ | |
| 已封存餐廳 | ✅ | 列表＋恢復 |
| 關於 | ✅ | |
| 登出 | ✅ | |

---

# Storage / Performance

| Feature | Status | Notes |
|---------|--------|-------|
| Bucket `yum-diary` | ✅ | paths: restaurants / menus / records |
| 上傳壓縮 WebP | ✅ | 長邊 ≤ 1200、quality 0.8 |
| cacheControl 1y | ✅ | |
| Migration 既存圖 | ✅ | `npm run migrate:photo-compression`（dry-run／execute） |
| Lazy images | ✅ | 多列表 |
| Blur placeholder / crop | 📌 | |

---

# Future（產品預留）

- 永久刪除餐廳
- Wish List
- Map 選店
- 跨群複製餐廳
- 推播與 AA 分帳

---

# Document notes

- 與程式衝突時以 repo／migrations 為準，並應更新本檔。
- 詳細表欄見 `DATABASE.md`。
