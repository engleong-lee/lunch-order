# Implementation History

This document chronicles the development of the Lunch Order System, capturing design decisions, iterations, and lessons learned.

---

## Project Timeline

### Phase 1: Requirements Gathering (November 2025)

**Context:**
The TRX Exchange 106, Level 17 team had been using a shared Excel file for lunch orders. Pain points included:
- Concurrent editing conflicts
- Poor mobile experience
- Time-consuming daily setup
- Manual order compilation

**Initial Requirements:**
- Replace Excel with web-based interface
- Support mobile devices
- Eliminate typing (click-to-order)
- Auto-generate vendor summary

**Technology Decision:**
Google Apps Script chosen because:
- Zero deployment cost
- Native Google Sheets integration
- No server management
- Familiar environment for Excel users
- URL-based sharing (no app install)

---

### Phase 2: Core Development (December 2025 - January 2026)

#### Iteration 1: Basic Structure

**Decisions Made:**
1. **Single-file frontend** - All HTML/CSS/JS in WebApp.html for simplicity
2. **Tab-based navigation** - Separate concerns (Order, My Order, All, Admin)
3. **Category-based menu** - Match existing menu format from vendor

**Initial Menu Format:**
```
✔️鸡 Chicken
- 咖喱鸡 curry chicken
- 药材蒸鸡 herbal steamed chicken
```

#### Iteration 2: Concurrency Handling

**Problem:** Multiple users could overwrite each other's orders.

**Solution:** Implemented `LockService.getScriptLock()` with:
- 10-second lock timeout
- Try-lock pattern (non-blocking)
- Double-verification of row ownership
- Graceful "system busy" message

**Code Pattern:**
```javascript
const lock = LockService.getScriptLock();
if (!lock.tryLock(10000)) {
  return { success: false, message: 'System is busy...' };
}
try {
  // operations
  lock.releaseLock();
} catch (e) {
  lock.releaseLock();
  throw e;
}
```

#### Iteration 3: Menu Import System

**Problem:** Admin needed to update menu daily from WhatsApp.

**Evolution:**
1. First attempt: Parse directly to columns A-D
2. Issue: Lost raw text, hard to debug
3. Final solution: Save raw to F2, parse to A-D

**Menu Split Logic:**
The menu splits into 4 columns based on keywords:
- Column A: Before "猪" (chicken)
- Column B: "猪" to "蛋" (pork, seafood)
- Column C: "蛋" to "菜 Veg" (egg, others)
- Column D: "菜 Veg" to end (vegetable, set meals)

#### Iteration 4: Row Compaction

**Problem:** When orders cancelled, gaps appeared in the list.

**Solution:** Row compaction on cancellation:
1. Delete the cancelled row
2. Insert empty row at end
3. Re-number all admin column entries

**Trade-off:** More complex code, but cleaner order list.

#### Iteration 5: Order Editing

**Problem:** Users wanted to modify orders after submission.

**Solution:**
- "Load My Order" button to fetch existing order
- Edit mode banner to indicate editing state
- Same submit function handles create/update
- Verify row ownership before update

#### Iteration 6: Real-time Counts

**Problem:** Users couldn't see what was popular.

**Solution:**
- Count menu items from all orders
- Show count badge on each item
- Track who ordered (for tooltip)
- Auto-refresh every 30 seconds

**Implementation:**
```javascript
function getMenuItemCounts() {
  const counts = {};
  const orderedBy = {};
  // Match order items to menu items by Chinese characters
  // Return both counts and names
  return { counts, orderedBy };
}
```

---

### Phase 3: UX Polish (January 2026)

#### Welcome Modal & Tour

**Rationale:** New users were confused by the interface.

**Implementation:**
- Welcome modal on first visit
- 7-step guided tour
- "Don't show again" option (localStorage)
- Help button to re-show anytime

#### Mobile Optimization

**Key Changes:**
- Removed fixed width constraints
- Made buttons larger (touch targets)
- Simplified tab names for small screens
- Collapsible categories to reduce scrolling

#### Copy Order Feature

**Use Case:** "I'll have what they're having"

**Implementation:**
- Copy button on each order in All Orders tab
- Confirmation modal with details
- Handles existing order (overwrites)
- Stays on All Orders tab after copy

---

### Phase 4: Admin Features (January 2026)

