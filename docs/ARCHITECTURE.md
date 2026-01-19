# Technical Architecture Document
## Lunch Order System

**Version:** 1.0  
**Last Updated:** January 2026

---

## 1. System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    WebApp.html                             │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │
│  │  │  Order  │ │My Order │ │   All   │ │  Admin  │         │  │
│  │  │   Tab   │ │   Tab   │ │ Orders  │ │   Tab   │         │  │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘         │  │
│  │       │           │           │           │               │  │
│  │  ┌────▼───────────▼───────────▼───────────▼────┐         │  │
│  │  │           google.script.run                  │         │  │
│  │  │        (Async API Calls)                     │         │  │
│  │  └────────────────────┬────────────────────────┘         │  │
│  └───────────────────────┼────────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Code.gs                               │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │  │
│  │  │    Menu     │ │   Order     │ │    Admin    │         │  │
│  │  │  Functions  │ │  Functions  │ │  Functions  │         │  │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘         │  │
│  │         │               │               │                 │  │
│  │  ┌──────▼───────────────▼───────────────▼──────┐         │  │
│  │  │        SpreadsheetApp / LockService         │         │  │
│  │  └───────────────────────┬─────────────────────┘         │  │
│  └──────────────────────────┼────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Google Spreadsheet                        │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │
│  │  │  Menu   │ │ template │ │ 20260119 │ │ 20260118 │ ...  │  │
│  │  │  Sheet  │ │  Sheet   │ │  Sheet   │ │  Sheet   │      │  │
│  │  └─────────┘ └──────────┘ └──────────┘ └──────────┘      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | HTML5, CSS3, JavaScript | User interface |
| Backend | Google Apps Script | Business logic, API |
| Data | Google Sheets | Persistent storage |
| Hosting | Google Apps Script Web App | Deployment |

---

## 2. Component Architecture

### 2.1 Frontend Components (WebApp.html)

```
WebApp.html
├── Header
│   ├── Brand (logo, title, location)
│   ├── Date Badge
│   └── Help Button
├── Tab Navigation
│   ├── Order Tab (default)
│   ├── My Order Tab
│   ├── All Orders Tab
│   └── Admin Tab
├── Order Tab Content
│   ├── Edit Mode Banner (conditional)
│   ├── Name Input Card
│   ├── Payment Status (conditional)
│   ├── Menu Container
│   │   └── Category Cards
│   │       └── Menu Items (clickable)
│   ├── Selection Card
│   ├── Rice Options
│   ├── Notes Input
│   ├── Price Display
│   └── Action Buttons
├── My Order Tab Content
│   ├── Name Input
│   └── Order Result Display
├── All Orders Tab Content
│   ├── Refresh Button
│   ├── Orders Summary
│   └── Orders Grid
├── Admin Tab Content
│   ├── Status Display
│   ├── Open/Close Buttons
│   ├── Menu Import Button
│   └── Reports Section
└── Modals
    ├── Welcome/Help Modal
    ├── Import Menu Modal
    ├── Order Summary Modal
    ├── Payment QR Modal
    ├── Copy Order Modal
    └── Item Note Modal
```

### 2.2 Backend Functions (Code.gs)

```
Code.gs
├── Configuration
│   └── CONFIG object
├── Web App Entry
│   ├── doGet(e)
│   └── include(filename)
├── Spreadsheet Access
│   └── getSpreadsheet()
├── Menu Functions
│   ├── getMenuData()
│   ├── getMenuWithCounts()
│   ├── getMenuForSidebar()
│   ├── getMenuItemCounts()
│   ├── getAutoEmoji(itemName)
│   ├── getDefaultMenuData()
│   ├── importMenuToSheet(rawText)
│   ├── updateMenuFromF2()
│   ├── parseRawMenuTextToCategories(rawText)
│   └── parseRawMenuText(rawText)
├── Ordering Status
│   ├── getOrderingStatus()
│   ├── closeOrderingForToday()
│   ├── formatDateForDisplay(dateStr)
│   └── createNewDayOrderSheet()
├── Order Functions
│   ├── getTodaySheetName()
│   ├── getOrCreateTodaySheet()
│   ├── getTodaySheetOnly()
│   ├── setupNewOrderSheet(sheet)
│   ├── extractChineseName(itemName)
│   ├── submitOrder(orderData)
│   ├── calculatePrice(items)
│   ├── findUserOrderRow(sheet, userName)
│   ├── findNextEmptyRow(sheet)
│   ├── cancelOrderByName(userName)
│   ├── updateAdminColumnNumbers(sheet)
│   ├── getOrderByName(userName)
│   ├── markOrderAsPaid(userName)
│   ├── unmarkOrderAsPaid(userName)
│   └── getTodayOrders()
├── Report Functions
│   ├── generateOrderSummary()
│   └── showOrderSummaryDialog()
├── UI Functions (Spreadsheet)
│   ├── onOpen()
│   ├── updateMenuFromF2WithAlert()
│   └── showWebAppUrl()
└── Utility Functions
    ├── getTodayDate()
    ├── isOrderTimeValid()
    └── getPaymentQRImage()
```

