# Product Requirements Document (PRD)
## Lunch Order System v1.0

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Author:** Eng Leong  
**Status:** Released

---

## 1. Executive Summary

### 1.1 Problem Statement

The TRX Exchange 106, Level 17 team orders lunch daily from a local vendor. The current manual process involves:

1. Admin receives WhatsApp menu each morning
2. Admin creates/updates an Excel sheet
3. Colleagues manually edit the shared Excel to add orders
4. Admin compiles orders and sends summary to vendor
5. Admin tracks payment status manually

**Pain Points:**
- Excel editing conflicts when multiple users edit simultaneously
- Mobile Excel editing is cumbersome
- Time-consuming manual compilation (~30+ minutes/day)
- Difficult to track who ordered what in real-time
- Payment tracking is error-prone

### 1.2 Solution

A web-based ordering system that:
- Provides a click-to-order interface (no typing required)
- Handles concurrent users without conflicts
- Works seamlessly on mobile devices
- Auto-generates order summaries
- Maintains historical data in familiar spreadsheet format

### 1.3 Success Metrics

| Metric | Before | Target | Actual |
|--------|--------|--------|--------|
| Admin time per day | 30+ min | <10 min | ~8 min |
| Order completion rate | ~85% | 95%+ | 98% |
| User complaints | Weekly | Rare | None |
| Mobile usability | Poor | Good | Excellent |

---

## 2. Product Goals

### 2.1 Primary Goals

1. **Reduce admin burden** - Automate order compilation and summary generation
2. **Improve user experience** - Enable one-tap ordering from any device
3. **Eliminate conflicts** - Handle concurrent orders without data loss
4. **Maintain transparency** - Real-time visibility of all orders

### 2.2 Secondary Goals

1. Enable backup admins to manage ordering
2. Preserve historical order data for analysis
3. Support payment tracking workflow
4. Allow menu flexibility (daily changes)

---

## 3. User Personas

### 3.1 Primary Admin (Eng Leong)

**Role:** Tech lead, lunch order coordinator  
**Goals:**
- Minimize time spent on lunch admin
- Ensure accurate order compilation
- Track payments efficiently

**Needs:**
- Quick menu import from WhatsApp
- One-click summary generation
- Ability to open/close ordering

### 3.2 Regular User (Team Members)

**Role:** Office staff (15-20 people)  
**Goals:**
- Order lunch quickly
- See what others are ordering
- Edit order if needed before cutoff

**Needs:**
- Mobile-friendly interface
- Remember their name
- Clear confirmation of order

### 3.3 Backup Admin

**Role:** Colleague covering for primary admin  
**Goals:**
- Manage ordering when primary admin is away

**Needs:**
- Simple admin interface
- Clear instructions
- Same capabilities as primary admin

---

## 4. Features & Requirements

### 4.1 Core Features

#### 4.1.1 Menu Display
| Requirement | Priority | Status |
|-------------|----------|--------|
| Display menu items by category | P0 | ✅ Done |
| Show item in Chinese + English | P0 | ✅ Done |
| Support daily menu changes | P0 | ✅ Done |
| Show order count per item | P1 | ✅ Done |
| Show who ordered each item (hover) | P2 | ✅ Done |

#### 4.1.2 Order Placement
| Requirement | Priority | Status |
|-------------|----------|--------|
| Click to select menu items | P0 | ✅ Done |
| Support multiple item selection | P0 | ✅ Done |
| Rice portion options (normal/less/none) | P0 | ✅ Done |
| Special notes field | P1 | ✅ Done |
| Per-item notes (e.g., "茄子x2") | P2 | ✅ Done |
| Auto-calculate price | P0 | ✅ Done |
| Manual price adjustment | P1 | ✅ Done |

#### 4.1.3 Order Management
| Requirement | Priority | Status |
|-------------|----------|--------|
| Submit new order | P0 | ✅ Done |
| Edit existing order | P0 | ✅ Done |
| Cancel order | P0 | ✅ Done |
| Copy another user's order | P2 | ✅ Done |
| Load previous order | P1 | ✅ Done |

#### 4.1.4 Admin Functions
| Requirement | Priority | Status |
|-------------|----------|--------|
| Open daily ordering | P0 | ✅ Done |
| Close ordering | P0 | ✅ Done |
| Import menu from WhatsApp text | P0 | ✅ Done |
| Generate order summary | P0 | ✅ Done |
| Copy summary to clipboard | P1 | ✅ Done |

#### 4.1.5 Order Views
| Requirement | Priority | Status |
|-------------|----------|--------|
| View own order | P0 | ✅ Done |
| View all orders | P0 | ✅ Done |
| Show payment status | P1 | ✅ Done |
| Show order totals | P1 | ✅ Done |

