# Group UX Spec

**Product:** Yum Diary  
**Version:** v1.1  
**Last Updated:** 2026-08-03  
**Related:** `docs/PROJECT_SPEC.md`, `docs/PROJECT_STATUS.md`

---

## 1. Design Principle

Group 是 Yum Diary 的核心。

Restaurant、Diary、Menu、Record、Group Order 全部屬於 Group。

使用者永遠在「目前 Group」下操作。

新增 Restaurant／Diary 時不需再選 Group。

`profiles.current_group_id` = 唯一 Source of Truth。

---

## 2. Header

Header 只負責：切換目前 Group。

Header **不提供**：

- 建立 Group
- 加入 Group
- Group Setting 入口（改走 Settings）

---

## 3. Bottom Navigation（實作）

| Icon | 頁面 |
|------|------|
| 🏠 | 首頁 `/` |
| 🍽 | 餐廳列表 `/restaurants` |
| ＋ | 新增（FAB → 新增餐廳等） |
| ❤️ | 收藏 `/favorites` |
| ⚙️ | 設定 `/settings` |

美食日記從首頁入口 `/records`，不佔 bottom tab。

---

## 4. Settings（實作）

- 個人資料
- 群組管理
- 預設位置（群組 reference location）
- 今天吃什麼（Decide 條件）
- 已封存餐廳
- 關於 Yum Diary
- 登出

---

## 5. Group Management

頁面：我的群組

- 列出已加入群組
- 建立新群組
- 加入其他群組（邀請碼）

---

## 6. Create Group

輸入群組名稱 → 建立後自動加入並切換為目前群組。

---

## 7. Join Group

- 邀請碼
- 邀請連結 `/join/{code}`（已支援；未登入先導 auth 再 join）

**不使用：** Email 搜尋帳號

---

## 8. Group Detail

- 成員列表
- 邀請成員
- 修改名稱
- 離開群組
- Owner：解散群組

---

## 9. Group Rules

- 不同 Group 即便是同一店，也是不同 Restaurant row
- Google Place ID 可相同；Restaurant ID 不共用
- 列表／日記／決定等預設只讀目前群組

---

## 10. Future

- Restaurant 分享到其他 Group
- 複製 Restaurant
- Group Cover／Avatar
- 多層角色權限

---

## 11. UX Principles

| 區域 | 職責 |
|------|------|
| Header | 只負責切換 |
| Settings | 管理 |
| Bottom Nav | 內容導向 |

---

## 12. Non-Goals (v1)

- Group 聊天
- 複雜角色體系
- 跨群組單一餐廳實體