---

## 3. Data Architecture

### 3.1 Spreadsheet Schema

#### Menu Sheet

| Column | Purpose | Format |
|--------|---------|--------|
| A | Chicken items | Category header + items |
| B | Pork/Seafood items | Category header + items |
| C | Egg/Others items | Category header + items |
| D | Vegetable/Food items | Category header + items |
| E | (unused) | - |
| F | Raw menu text (F2) | WhatsApp paste |

**Category Format:**
```
鸡 Chicken              ← Category header (bold, green background)
- 咖喱鸡 curry chicken  ← Items prefixed with "- "
- 冬菇焖姜鸡 mushroom...
```

**Menu Split Logic:**
- Column A: Everything before "猪" keyword
- Column B: From "猪" to before "蛋"
- Column C: From "蛋" to before "菜 Veg"
- Column D: From "菜 Veg" to end

#### Template Sheet

| Column | Header | Purpose |
|--------|--------|---------|
| A | (row number) | Pre-filled 1-100 |
| B | Who? | User name |
| C | What? | Order details |
| D | How much $? | Price |
| E | Paid 💵 | Payment status |
| F | (Location header) | Admin summary |
| G | (Instructions) | User instructions |

#### Daily Order Sheets (YYYYMMDD)

| Column | Row 1 | Row 2+ |
|--------|-------|--------|
| A | - | Row number |
| B | Who? | User name |
| C | What? | Order in Chinese |
| D | How much $? | Price (number) |
| E | Paid 💵 | 💵 or empty |
| F | CLOSED/Location | Admin format |
| G | Instructions | - |

**Admin Format (Column F):**
```
1. 妈蜜鸡 + 蒸水蛋 (少饭) 8
```

### 3.2 Data Flow

#### Order Submission Flow
```
User Input → submitOrder() → LockService → Write to Sheet → Release Lock → Response
              │
              ├─ Validate name & items
              ├─ Check ordering status
              ├─ Find/verify row
              ├─ Extract Chinese names
              ├─ Calculate price
              └─ Write all columns
```

#### Menu Import Flow
```
WhatsApp Text → importMenuToSheet() → Save to F2 → updateMenuFromF2() → Parse → Write A-D
                                                         │
                                                         ├─ Split by ✔️ markers
                                                         ├─ Extract items (- prefix)
                                                         └─ Distribute to columns
```

---

## 4. Concurrency Handling

### 4.1 Lock Strategy

All write operations use `LockService.getScriptLock()`:

```javascript
function submitOrder(orderData) {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(10000)) {  // 10 second timeout
      return { success: false, message: 'System is busy...' };
    }
    
    // ... perform operations ...
    
    lock.releaseLock();
    return { success: true, ... };
    
  } catch (error) {
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: error.message };
  }
}
```

### 4.2 Race Condition Prevention

**New Order:**
1. Acquire lock
2. Find empty row
3. Verify row still empty (double-check)
4. Check if user already has order
5. Write order
6. Release lock

**Edit Order:**
1. Acquire lock
2. Find user's row
3. Verify row still belongs to user
4. Write updates
5. Release lock

**Cancel Order:**
1. Acquire lock
2. Find user's row
3. Verify ownership
4. Delete row
5. Insert empty row at end
6. Re-number admin column
7. Release lock

---

## 5. Security Considerations

### 5.1 Current Model

**Trust Model:** The system operates on a trust basis:
- No user authentication
- Users identify by name (honor system)
- Any user can technically edit any order (by entering their name)
- Admin functions accessible to all (but require knowledge)

**Rationale:**
- Internal team use only
- Low-stakes application (lunch orders)
- Simplicity over security

### 5.2 Input Validation

| Field | Validation |
|-------|------------|
| User name | Non-empty, trimmed |
| Items | Non-empty array |
| Price | Calculated or bounded 0-15 |
| Notes | Trimmed, no length limit |

### 5.3 Data Protection

- Google Sheets access via Apps Script service account
- Web app runs as deployer's account
- No PII beyond names stored

---

## 6. Performance Considerations

### 6.1 Optimization Strategies

**Batch Reads:**
```javascript
// Read all data at once, not cell by cell
const dataRange = sheet.getRange(START_ROW, 1, MAX_ORDERS, 4);
const values = dataRange.getValues();
```

**Batch Writes:**
```javascript
// Write multiple values in one call
sheet.getRange(row, COL_WHO).setValue(userName);
sheet.getRange(row, COL_WHAT).setValue(orderString);
// ... etc
```

**Client-side Caching:**
```javascript
// Remember user name in localStorage
localStorage.setItem('lunchOrderUserName', name);
```

**Auto-refresh Throttling:**
```javascript
// Refresh counts every 30 seconds
setInterval(refreshMenuCounts, 30000);
```

### 6.2 Performance Metrics

| Operation | Typical Time |
|-----------|--------------|
| Page load | 1-2 seconds |
| Menu load | 500-800ms |
| Submit order | 1-2 seconds |
| Count refresh | 300-500ms |
| Summary generation | 500ms |

