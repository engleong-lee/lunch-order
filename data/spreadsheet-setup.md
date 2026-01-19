# Spreadsheet Setup Guide

This guide explains how to set up the Google Spreadsheet for the Lunch Order System.

---

## Required Sheets

### 1. Menu Sheet

**Name:** `Menu`

**Structure:**
| Column | Row 1 (Header) | Rows 2+ |
|--------|----------------|---------|
| A | 鸡 Chicken | - 咖喱鸡 curry chicken |
| B | 猪 pork | - 咸鱼花腩 pork belly |
| C | 蛋 Egg | - 蒸水蛋 steamed egg |
| D | 菜 Vegetable | - 生菜 lettuce |
| E | (empty) | |
| F | (empty) | Raw WhatsApp text (F2) |

**Notes:**
- Categories in Row 1 should be bold with light green background (#c8e6c9)
- Items start with "- " (dash and space)
- Column F2 stores the raw WhatsApp menu text (source of truth)
- Columns A-D are parsed from F2 by the import function

**Example Content:**
```
A1: 鸡 Chicken
A2: - 咖喱鸡 curry chicken
A3: - 冬菇焖姜鸡 mushroom braised ginger chicken
A4: - 药材蒸鸡 herbal steamed chicken

B1: 猪 pork
B2: - 咸鱼花腩 pork belly salted fish
B3: - 辣椒小炒肉 chili pork

C1: 蛋 Egg
C2: - 洋葱炒蛋 onion egg
C3: - 蒸水蛋 steamed egg
C4: 配料 others
C5: - 马铃薯 potato
C6: - 日本豆腐 Japanese tofu

D1: 菜 Vegetable
D2: - 小白菜 baby bok choy
D3: - 生菜 lettuce
D4: food食物 (❌add portion )
D5: - 烧鸡胸饭 rm8 roasted chicken breast rice
D6: - 烧鸡二度 rm9 roasted chicken drumstick rice
```

---

### 2. Template Sheet

**Name:** `template`

**Structure:**
| Column | Row 1 | Purpose |
|--------|-------|---------|
| A | (empty) | Row numbers |
| B | Who? | User name column |
| C | What? | Order details column |
| D | How much $? | Price column |
| E | Paid 💵 | Payment status column |
| F | TRX Exchange 106, Level 17 | Admin summary column |
| G | (Ignore column F, it's for admin purpose) | Instructions |

**Pre-filled Content:**
- Column A, rows 2-101: Numbers 1-100
- Column G, rows 2-6: Instructions for users

**Full Template:**
```
A1: (empty)    B1: Who?    C1: What?    D1: How much $?    E1: Paid 💵    F1: TRX Exchange 106, Level 17    G1: (Ignore column F, it's for admin purpose)
A2: 1          B2: (empty) C2: (empty)  D2: (empty)        E2: (empty)    F2: (empty)                       G2: Place your order before 10am
A3: 2          ...                                                                                          G3: Check today's menu in the "Menu" sheet
A4: 3                                                                                                       G4: Example on how to order see below
...                                                                                                         G5: Food will arrive at P4 car park between 12 - 12:15pm
A101: 100                                                                                                   G6: Example order:
```

**Formatting:**
- Row 1: Bold, light gray background (#f3f3f3)
- Column widths: A(30), B(100), C(200), D(80), E(60), F(250), G(300)

---

## Daily Order Sheets

Daily sheets are created automatically by the system with format `YYYYMMDD` (e.g., `20260119`).

**Created From:** Cloned from `template` sheet

**Special Cells:**
- `F1`: Contains "CLOSED" when ordering is closed (otherwise location header)
- All other cells follow template structure

**Example (20260119):**
```
A1: (empty)    B1: Who?        C1: What?                         D1: How much $?  E1: Paid 💵  F1: CLOSED
A2: 1          B2: John        C2: 妈蜜鸡 + 蒸水蛋 (少饭)            D2: 8           E2: 💵       F2: 1. 妈蜜鸡 + 蒸水蛋 (少饭) 8
A3: 2          B3: Jane        C3: 咖喱鸡 + 生菜 + 煎蛋              D3: 8           E3: 💵       F3: 2. 咖喱鸡 + 生菜 + 煎蛋 8
A4: 3          B4: (empty)     C4: (empty)                        D4: (empty)      E4: (empty)  F4: 3.
```

---

## Spreadsheet Settings

### Sharing
- Share with team members who need access
- Web app accesses via service account (no sharing needed for end users)

### Protection (Optional)
Consider protecting:
- `Menu` sheet (admin edit only)
- `template` sheet (admin edit only)
- Column F in order sheets (admin only)

### Naming
- Spreadsheet name can be anything
- Sheet names must match exactly:
  - `Menu` (case-sensitive)
  - `template` (lowercase)

---

## Getting the Spreadsheet ID

The Spreadsheet ID is in the URL:

```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

Example:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit
                                       ^^^^^^^^^^^
                                       This is the ID
```

Copy this ID to `CONFIG.SPREADSHEET_ID` in `Code.gs`.

---

## Menu Format Reference

### WhatsApp Menu Format (Input)

The vendor sends menus in this format:

```
✔️鸡 Chicken
- 咖喱鸡 curry chicken 
- 冬菇焖姜鸡 mushroom braised ginger chicken
- 药材蒸鸡 herbal steamed chicken

✔️猪 pork
- 咸鱼花腩 pork belly salted fish
- 辣椒小炒肉 chili pork

✔️蛋 Egg
- 洋葱炒蛋 🧅 onion egg
- 蒸水蛋 steamed egg

✔️配料 others
- 马铃薯 🥔potato
- 日本豆腐 Japanese tofu

✔️菜 Vegetable
- 小白菜🥬 baby bok choy
- 生菜 lettuce

✔️food食物 (❌add portion )
- 烧鸡胸饭 rm8 roasted chicken breast rice
- 烧鸡二度 rm9 roasted chicken drumstick rice
```

### Parsing Rules

1. **Category markers:** Lines starting with `✔️` or `✔`
2. **Items:** Lines starting with `- ` (dash + space)
3. **Fixed prices:** Items containing `rm8`, `rm9` etc.
4. **Column split:** Based on keywords (猪, 蛋, 菜 Veg)

---

## Troubleshooting

### Menu Not Showing
1. Check `Menu` sheet exists
2. Verify items start with "- "
3. Check for hidden columns

### Template Issues
1. Ensure sheet named exactly `template`
2. Verify row numbers in column A
3. Check headers in row 1

### Daily Sheet Problems
1. Check sheet name format (YYYYMMDD)
2. Verify it was cloned from template
3. Check F1 for "CLOSED" status

---

## Sample Spreadsheet

The file `Lunch_ordering_TRX_KL_17.xlsx` contains:
- Working Menu sheet
- Template sheet
- 77 historical order sheets (Oct 2025 - Jan 2026)

Use this as reference when setting up a new spreadsheet.
