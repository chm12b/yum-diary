# GROUP_ORDER_SPEC.md

# Yum Diary - Group Order Specification

Version: 1.1  
Last Updated: 2026-08-03  
Status: ✅ MVP 已上線

---

# Purpose

Group Order 提供多人共同點餐。

由一位使用者（Host）發起；其他人可自由加入點餐。

Restaurant 提供店家資訊；Menu 提供可點品項。  
Group Order 僅代表一次點餐活動（不取代收藏／日記）。

---

# Roles

## Host

- 發起點餐
- 分享點餐連結
- 查看所有人訂單
- 停止點單（進入 CLOSED）
- 重新開放截止時間
- 完成訂單（COMPLETED）

## Participant

- 加入點餐
- OPEN 時修改／刪除自己的品項
- 不可改他人訂單／不可完成活動

---

# Entry（實作現況）

## 發起點餐

- **Restaurant Detail** → 「🍽 揪團點餐」
- 前提：該店需已有至少一筆菜單品項；否則 toast 引導去建菜單

建立欄位：

- 標題（預設常為「{店名} 點餐」）
- 截止時間
- ~~說明~~（選填欄位已自建立 UI 移除；DB 欄位 `description` 仍可為 null）

建立後導向 `/orders/{id}`。

## 入口：首頁

- 卡片「揪團點餐」→ 永遠進入 **Orders Hub**（`/orders`）
- 無群組時卡片 disabled
- Hub 顯示進行中與歷史，不在首頁顯示餐廳／截止細節

## Detail Header

- 點餐活動標題（不可點）
- 第二行餐廳名稱 → 可點進入 Restaurant Detail（`/restaurants/{id}`）

---

# Status

```
OPEN → CLOSED → COMPLETED
```

| Status | 行為 |
|--------|------|
| OPEN | 可點餐／改自己的項目；Host 可停止點單 |
| CLOSED | 不可改餐點；Host 可延長截止（重開 OPEN）或完成 |
| COMPLETED | 唯讀；可導向寫美食日記 |

截止時間可自動轉 CLOSED（依端上狀態檢查／刷新）。

`completed_at` 記錄完成時間。

---

# Main Screens

| 路徑 | 用途 |
|------|------|
| `/orders` | Hub：進行中 + 入口歷史 |
| `/orders/history` | 歷史列表 |
| `/orders/[id]` | 活動 Detail、參與者卡、Host 操作 |
| `/orders/[id]/my-order` | 我的菜單瀏覽與加點 |
| `/orders/[id]/summary` | 訂單總覽（依人／依品項、電話地址） |

---

# Menu

使用結構化 `menu_items` + Menu Browse UI。  
數量用 Quantity Stepper；備註可選。

---

# Diary Link

COMPLETED 後，使用者可依該 `group_order_id` 建立美食日記（每使用者每活動一筆 unique）。

`records.group_order_id`（migration `034`）。

---

# Archive 規則

封存餐廳：

- **不可**再建立新的 Group Order
- 既有歷史訂單仍可開啟查看

---

# Out of v1

- AA 分帳
- 外送／金流串接
- 推播
- 點餐留言／催單
- 首頁「直接進最近一場 OPEN」（改為固定進 Hub）

---

# Related

- `docs/DATABASE.md` — `group_orders` / participants / items
- `docs/FEATURES.md` — 功能狀態
- `docs/PROJECT_STATUS.md` — 進度快照