#### Ordering Status Control

**States:**
1. **Not Started** - No sheet for today
2. **Open** - Sheet exists, F1 empty
3. **Closed** - Sheet exists, F1="CLOSED"

**UI Response:**
- Show menu only when open
- Disable editing when closed
- Clear status indicators

#### Order Summary Generation

**Format (for vendor):**
```
TRX Exchange 106, Level 17
 1. 妈蜜鸡 + 蒸水蛋 8
 2. 咖喱鸡 + 生菜 + 煎蛋 8
 3. 烧鸡二度 9
```

**Features:**
- Copy to clipboard button
- Padded row numbers
- Price included

---

## Design Decisions Log

### Why Google Sheets Backend?

**Considered:**
1. Firebase - More complex, overkill
2. MySQL/PostgreSQL - Requires server
3. Google Sheets - Perfect fit

**Verdict:** Google Sheets because:
- Team already familiar with spreadsheets
- Easy to view/edit data directly if needed
- No database management
- Built-in backup/history

### Why No User Authentication?

**Considered:**
1. Google OAuth - Requires login
2. Simple password - Easily shared
3. Honor system - Trust the team

**Verdict:** Honor system because:
- Internal team only (~15 people)
- Low-stakes application
- Simplicity more important
- No sensitive data

### Why Single HTML File?

**Considered:**
1. Modular files - Better organization
2. Single file - Simpler deployment

**Verdict:** Single file because:
- Apps Script include() has quirks
- Easier to deploy/update
- ~2,200 lines still manageable
- All styles/scripts co-located

### Why Chinese-Only Order Storage?

**Problem:** Menu items have Chinese + English names.

**Decision:** Store only Chinese in orders because:
- Vendor understands Chinese only
- Shorter order strings
- Consistent format
- English for user reference only

**Implementation:**
```javascript
function extractChineseName(itemName) {
  // "咖喱鸡 curry chicken" → "咖喱鸡"
  const match = itemName.match(/[\u4e00-\u9fff]+/g);
  return match ? match.join('') : itemName;
}
```

---

## Known Issues & Trade-offs

### Issue 1: No Offline Support
**Trade-off:** Simpler architecture vs resilience
**Mitigation:** Most ordering happens in office with stable internet

### Issue 2: Name-based Identity
**Trade-off:** Simplicity vs security
**Mitigation:** Trust-based team environment

### Issue 3: Spreadsheet Limits
**Trade-off:** Simplicity vs scalability
**Mitigation:** 100 orders/day is well within limits; ~79 sheets after 3 months

### Issue 4: No Undo
**Trade-off:** Simpler code vs user safety
**Mitigation:** Edit/cancel available until ordering closes

---

## Performance Observations

### Measured Timings (typical)
- Page initial load: 1.2s
- Menu data fetch: 0.5s
- Submit order: 1.5s
- Refresh counts: 0.4s

### Optimization Applied
1. Batch spreadsheet reads
2. Client-side name caching
3. Throttled auto-refresh (30s)
4. Minimal DOM updates on refresh

---

## Lessons Learned

### 1. Start Simple
Initial versions were over-engineered. Simplified by:
- Removing unnecessary features
- Single file instead of modules
- Honor system instead of auth

### 2. Lock Everything
Concurrent write issues appeared immediately in testing. Now all write operations use locks.

### 3. Preserve Raw Data
First menu import lost the original text. Now F2 stores raw input, making debugging easier.

### 4. Mobile First
Desktop version looked fine but mobile was unusable. Rewrote CSS with mobile breakpoints first.

### 5. Test with Real Users
Welcome modal and tour added after watching colleagues struggle with the interface.

---

## Future Development Ideas

### Short-term
- [ ] Teams notification on order close
- [ ] "Same as yesterday" quick order
- [ ] Dietary tags (vegetarian, halal)

### Medium-term
- [ ] Order history view
- [ ] Popular items analytics
- [ ] Scheduled ordering (auto-open)

### Long-term
- [ ] Multi-vendor support
- [ ] Payment reconciliation
- [ ] Mobile app wrapper

---

## Contributing

When making changes:
1. Update CHANGELOG.md
2. Add context to this file for significant decisions
3. Test on mobile devices
4. Verify concurrent access works
5. Update PRD if features change
