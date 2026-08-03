# Yum Diary UI / UX Guidelines

**Product:** Yum Diary  
**Version:** v1.1  
**Last Updated:** 2026-08-03  
**Related:** `docs/PROJECT_SPEC.md`, `docs/GROUP_UX_SPEC.md`, `docs/PROJECT_STATUS.md`

---

## 1. Design Philosophy

Yum Diary 是一款療癒系、手帳風的美食日記 App。

整體風格：

- 溫暖
- 留白
- 柔和
- 可愛但不幼稚
- 不追求 Material Design
- 不追求商業後台風格

使用者應該有：

「翻閱自己的美食手帳」

而不是：

「管理資料庫」

---

## 2. Design Principles

所有畫面遵守：

- 一個畫面只做一件事
- Header 只負責切換，不負責管理
- 管理功能集中於 Settings
- 操作越少越好
- 避免使用者思考

---

## 3. Color Language

每種資訊有固定顏色語言。不要混用顏色。不要不同元件使用相同語意色。

| 元件 | 顏色 | 語意 |
|------|------|------|
| Date Badge | 粉紅色 | 時間 |
| Food Chip | 奶茶色 | 餐點內容 |
| Status Badge — Open | 綠色 | 營業中 |
| Status Badge — Closed | 紅色 | 已打烊 |
| Status Badge — Holiday | 橘色 | 公休日 |
| Status Badge — Unknown | 灰色 | 未提供 |
| Rating | 黃色星星 | 評分 |

---

## 4. Component Rules

### 4.1 Card

全站統一：

- 大圓角
- 柔和陰影
- 暖色背景

### 4.2 Food Chip

代表：本次點餐。

規則：

- 奶茶色
- Capsule
- Auto Width
- Auto Wrap
- 不使用 Icon
- 不固定寬度

顯示：

| 場景 | 規則 |
|------|------|
| Timeline | 最多三個 |
| Detail | 全部 |

### 4.3 Date Badge

固定粉紅色。

代表日期。

不要拿來表示其他資訊。

### 4.4 Status Badge

固定狀態：

- Open
- Closed
- Holiday
- Unknown

全部共用：`StatusBadge`。

### 4.5 Button

| 類型 | 風格 |
|------|------|
| Primary | 品牌色 |
| Danger | 紅色 |
| Secondary | Outline |

不要新增不同風格 Button。

### 4.6 Empty State

所有 Empty State 保持：溫暖、鼓勵。

避免：

- "No Data"
- "Empty"

建議：提供下一步行動。

例如：

- 新增第一家餐廳
- 開始記錄第一篇美食日記

### 4.7 Bottom Sheet

所有 Bottom Sheet 保持一致：

- 圓角
- 動畫
- Padding
- 關閉方式

### 4.8 Dialog

用於需確認的操作，例如：

- 刪除／移除資料
- 離開群組、解散群組
- 封存餐廳、恢復封存

一般流程避免不必要 Dialog。

---

## 5. Photo Rules

| 類型 | 語意 |
|------|------|
| Restaurant Cover | 代表餐廳 |
| Diary Photo | 代表本次用餐 |

不要混用。

沒有 Diary Photo 時，不要使用 Restaurant Cover 當替代。

---

## 6. Timeline Rules

Timeline：提供快速回憶。不要塞過多資訊。

| 內容 | 規則 |
|------|------|
| 照片 | 有才顯示 |
| Food | 最多三項 |
| 心得 | 限制行數 |

完整資訊：Detail。

---

## 7. Navigation Rules

| 區域 | 職責 |
|------|------|
| Header | 切換目前 Group |
| Bottom Navigation | 首頁、餐廳、FAB 新增、收藏、設定 |
| Settings | 群組管理、位置、Decide 條件、已封存餐廳、登出等 |

不要把管理入口放 Header。

美食日記、揪團點餐、常吃餐廳等由 Home 入口進入（不佔 bottom tab）。

### 7.1 History / navigation

編輯完成後避免同一頁 push 兩次 detail，造成「返回又回到編輯」。

- 編輯成功：優先 `router.back()` 或 `replace`，勿再 `push` 回 Detail
- 新增餐廳 Wizard 完成：`replace` 到 Detail／列表

---

## 8. Future Components

之後新增：

- Tag Chip
- Category Chip
- Avatar
- Skeleton

保持與 Food Chip 相同設計語言。

---

## 9. UX Principles

保持：

- 一致
- 簡單
- 留白
- 療癒

避免：

一次出現太多操作。

使用者應該感覺：

正在翻閱一本自己的美食日記。