### 4.2 UX Features

| Requirement | Priority | Status |
|-------------|----------|--------|
| Mobile-responsive design | P0 | ✅ Done |
| Remember user name | P1 | ✅ Done |
| Welcome modal for new users | P2 | ✅ Done |
| Guided tour | P2 | ✅ Done |
| Category collapse/expand | P2 | ✅ Done |
| Auto-refresh order counts | P2 | ✅ Done |
| Loading states | P1 | ✅ Done |
| Error messages | P0 | ✅ Done |

### 4.3 Data Management

| Requirement | Priority | Status |
|-------------|----------|--------|
| Create daily sheet automatically | P0 | ✅ Done |
| Hide old order sheets | P2 | ✅ Done |
| Maintain admin column format | P1 | ✅ Done |
| Race condition protection | P0 | ✅ Done |
| Row compaction after cancellation | P1 | ✅ Done |

---

## 5. User Flows

### 5.1 Ordering Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Open URL   │───►│ Enter Name  │───►│Select Items │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Done!    │◄───│   Submit    │◄───│Choose Rice  │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │  Review &   │
                                      │  Add Notes  │
                                      └─────────────┘
```

### 5.2 Admin Daily Flow

```
Morning:
1. Receive WhatsApp menu from vendor
2. Open Admin tab
3. Click "Import Menu" → Paste → Import
4. Click "Open Today's Ordering"
5. Share URL in Teams/WhatsApp

Before Cutoff (10am):
6. Monitor orders in "All Orders" tab

At Cutoff:
7. Click "Close Ordering"
8. Click "Generate Summary"
9. Copy summary to vendor WhatsApp

At Pickup (12pm):
10. Collect payment, mark as paid
```

---

## 6. Data Model

### 6.1 Spreadsheet Structure

**Sheets:**
- `Menu` - Current menu (parsed in A-D, raw in F2)
- `template` - Order sheet template
- `YYYYMMDD` - Daily order sheets (e.g., `20260119`)

### 6.2 Menu Sheet Format

| Column | Content | Example |
|--------|---------|---------|
| A | Chicken items | - 咖喱鸡 curry chicken |
| B | Pork/Seafood items | - 咸鱼花腩 pork belly |
| C | Egg/Others items | - 蒸水蛋 steamed egg |
| D | Vegetable/Set items | - 生菜 lettuce |
| F2 | Raw WhatsApp text | ✔️鸡 Chicken\n- 咖喱鸡... |

### 6.3 Order Sheet Format

| Column | Header | Content |
|--------|--------|---------|
| A | (row #) | 1, 2, 3... |
| B | Who? | User name |
| C | What? | Order items (Chinese) |
| D | How much $? | Price (RM) |
| E | Paid 💵 | 💵 or empty |
| F | (Admin) | Row#. Order Price |

**Special Values:**
- `F1 = "CLOSED"` - Ordering is closed
- Row 1 is header row
- Orders start at row 2

---

## 7. Technical Constraints

### 7.1 Platform Constraints

- **Google Apps Script** execution time limit: 6 minutes
- **Web app** must be accessible without Google login
- **Spreadsheet** size limit: 10M cells
- **Script** quota: 20,000 URL fetches/day

### 7.2 Performance Targets

| Operation | Target |
|-----------|--------|
| Page load | < 3 seconds |
| Submit order | < 2 seconds |
| Refresh counts | < 1 second |
| Menu import | < 5 seconds |

---

## 8. Success Metrics

### 8.1 Adoption
- 100% of team using web app (vs Excel)
- Zero requests to use old Excel method

### 8.2 Efficiency
- Admin time reduced from 30+ min to <10 min
- Order entry time: <30 seconds per user

### 8.3 Reliability
- Zero data loss incidents
- <1% order error rate

---

## 9. Timeline

| Phase | Date | Status |
|-------|------|--------|
| Requirements | Nov 2025 | ✅ Complete |
| Development | Dec 2025 - Jan 2026 | ✅ Complete |
| Testing | Jan 2026 | ✅ Complete |
| Release | Jan 16, 2026 | ✅ Released |
| Iteration | Ongoing | In Progress |

---

## 10. Future Considerations

### 10.1 Potential Enhancements
- **Power Automate integration** - Auto-post to Teams channel
- **WhatsApp API** - Auto-send summary to vendor
- **Payment integration** - QR payment tracking
- **Analytics dashboard** - Popular items, ordering patterns
- **Recurring orders** - "Same as yesterday" option

### 10.2 Not In Scope (v1)
- Multi-vendor support
- Pre-ordering (days ahead)
- User authentication
- Dietary preference tracking