---

## 7. Error Handling

### 7.1 Error Categories

| Category | Example | Handling |
|----------|---------|----------|
| User Error | Empty name | Show friendly message |
| Conflict | Row taken | Retry with different row |
| System Busy | Lock timeout | "Try again" message |
| Server Error | Script error | Show error details |

### 7.2 Client-side Error Display

```javascript
function showStatus(message, type) {
  const el = document.getElementById('statusMessage');
  el.textContent = message;
  el.className = 'status ' + type; // 'success' or 'error'
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
```

### 7.3 Server-side Error Response

```javascript
// All functions return consistent format
return { 
  success: true/false, 
  message: 'User-friendly message',
  // Optional: additional data
  row: 5,
  isEdit: true
};
```

---

## 8. Deployment Architecture

### 8.1 Deployment Model

```
┌─────────────────────────────────────────┐
│        Google Apps Script               │
│  ┌─────────────────────────────────┐   │
│  │     Deployment Settings         │   │
│  │  - Execute as: Me (owner)       │   │
│  │  - Who has access: Anyone       │   │
│  └─────────────────────────────────┘   │
│                 │                       │
│                 ▼                       │
│  ┌─────────────────────────────────┐   │
│  │      Web App URL                │   │
│  │  https://script.google.com/...  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 8.2 Deployment Steps

1. Create Google Spreadsheet
2. Open Extensions → Apps Script
3. Create `Code.gs` and `WebApp.html`
4. Set `CONFIG.SPREADSHEET_ID`
5. Deploy → New deployment
6. Configure: Web app, Execute as me, Anyone
7. Authorize required scopes
8. Copy deployment URL

### 8.3 Update Process

1. Edit code in Apps Script editor
2. Deploy → Manage deployments
3. Edit existing deployment
4. Select "New version"
5. Deploy (URL remains same)

---

## 9. Configuration Reference

### 9.1 CONFIG Object

```javascript
const CONFIG = {
  SPREADSHEET_ID: '',           // Required: Your spreadsheet ID
  DEFAULT_PRICE: 7,             // Default price calculation
  MENU_SHEET: 'Menu',           // Menu sheet name
  TEMPLATE_SHEET: 'template',   // Template sheet name
  ORDER_START_ROW: 2,           // First data row
  MAX_ORDERS: 100,              // Maximum orders per day
  COLUMNS: {
    ROW_NUM: 1,  // A
    WHO: 2,      // B
    WHAT: 3,     // C
    PRICE: 4,    // D
    PAID: 5,     // E
    ADMIN: 6     // F
  }
};
```

### 9.2 Environment Variables

None - all configuration in code.

### 9.3 External Dependencies

| Dependency | Purpose | Source |
|------------|---------|--------|
| Google Fonts | Inter, Noto Sans SC | fonts.googleapis.com |
| Payment QR | Payment image | Google Drive |

---

## 10. API Reference

### 10.1 Client-to-Server Functions

| Function | Parameters | Returns |
|----------|------------|---------|
| `getMenuForSidebar()` | - | Menu object with counts |
| `getOrderingStatus()` | - | Status object |
| `getTodayDate()` | - | YYYYMMDD string |
| `submitOrder(data)` | orderData | Result object |
| `cancelOrderByName(name)` | userName | Result object |
| `getOrderByName(name)` | userName | Order object |
| `markOrderAsPaid(name)` | userName | Result object |
| `getTodayOrders()` | - | Orders array |
| `createNewDayOrderSheet()` | - | Result object |
| `closeOrderingForToday()` | - | Result object |
| `importMenuToSheet(text)` | rawText | Result object |
| `generateOrderSummary()` | - | Summary string |
| `getPaymentQRImage()` | - | Image URL |

### 10.2 Response Formats

**Success Response:**
```javascript
{
  success: true,
  message: '✅ Order placed!\n\n👤 Name\n🍱 Items\n💰 RM8',
  row: 5,
  isEdit: false
}
```

**Error Response:**
```javascript
{
  success: false,
  message: 'Ordering is closed. No more orders can be added.'
}
```

**Order Data (submit):**
```javascript
{
  name: 'John',
  items: ['咖喱鸡', '蒸水蛋'],
  riceOption: 'less',      // 'normal' | 'less' | 'none'
  notes: 'extra spicy',
  price: 8
}
```

---

## 11. Monitoring & Debugging

### 11.1 Logging

```javascript
// Server-side logging
console.log('Processing order:', userName);
console.error('Error:', error);

// View logs in Apps Script editor:
// View → Logs (legacy) or Executions
```

### 11.2 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "System is busy" | Lock contention | Wait and retry |
| Orders not showing | Sheet not created | Open ordering first |
| Menu empty | No Menu sheet | Create Menu sheet |
| Price wrong | Manual adjustment | Reset or recalculate |

### 11.3 Debug Mode

Enable verbose logging in browser console:
```javascript
// In browser console
localStorage.setItem('lunchOrder_debug', 'true');
```
