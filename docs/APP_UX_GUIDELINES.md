# Yum Diary UI / UX Guidelines

**Product:** Yum Diary  
**Version:** v1.0  
**Last Updated:** 2026-07-16  
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

只有不可逆操作才使用，例如：

- 刪除
- 離開群組
- 解散群組

一般流程避免 Dialog。

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
| Bottom Navigation | 內容導向 |
| Settings | 所有管理功能 |

不要把管理入口放 Header。

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
