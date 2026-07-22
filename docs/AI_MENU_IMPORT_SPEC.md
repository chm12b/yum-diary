# AI_MENU_IMPORT_SPEC.md

# Yum Diary - AI Menu Import Specification

Version: 1.0

---

## Purpose

將餐廳菜單整理成 Yum Diary 可匯入的 JSON。

AI 的工作只有：

1. 理解菜單
2. 整理商品
3. 回傳合法 JSON

不要回覆任何說明文字。

不要輸出 Markdown。

不要輸出 ```json。

只能輸出 JSON。

---

# JSON Schema

[
  {
    "category": "純喝茶",
    "name": "古早味紅茶",
    "price": 30
  }
]

---

# Rules

## 1. 只保留真正販售的商品

例如：

✔ 古早味紅茶

✔ 牛肉麵

✔ 薯條

✘ 電話

✘ 地址

✘ Logo

✘ Facebook

✘ Instagram

✘ LINE

✘ QR Code

✘ 外送資訊

✘ 點餐流程

✘ 掃描點餐

✘ 加入購物車

---

## 2. 保留菜單分類

若菜單已有分類：

例如：

純喝茶

找鮮奶

炸物

甜點

請保留。

若沒有分類：

category = "其他"

---

## 3. 價格

price 必須為數字。

例如：

30

55

120

不要：

"$30"

"30元"

---

## 4. 價格無法確認

若 AI 無法 100% 判斷價格：

price = null

不要猜。

---

## 5. Variant 拆解

若商品寫成：

鮮奶紅茶/綠/冬

請拆成：

鮮奶紅茶

鮮奶綠茶

鮮奶冬瓜茶

若無法合理拆解：

保留原字串。

不要亂猜。

---

## 6. 不要建立不存在的商品

若 OCR 沒辨識到：

不要自行補上。

寧可漏掉。

不要幻想。

---

## 7. 加料

例如：

+5

珍珠

椰果

布丁

若菜單明確表示：

為加料區

請不要建立 Menu Item。

---

## 8. 套餐

若套餐為真正販售商品：

保留。

例如：

A套餐

雙人套餐

兒童套餐

---

## 9. 品項名稱

保持店家原本名稱。

不要自行美化。

例如：

SWISS MISS可可奶

不要改成：

瑞士小姐可可

---

## 10. 商品排序

保持菜單原本順序。

不要依價格排序。

不要依名稱排序。

---

## 11. JSON

輸出必須為合法 JSON。

可直接：

JSON.parse()

不得有：

Trailing comma

Markdown

註解

說明文字

---

# Output Example

[
  {
    "category": "純喝茶",
    "name": "古早味紅茶",
    "price": 30
  },
  {
    "category": "純喝茶",
    "name": "原淬鮮綠茶",
    "price": 30
  },
  {
    "category": "找鮮奶",
    "name": "鮮奶紅茶",
    "price": 50
  }
]

---

# Notes

本規格為 Yum Diary AI Menu Import 標準。

任何 AI（ChatGPT、Gemini、Claude…）

只要依照本規格輸出 JSON，

Yum Diary 即可匯入。
