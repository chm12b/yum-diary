# FEATURES

**Product:** Yum Diary  
**Document type:** Feature Specification  
**Version:** 1.0  
**Last Updated:** 2026-07-12  
**Status legend:** ✅ 已完成 · 🚧 開發中 · 📌 預留

本文件為產品功能規格清單。Project Spec、Roadmap、Database 等文件應引用此處之功能定義與狀態，而非另立互相衝突的功能敘述。

---

# Authentication

## Register

### Purpose

讓新使用者以 Email、密碼與顯示名稱建立帳號，作為後續群組與餐廳資料的身份基礎。

### Current Status

✅ 已完成

註冊表單、Auth Service 與註冊後導向（依是否已有群組進入 Home 或 Onboarding）已串接。

### Future Plan

補齊 Email 驗證提示、錯誤訊息在地化，以及註冊成功後的引導文案優化。

### Related Database

`auth.users`（Supabase Auth）  
`public.profiles`

### Related API

Supabase Auth Sign Up  
Profile 建立觸發（資料庫 trigger）

---

## Login

### Purpose

既有使用者登入，恢復可操作的工作階段。

### Current Status

✅ 已完成

登入表單、Auth Service 與登入後路徑判斷已串接。

### Future Plan

加強錯誤狀態呈現（錯誤密碼、未驗證信箱等）與登入中的載入回饋。

### Related Database

`auth.users`  
`public.profiles`

### Related API

Supabase Auth Sign In

---

## Logout

### Purpose

結束目前工作階段，清除本機登入狀態。

### Current Status

✅ 已完成

Auth Service 與 Auth Context 已提供登出能力。

### Future Plan

在個人頁／設定頁補齊明確的登出入口與登出後導向 Auth 頁。

### Related Database

無直接寫入；結束 Session

### Related API

Supabase Auth Sign Out

---

## Session Restore

### Purpose

重新開啟 App 時還原登入狀態，避免使用者重複登入。

### Current Status

✅ 已完成

Auth Context 監聽 Session 變更並在啟動時還原使用者狀態。

### Future Plan

與路由守衛／middleware 更緊密整合，統一未登入與未完成 Onboarding 的導向規則。

### Related Database

`auth.users`  
`public.profiles`

### Related API

Supabase Auth Session / `onAuthStateChange`

---

## Forgot Password

### Purpose

使用者忘記密碼時，透過 Email 重設密碼。

### Current Status

📌 預留

### Future Plan

提供忘記密碼入口、寄送重設信、重設密碼頁面與成功／失敗回饋。

### Related Database

`auth.users`

### Related API

Supabase Auth Password Recovery

---

# Group

## Create Group

### Purpose

讓使用者建立新群組，作為餐廳收藏的共享範圍，並產生邀請碼供他人加入。

### Current Status

✅ 已完成

建立群組 UI、RPC 與建立後設定目前群組脈絡已串接。

### Future Plan

完善名稱／邀請碼驗證提示，以及建立成功後的引導（前往新增第一間餐廳）。

### Related Database

`public.groups`  
`public.group_members`  
`public.profiles.current_group_id`

### Related API

`create_group` RPC  
Group Service

---

## Join Group

### Purpose

透過邀請碼加入既有群組，與成員共用餐廳收藏。

### Current Status

🚧 開發中

加入群組 UI 已存在；邀請碼提交與寫入成員關係尚未完成串接。

### Future Plan

完成加入邏輯、錯誤處理（無效碼、已加入、群組不存在），並在成功後設定目前群組並導向 Home。

### Related Database

`public.groups`  
`public.group_members`  
`public.profiles.current_group_id`

### Related API

待定 Join Group RPC／Service

---

## Switch Group

### Purpose

使用者若屬於多個群組，可切換目前作用中的群組脈絡。

### Current Status

📌 預留

### Future Plan

提供群組切換 UI，更新 `current_group_id`，並重新載入該群組的餐廳清單與相關畫面。

### Related Database

`public.profiles.current_group_id`  
`public.group_members`

### Related API

Profile／Group Service（更新目前群組）

---

## Invite Member

### Purpose

讓群組成員分享邀請碼或邀請連結，邀請他人加入。

### Current Status

📌 預留

建立群組時已產生邀請碼；專用邀請流程與分享 UI 尚未建立。

### Future Plan

在群組設定中顯示邀請碼、複製／分享，以及邀請說明文案。

### Related Database

`public.groups.invite_code`  
`public.group_members`

### Related API

讀取目前群組邀請碼（Group Service）

---

# Restaurant

## Create Restaurant

### Purpose

在目前群組新增一間餐廳。必須支援完全手動建檔；Google 僅為可選加速手段。

### Current Status

🚧 開發中

新增餐廳表單、Google 搜尋與 Auto Fill 已可用；儲存至資料庫與 Storage 的完整提交流程尚未完成。

