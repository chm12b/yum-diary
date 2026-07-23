# FEATURE: Restaurant Filter

Status: Planned

---

# Overview

當餐廳數量增加（100+ 間以上）時，僅依靠搜尋與滑動列表已難以快速找到目標餐廳。

Restaurant Filter 提供多種篩選條件，讓使用者能快速縮小搜尋範圍，同時保留簡潔、療癒的介面設計。

本功能以可擴充為目標，未來新增篩選條件時，不需修改主要 UI。

---

# Goals

- 快速找到指定地區的餐廳
- 減少大量滑動列表
- 支援多條件組合篩選
- 保持 Restaurant List 介面簡潔
- 方便未來持續擴充

---

# UI

Restaurant List 搜尋列：

```
┌──────────────────────────────┐
│ 🔍 搜尋餐廳...          ⚙️ │
└──────────────────────────────┘
```

點擊右側 Filter Icon 後，由 Bottom Sheet 顯示篩選介面。

---

# Filter Panel

提供以下篩選項目：

- 城市 (City)
- 行政區 (District)
- 類別 (Category)
- Google 評分 (Google Rating)
- 營業狀態 (Open Status)
- 收藏 (Favorite)

Bottom Sheet：

```
──────────────

篩選

──────────────

城市
全部 ▼

行政區
全部 ▼

類別
全部 ▼

Google 評分
不限 ▼

營業狀態
全部 ▼

收藏
全部 ▼

──────────────

重設        套用
```

---

# Filter Chips

套用篩選後，搜尋框下方顯示目前條件。

例如：

```
📍 嘉義市 ✕

🏘 東區 ✕

🍜 日式 ✕

⭐ 4.5+ ✕
```

每個 Chip 可單獨移除。

---

# Database

restaurants 新增欄位：

- city
- district

未來若支援海外餐廳，可再擴充：

- country

目前 UI 僅使用 city、district。

---

# Address Parser

新增：

src/lib/address/taiwan-address.ts

提供：

parseTaiwanAddress(address)

回傳：

```
{
  city,
  district
}
```

例如：

```
嘉義市東區民族路123號
```

解析：

```
city = 嘉義市

district = 東區
```

---

# Restaurant Create

新增餐廳時：

Google Address

↓

parseTaiwanAddress()

↓

一起寫入：

- city
- district

---

# Backfill

提供一次性 Script：

scripts/backfill-city-district.ts

用途：

讀取所有既有餐廳地址

↓

解析城市、行政區

↓

UPDATE Database

僅需執行一次。

---

# Restaurant Search

搜尋支援：

- Restaurant Name
- Address
- City
- District

例如：

搜尋：

```
文化路
```

可找到文化路上的餐廳。

搜尋：

```
東區
```

可找到所有東區餐廳。

---

# Restaurant Filter

Restaurant Query 支援：

- city
- district
- category
- favorite
- google_rating
- open_status

所有條件可自由組合。

例如：

- 嘉義市
- 東區
- 日式
- 評分 4.5+
- 收藏

---

# Dynamic Data

城市、行政區不得寫死於程式。

城市：

依據 restaurants.city 自動取得。

行政區：

依據目前選擇的城市，自動取得對應 district。

未來新增城市時，不需修改任何程式。

---

# Future Expansion

預留以下功能：

- Distance
- My Location
- Google Map Mode
- Price Level
- Has Menu
- Has Photos
- My Rating
- Recently Visited
- Smart Recommendation

Filter Panel 可持續增加新項目，不需修改主要版面。

---

# Development Plan

## Phase 1

- Database Migration
- city
- district

---

## Phase 2

- Address Parser

---

## Phase 3

- Restaurant Create
- Backfill Script

---

## Phase 4

- Filter UI
- Bottom Sheet
- Filter Chips

---

## Phase 5

- Restaurant Query
- Multi-condition Filter
- Search Enhancement

---

# Design Principles

- 保持畫面簡潔
- 篩選集中於 Filter Panel
- 支援大量餐廳（100+）
- 採用 Data-driven 設計
- 容易擴充新功能