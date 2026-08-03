# Yum Diary Project Specification

**Version:** 1.1  
**Status:** MVP（核心模組已可使用）  
**Last Updated:** 2026-08-03

---

## 1. Project Overview

Yum Diary 是一款以「美食收藏」為核心的行動優先應用。使用者可以記錄常去或想去的餐廳、寫下用餐日記，並與親密的人組成群組共同維護一份餐廳清單。

**目標使用者**

- 喜歡探索與回訪餐廳的個人使用者
- 情侶、家人、室友、朋友等小團體（以群組共同收藏為主）

**核心價值**

- 把「去過哪裡、吃了什麼、想不想再去」整理成可回顧的收藏，而不是一次性的地圖搜尋結果
- 以低負擔的手帳式介面完成新增、瀏覽與決策（例如：今天吃哪一間）
- Google Maps／Places 僅作為加快建檔的輔助，不是產品本體

---

## 2. Product Vision

### 要解決的問題

日常找餐廳時，資訊通常散落在聊天紀錄、地圖書籤與記憶中。使用者很難回答：

- 我們一起喜歡哪些店？
- 這家上次點了什麼、評價如何？
- 今天在熟悉的清單裡，該吃哪一間？

Yum Diary 要把這些片段收斂成一份屬於個人或群組的餐廳日記與收藏庫。

### 與 Google Maps 的差異

| | Google Maps | Yum Diary |
|--|-------------|-----------|
| 定位 | 探索與導航 | 收藏與回憶 |
| 資料主權 | 平台公開／半公開資訊 | 使用者與群組私有清單 |
| 餐廳資訊 | 完整商業資訊為主 | 精簡、可編輯、以使用者觀點為主 |
| 菜單 | 商戶／平台提供 | 永遠由使用者自行建立與維護 |
| 分類 | Google 類型體系 | App 固定分類，供篩選與統計 |

Yum Diary 不試圖取代地圖。它解決的是「收藏之後怎麼用」，而不是「第一次怎麼找到店」。

### 為什麼建立這個產品

地圖擅長發現新店，但不擅長承接「我們的清單」。Yum Diary 存在的理由是：讓喜歡吃飯的人，用接近手帳的方式，把店家、紀錄與共同決定放在同一個溫暖、簡潔的空間裡。

---

## 3. Core Design Principles

以下原則為已確定的產品與設計約束，實作與後續決策應優先遵守。

### 3.1 Google 是輔助，不是主要流程

Google Places（搜尋、Detail、照片預覽）用來加速建檔。核心流程必須在沒有 Google 的情況下仍然成立。

### 3.2 沒有 Google，也必須可以建立餐廳

使用者可完全手動填寫餐廳資料並儲存。Google API 不可用、使用者不願串接、或查無結果時，不得阻塞新增。

### 3.3 Menu 永遠由使用者自行建立

菜單照片與結構化品項不由 Google Auto Fill 帶入。可選 AI 僅協助整理 JSON，寫入前仍由使用者確認。

### 3.4 Google 店家照片只是預設封面

從 Google 取得的店家照片僅作為可預覽／可替換的預設封面。正式資產存於 Supabase Storage；使用者可移除或改為自行上傳。

### 3.5 Restaurant Database 永遠只存 App Category

資料庫的餐廳分類欄位只儲存 Yum Diary 固定分類字串。Google `primaryType` 僅在匯入當下透過 Category Mapper 轉換。

### 3.6 分類固定，不允許自由建立

App 分類清單固定（例：早餐、小吃、飲料、日式、中式、韓式、南洋、西式、火鍋、甜點、其他）。建立、編輯、篩選、統計共用同一份清單。

### 3.7 UI 以療癒、手帳、簡潔、低學習成本為原則

視覺與互動應維持溫暖的手帳／奶茶氣質，資訊層級清楚，避免地圖產品式的複雜排版或過多設定。

### 3.8 Group-first

Restaurant、Diary、Menu、Group Order 皆在「目前群組」脈絡下操作。資料以群組隔離；`profiles.current_group_id` 為唯一作用中群組。

### 3.9 Soft archive，不硬刪歷史

不想再看到的餐廳可封存（`archived_at`），從一般列表隱藏；日記、點餐、菜單等歷史仍保留。永久刪除非 v1 範圍。

---

## 4. Core Features（產品範圍）

狀態細節見 `docs/FEATURES.md` 與 `docs/PROJECT_STATUS.md`。

| 範圍 | 說明 |
|------|------|
| Authentication | 註冊、登入、登出、Session；密碼重設入口 |
| Onboarding / Group | 建立或加入群組；Header 切換目前群組 |
| Restaurant | 新增／編輯／列表／詳情／收藏／常吃／Nearby 匯入／封存 |
| Google Assist | 搜尋、Auto Fill、Sync、封面預覽、Auto Geocoding |
| Menu | 菜單照片 + 品項 CRUD + JSON 匯入 |
| Diary | 美食日記 CRUD、照片、點的食物；範圍限目前群組 |
| Decide | 今天吃什麼（可設營業中、地區、距離、收藏、分類） |
| Group Order | 共同點餐、分享、截止、完成、訂單總覽 |
| Settings | 個人、群組、位置、Decide 條件、已封存餐廳 |
| Storage | WebP 壓縮上傳、公開路徑讀取 |

---

## 5. Related Documents

| 文件 | 內容 |
|------|------|
| `docs/PROJECT_STATUS.md` | 整體進度與模組快照 |
| `docs/FEATURES.md` | 功能狀態清單 |
| `docs/DATABASE.md` | 資料模型（對齊 migrations） |
| `docs/GROUP_UX_SPEC.md` | 群組 UX |
| `docs/GROUP_ORDER_SPEC.md` | 共同點餐規格 |
| `docs/FEATURE_RESTAURANT_FILTER.md` | 餐廳篩選 |
| `docs/AI_MENU_IMPORT_SPEC.md` | AI 菜單 JSON 規格 |
| `docs/APP_UX_GUIDELINES.md` | UI／UX 指南 |
| `docs/NAMING_CONVENTION.md` | 命名慣例 |

---

*本文件為專案最高層規格。實作細節以 repo 程式與 `supabase/migrations` 為準；與本文件衝突時應更新對應文件。*