### Future Plan

串接 Restaurant Service 寫入 `restaurants`（及必要時 `restaurant_photos`），包含驗證、成功導向與錯誤處理。

### Related Database

`public.restaurants`  
`public.restaurant_photos`（若有封面）  
`public.profiles.current_group_id`

### Related API

Restaurant Service（Create）  
Google Places Search／Detail／Photo（可選）

---

## Google Search

### Purpose

在新增餐廳時，以關鍵字搜尋 Google Places，協助使用者快速找到店家。

### Current Status

✅ 已完成

經由 Next.js Route Handler 呼叫 Places API (New) Text Search；前端具 debounce、結果列表、載入／空結果／錯誤狀態。

### Future Plan

可依需求加上地區偏向、結果數量上限或使用量防護。

### Related Database

無直接寫入

### Related API

`POST /api/google/places/search`  
Google Places API (New) `places:searchText`

---

## Google Auto Fill

### Purpose

點選搜尋結果後取得 Place Detail，僅在欄位為空時帶入餐廳資料，加速建檔且不覆蓋使用者輸入。

### Current Status

✅ 已完成

可帶入店名、地址、電話、網站、簡化營業時間、App 分類、Google 店家照片預覽；菜單與備註永不自動填入；成功提示已實作。

### Future Plan

與正式儲存流程整合（寫入 `google_place_id`、`last_google_sync_at`、封面下載至 Storage）。

### Related Database

寫入發生於 Create Restaurant 時：  
`public.restaurants`  
`public.restaurant_photos`（未來）

### Related API

`GET /api/google/places/{placeId}`  
`GET /api/google/places/photo`（預覽）  
Category Mapper

---

## Category Mapper

### Purpose

將 Google `primaryType` 轉換為 Yum Diary 固定 App Category；資料庫只存 App 分類。

### Current Status

✅ 已完成

固定 `APP_CATEGORIES` 與 `GOOGLE_CATEGORY_MAP`；未知類型預設為「其他」。Auto Fill 已使用 Mapper。

### Future Plan

依實際匯入資料擴充 Google type 對照；必要時對齊列表篩選與統計使用同一分類來源。

### Related Database

`public.restaurants.category`（僅存 App Category 字串）

### Related API

無獨立 HTTP API；應用層 `mapGoogleCategory`

---

## Business Hours

### Purpose

以簡潔、可編輯的方式記錄營業時段與公休日。Google 回傳複雜時段時，採「最常見時段」簡化，必要時提示特殊時段。

### Current Status

✅ 已完成

表單可編輯時段／公休日；Auto Fill 採最常見單一時間、公休日與特殊時段 ⚠️／Bottom Sheet。

### Future Plan

與 Create／Edit 儲存一併寫入 `business_hours` jsonb；編輯頁沿用同一結構。

### Related Database

`public.restaurants.business_hours`

### Related API

Google Place Detail（來源）  
Restaurant Create／Update（持久化）

---

## Photo

### Purpose

餐廳封面／店家照片。Google 照片可作預設預覽；正式資產應存於應用 Storage，使用者可改為自行上傳。

### Current Status

🚧 開發中

Google 店家照片預覽（不寫入 Storage）已完成；上傳、下載入庫與封面標記尚未完成。

### Future Plan

完成 Storage 上傳／Google 照片下載入庫、`restaurant_photos` 寫入、封面選擇與移除。

### Related Database

`public.restaurant_photos`

### Related API

`GET /api/google/places/photo`（預覽）  
Supabase Storage  
Restaurant Photo Service（待定）

---

## Menu

### Purpose

由使用者自行建立菜單內容（例如菜單照片）。不得由 Google Auto Fill 帶入。

### Current Status

🚧 開發中

新增餐廳表單有菜單上傳區 UI 殼層；尚無實際上傳與資料持久化。

### Future Plan

支援多張菜單照片上傳、預覽、刪除，並定義與餐廳的關聯儲存方式。

### Related Database

待定（可能擴充 `restaurant_photos` 類型，或獨立菜單表）

### Related API

Supabase Storage  
Restaurant／Menu Service（待定）

---

## Edit Restaurant

### Purpose

修改既有餐廳資料（含手動欄位與先前由 Google 帶入之內容）。

### Current Status

📌 預留

### Future Plan

提供編輯頁，沿用新增表單欄位與分類規則；儲存時更新 `restaurants`（及照片）。

### Related Database

`public.restaurants`  
`public.restaurant_photos`

### Related API

Restaurant Service（Update）

---

## Delete Restaurant

### Purpose

自群組收藏中移除餐廳（及關聯照片／紀錄之處理規則另訂）。

### Current Status

📌 預留

### Future Plan

提供刪除確認、權限規則，以及 Storage 物件清理策略。

### Related Database

