# Yum Diary Naming Convention

**Version:** 1.0  
**Last Updated:** 2026-07-13  
**Related:** `docs/PROJECT_SPEC.md`, `docs/FEATURES.md`, `docs/DATABASE.md`

---

## 1. Purpose

本文件建立 Yum Diary 統一的命名規則，避免不同開發階段、不同工具或貢獻者產生不一致的名稱。

所有新功能、資料表、欄位、API、Service、TypeScript 型別與元件皆應遵循本文件。

---

## 2. General Principles

- **一個概念只有一種名稱。** 例如群組識別一律為 Database 的 `group_id`／TypeScript 的 `groupId`，不另造 `teamId`、`clubId`。
- **Database 使用資料庫慣例**（snake_case、複數表名）。
- **TypeScript／React 使用 JavaScript 慣例**（camelCase、PascalCase）。
- **不因不同功能建立不同命名。** 同一實體在 Create／Edit／List／API 中保持同一字根。
- 跨層對應時，僅做慣例轉換（`website_url` ↔ `websiteUrl`），不改語意。

---

## 3. Database

Database 識別字使用 **snake_case**。

**正確範例**

- `created_at`
- `updated_at`
- `group_id`
- `website_url`
- `google_place_id`
- `business_hours`
- `restaurant_photos`

**禁止**

- `createdAt`
- `groupId`
- `websiteUrl`

欄位名稱以 `docs/DATABASE.md` 與實際 schema 為準。

---

## 4. TypeScript

變數、函式參數、物件屬性與多數型別欄位使用 **camelCase**。

**正確範例**

- `createdAt`
- `updatedAt`
- `groupId`
- `websiteUrl`
- `googlePlaceId`
- `businessHours`
- `restaurantPhotos`

與 Database 對應時，在 Service／Mapper 層明確轉換，例如 `website` 產品語意對應欄位 `website_url`／屬性 `websiteUrl`。

---

## 5. Type Naming

Interface、Type Alias 與資料模型使用 **PascalCase**。

### 正確範例

- `Restaurant`
- `RestaurantRecord`
- `RestaurantPhoto`
- `BusinessHours`
- `GooglePlace`
- `CreateRestaurantInput`
- `UpdateRestaurantInput`
- `CreateGroupInput`

### 不建議

- `IRestaurant`
- `restaurantType`
- `restaurant_record`
- `restaurantModel`

### 原則

- Interface、Type Alias、DTO 使用 PascalCase。
- Input／Output 型別使用「動詞 + Entity + Input／Output」命名（如 `CreateRestaurantInput`、`UpdateRestaurantInput`）。
- Database Row 可使用 Entity + `Record`，例如 `RestaurantRecord`。
- 不使用 `I` 開頭（如 `IRestaurant`），保持 TypeScript 社群慣例。

---

## 6. React Components

Component 使用 **PascalCase**。

**正確範例**

- `RestaurantCard`
- `BusinessHoursEditor`
- `GoogleSearchDialog`
- `CreateRestaurantForm`

檔名與匯出元件名稱保持一致（見第 10 節）。

---

## 7. React Hooks

Hook 使用 **`use` + PascalCase**（慣用寫法為 `use` 後接大寫開頭的描述）。

**正確範例**

- `useAuth`
- `useRestaurant`
- `useBusinessHours`
- `useGooglePlaces`

---

## 8. Service

Service 函式使用 **動詞 + Entity**（camelCase）。

**正確範例**

- `createRestaurant`
- `listRestaurants`
- `getRestaurant`
- `updateRestaurant`
- `deleteRestaurant`
- `joinGroup`
- `createGroup`

**不要**

- `restaurantService()`
- `doRestaurant()`
- `save()`（語意過泛，無法對應實體與操作）

複數用於列表（`listRestaurants`）；單數用於單一資源（`getRestaurant`、`createRestaurant`）。

---

## 9. API Routes

API Route 路徑使用 **kebab-case**，並以資源層級組織。

**正確範例**

- `/api/google/places/search`
- `/api/google/places/photo`
- `/api/restaurants`

**不要**

- `/api/GetRestaurant`
- `/api/googlePlaces`

動態區段使用語意清楚的參數名（如 `[placeId]`、`[id]`），與 TypeScript camelCase 參數對齊即可。

---

## 10. File Naming

| 類型 | 規則 | 範例 |
|------|------|------|
| React Component | `PascalCase.tsx` | `RestaurantCard.tsx`、`BusinessHoursEditor.tsx`、`GoogleSearchDialog.tsx` |
| 一般工具／Service 實作 | `camelCase.ts` | `createRestaurant.ts`、`mapGoogleCategory.ts`、`formatBusinessHours.ts` |
| 型別集中檔 | `types.ts` | `src/services/restaurant/types.ts` |
| 常數集中檔 | `constants.ts` | `constants.ts` |

資料夾名稱建議使用 **kebab-case** 或既有專案慣例（如 `add-restaurant`、`google/places`），同一目錄內保持一致。

---

## 11. Database Tables

Table 一律使用 **複數** + snake_case。

**正確範例**

- `restaurants`
- `restaurant_photos`
- `groups`
- `group_members`
- `profiles`

**不要**

- `restaurant`
- `photo`

關聯表以「實體複數」組合命名（如 `group_members`、`restaurant_photos`）。

---

## 12. Enum / Constant

模組級常數與列舉物件使用 **UPPER_SNAKE_CASE**。

**正確範例**

- `APP_CATEGORIES`
- `GOOGLE_CATEGORY_MAP`
- `MAX_BUSINESS_PERIODS`
- `DEFAULT_PAGE_SIZE`

TypeScript `const` 物件若作為唯讀對照表，亦適用此規則（與現有 `APP_CATEGORIES`、`GOOGLE_CATEGORY_MAP` 一致）。

---

## 13. Boolean

Boolean 一律以 **`is` / `has` / `can`** 開頭（TypeScript 為 camelCase）。

**正確範例**

- `isCover`
- `isArchived`
- `isOpen`
- `hasGoogleData`
- `canEdit`

**不要**

- `cover`
- `archive`
- `open`（語意模糊，易與動詞混淆）

Database 對應欄位使用 snake_case，例如 `is_cover`、`is_archived`。

---

## 14. Event Handler

React 事件處理函式以 **`handle`** 開頭。

**正確範例**

- `handleSubmit`
- `handleSearch`
- `handleDelete`
- `handleAddPeriod`

Props 回呼可使用 `on` 前綴（如 `onSubmit`、`onSearch`）；元件內部實作則用 `handle*`。

---

## 15. Props

Component Props 使用 **camelCase**。

**正確範例**

- `restaurantId`
- `groupId`
- `coverPhoto`
- `businessHours`

避免把 Database snake_case 直接當 Props 名稱傳入 UI 層。

---

## 16. Future Rule

新增任何功能時，若需要新的：

- Table
- Column
- Type
- API
- Service
- Component／Hook

應先確認是否符合本文件。

若需新增或修正命名規則，**請優先更新本文件，再開始開發**。

---

## Document Notes

- 本文件為 Yum Diary **全專案唯一命名規範**。
- 若與舊程式命名不同，以本文件為**後續開發標準**。
- 歷史命名可逐步重構，但**新程式不得再建立新的命名風格**。
- 資料模型語意與欄位清單以 `docs/DATABASE.md` 為準；本文件只規範「如何命名」，不重複定義 schema。
