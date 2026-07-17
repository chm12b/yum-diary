# Yum Diary Project Status

Version：v0.5.0-dev

Last Updated：2026-07-17

---

# Overall Progress

| Module | Status |
|---------|--------|
| Foundation | ✅ Completed |
| Restaurant | ✅ Completed |
| Diary | ✅ Completed |
| Group | 🚧 In Progress |
| Decide（今天吃什麼） | ⬜ Planned |
| Settings | 🚧 In Progress |

---

# Current Sprint

## Milestone 4 - Group Management

### Recently Completed

- ✅ Settings MVP
- ✅ Group Management
- ✅ Group Detail
- ✅ Header Group Switch
- ✅ Current Group Integration

### Current Focus

- 🚧 Create Group（功能串接）
- ⬜ Invite Member
- ⬜ Join Group

---

# Completed Modules

## ✅ Foundation

- Supabase
- Authentication
- Group Foundation
- Current Group
- Row Level Security（RLS）
- Group-based Permission

---

## ✅ Restaurant

### Restaurant

- Restaurant CRUD
- Restaurant List
- Restaurant Detail
- Restaurant Edit

### Google Integration

- Google Search API
- Google Detail API
- Google Sync
- Auto Fill
- Google Rating
- Google Rating Count
- Google Price Level

### Business

- Business Hours
- Open Status（StatusBadge）
- Holiday Detection

### Photos

- Restaurant Cover Photo
- Menu Gallery
- Menu Upload
- Menu Delete
- Menu Preview

### Storage

- Storage Foundation
- Standard Path Convention
- Cover.webp
- Menu-01.webp ~ Menu-10.webp

### UX

- Toast
- Empty State
- Placeholder
- Lightbox

---

## ✅ Diary

### Diary

- Diary CRUD
- Diary Detail
- Diary Edit

### Photos

- Diary Photo
- Photo Gallery
- Photo Upload
- Photo Delete

### Ordered Food

- Ordered Food
- Food Chip
- Timeline Chip Layout

---

# Group Progress

## ✅ Completed

- Settings MVP
- Group Management
- Group Detail
- Header Group Switch
- Current Group Integration
- Create Group
- Invite Member
- Join Group

## 🚧 In Progress



## ⬜ Planned
- Member List
- Rename Group
- Leave Group
- Delete Group

---

# Backlog

## Restaurant

- Image Optimization
- Cover Crop
- Image Compression
- Blur Placeholder
- Progressive Image Loading

## Future

- Decide（今天吃什麼）
- Wish List
- Nearby Restaurant
- Notification
- AI Recommendation

---

# Notes

Restaurant Module 已完成。

Diary Module 已完成 MVP。

目前正式進入 Group Management 開發階段。

Current Group（profiles.current_group_id）已作為整個 App 的唯一 Group Source of Truth。

Header 僅負責切換 Group。

所有 Group 管理功能集中於 Settings。