`public.restaurants`  
`public.restaurant_photos`  
相關日記／紀錄表（若已存在）

### Related API

Restaurant Service（Delete）  
Storage 清理

---

# Restaurant List

## Search

### Purpose

在餐廳列表以關鍵字搜尋店名等欄位，快速找到收藏中的店。

### Current Status

🚧 開發中

列表搜尋 UI 已具備；目前仍基於模擬資料，尚未綁定群組真實餐廳資料。

### Future Plan

改為查詢目前群組之 `restaurants`，並定義搜尋欄位範圍（店名、地址、備註等）。

### Related Database

`public.restaurants`

### Related API

Restaurant Service（List／Search）

---

## Category Filter

### Purpose

依固定 App Category 篩選餐廳列表，支援瀏覽與後續統計一致性。

### Current Status

🚧 開發中

分類篩選 UI 已具備；分類來源與真實資料／`APP_CATEGORIES` 尚未完全對齊並接上資料庫。

### Future Plan

統一使用 App 固定分類；篩選結果來自目前群組真實資料。

### Related Database

`public.restaurants.category`

### Related API

Restaurant Service（List）  
Category 定義（`APP_CATEGORIES`）

---

## Sort

### Purpose

對餐廳列表排序（例如最近新增、店名、評分／造訪頻率等）。

### Current Status

📌 預留

### Future Plan

定義排序選項與預設排序，並在 List API／前端套用。

### Related Database

`public.restaurants`（及未來統計／造訪欄位）

### Related API

Restaurant Service（List with sort）

---

# Restaurant Detail

## Restaurant Info

### Purpose

展示單一餐廳的詳細資訊（名稱、分類、營業時間、聯絡方式、地址、備註等）。

### Current Status

🚧 開發中

詳情頁 UI 架構已存在；主要仍使用模擬資料，尚未完整綁定資料庫餐廳列。

### Future Plan

以 Restaurant Service 讀取真實資料渲染；與 Edit／日記入口銜接。

### Related Database

`public.restaurants`  
`public.restaurant_photos`

### Related API

`getRestaurant`／Restaurant Service  
頁面路由 `/restaurants/[id]`

---

## Photo Gallery

### Purpose

在詳情頁瀏覽餐廳相關照片（封面與其他店家圖）。

### Current Status

📌 預留

詳情頁有圖像展示區概念；完整相簿與真實 Storage 圖片尚未完成。

### Future Plan

相簿瀏覽、封面標記、新增／刪除照片。

### Related Database

`public.restaurant_photos`

### Related API

Storage 讀取  
Restaurant Photo Service（待定）

---

## Menu

### Purpose

在詳情頁檢視使用者建立的菜單資料／照片。

### Current Status

📌 預留

詳情頁有菜單區塊 UI；內容仍為示意，未接真實菜單資料。

### Future Plan

顯示使用者上傳之菜單，並提供新增入口。

### Related Database

待定（與 Restaurant Menu 儲存方案一致）

### Related API

Storage／Menu Service（待定）

---

# Home

## Empty State

### Purpose

當目前群組尚無餐廳時，以清楚、低壓力的方式引導使用者新增第一間餐廳。

### Current Status

✅ 已完成

Home 會依真實 `listRestaurants` 結果顯示空狀態與引導。

### Future Plan

優化文案與主要 CTA（新增餐廳／Google 搜尋）的可發現性。

### Related Database

`public.restaurants`（透過目前群組查詢）

### Related API

Restaurant Service（List）

---

## Restaurant Cards

### Purpose

在 Home 呈現已收藏餐廳的摘要卡片，作為進入詳情或常去清單的入口。

### Current Status

🚧 開發中

有資料時 Home 已能區分狀態，但尚未以真實餐廳資料渲染餐廳卡片列表（目前以功能入口卡為主）。

### Future Plan

顯示群組餐廳摘要卡（封面、店名、分類等），並連結詳情頁。

### Related Database

`public.restaurants`  
`public.restaurant_photos`

### Related API

Restaurant Service（List）

---

## Today Eat

### Purpose

從收藏中協助決定「今天吃哪一間」（隨機／篩選後的決策體驗）。

### Current Status

📌 預留

決策相關頁面有 UI 雛形；尚未定為 Home 正式功能並完成產品規則。

### Future Plan

定義決策規則（全部／分類／排除公休等），並從 Home 提供明確入口。

### Related Database

`public.restaurants`  
`public.restaurants.business_hours`（若納入是否營業）

### Related API

Restaurant Service（List）  
Decide 流程（待定）

---

## Document notes

- 功能狀態以本文件為準；實作進度變更時應同步更新對應 Feature 的 Current Status。
- 「Related Database／Related API」描述依賴關係，細部 schema 與契約以 `DATABASE.md` 與實作程式為準。
- 與產品原則衝突時，以 `docs/PROJECT_SPEC.md` 為最高依據。
