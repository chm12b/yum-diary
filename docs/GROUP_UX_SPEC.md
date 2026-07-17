# Group UX Spec

**Product:** Yum Diary  
**Version:** v1.0  
**Last Updated:** 2026-07-16  
**Related:** `docs/PROJECT_SPEC.md`, `docs/PROJECT_STATUS.md`

---

## 1. Design Principle

Group 是 Yum Diary 的核心。

Restaurant、Diary、Menu、Record 全部屬於 Group。

使用者永遠是在「目前 Group」下操作。

新增 Restaurant、Diary 時，不需要再次選擇 Group。

---

## 2. Header

Header 只負責：切換目前 Group。

例如：

🐰 我的小家庭 ▼

點擊後：

- ✓ 我的小家庭
- 🍜 公司午餐
- 🎭 劇本殺

Header **不提供**：

- 建立 Group
- 加入 Group
- Group Setting

保持功能單一。

---

## 3. Bottom Navigation

目前：

| Icon | 頁面 |
|------|------|
| 🏠 | 首頁 |
| 📖 | 美食日記 |
| ❤️ | Future：今天吃什麼 |
| ⚙️ | 設定 |

---

## 4. Settings

設定頁提供：

- 個人資料（Future）
- 群組管理
- 預設位置
- 外觀（Future）
- 關於 Yum Diary

---

## 5. Group Management

頁面：我的群組

列出目前加入的所有 Group。

例如：

- 🐰 我的小家庭
- 🍜 公司午餐
- 🎭 劇本殺

下方提供：

- ➕ 建立新群組
- 🔑 加入其他群組

---

## 6. Create Group

建立群組只需要：群組名稱。

建立完成後：

1. 自動加入
2. 自動切換
3. 回首頁

---

## 7. Join Group

加入方式：

- 邀請碼
- 邀請連結（Future）

**不使用：**

- Email
- 搜尋帳號

---

## 8. Group Detail

點擊某個 Group，提供：

- 👥 成員
- 📨 邀請成員
- ✏️ 修改名稱
- 🚪 離開群組

若為 Owner，增加：

- 🗑 解散群組

---

## 9. Group Rules

- Restaurant 屬於 Group
- Diary 屬於 Group
- Menu 屬於 Group
- Record 屬於 Group

不同 Group 即使收藏同一家餐廳，也建立不同 Restaurant。

資料完全獨立。

- Google Place ID 可相同
- Restaurant ID 不共用

---

## 10. Future

- Restaurant：分享到其他 Group
- 複製 Restaurant
- 邀請連結
- Group Cover
- Group Avatar

---

## 11. UX Principles

| 區域 | 職責 |
|------|------|
| Header | 只負責切換 |
| Settings | 只負責管理 |

Group 代表一起吃飯的人。

不要把管理功能放進 Header。

保持操作簡單、一致。

---

## 12. Non-Goals (v1)

以下功能不是 MVP：

- Restaurant 分享到其他 Group
- Restaurant 複製
- Group Cover
- Group Avatar
- Group 權限管理
- Group 管理員
- 多層角色
- 群組聊天
