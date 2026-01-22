# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-01-22

### Added
- **English Names in Order Display**
  - "All Orders" and "My Order" tabs now show items with both Chinese and English names
  - Example: `冬菇焖姜鸡 mushroom braised ginger chicken` instead of just `冬菇焖姜鸡`
  - Menu data is automatically loaded when viewing orders (even if Order tab wasn't visited)
  - Order Summary remains Chinese-only for vendor communication

---

## [1.1.0] - 2026-01-19

### Added
- **Pay Button in My Order Tab**
  - Added "💵 Pay Now" button that appears when checking unpaid orders
  - Button shows QR code payment modal (same as Order tab)
  - Order view automatically refreshes after payment confirmation
  - Provides consistent payment experience across both Order and My Order tabs

---

## [1.0.0] - 2026-01-16

### Added
- **Core Ordering System**
  - Click-to-order menu interface with category organization
  - Multi-item selection with visual feedback
  - Rice portion options (normal, less, no rice)
  - Special notes field for order customization
  - Per-item notes (e.g., "茄子x2, 苦瓜")
  - Automatic price calculation with manual adjustment option

- **Order Management**
  - Submit new orders
  - Edit existing orders (load and update)
  - Cancel orders with row compaction
  - Copy another user's order
  - Real-time order count display per menu item
  - "Who ordered" tooltip on hover

- **Admin Features**
  - Open daily ordering (creates YYYYMMDD sheet)
  - Close ordering (sets F1="CLOSED")
  - Import menu from WhatsApp text
  - Menu parsing to columns A-D
  - Generate order summary for vendor
  - Hide old order sheets automatically

- **User Experience**
  - Mobile-responsive design
  - Welcome modal for new users
  - Guided tour walkthrough
  - Category collapse/expand
  - Auto-refresh order counts (30 sec)
  - Loading states and error messages
  - Remember user name (localStorage)

- **Payment Tracking**
  - Payment status display
  - QR code payment modal
  - Mark order as paid

- **Data Management**
  - Race condition protection (LockService)
  - Row verification before updates
  - Automatic row renumbering after cancellation
  - Admin column format maintenance

### Technical Details
- Backend: Google Apps Script (Code.gs)
- Frontend: Single HTML file (WebApp.html)
- Data Store: Google Sheets
- ~1,800 lines of backend code
- ~2,200 lines of frontend code

---

## [Unreleased]

### Planned
- Power Automate integration for Teams notifications
- WhatsApp API for vendor communication
- Analytics dashboard
- Recurring order option ("same as yesterday")

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 1.2.0 | 2026-01-22 | English names in order displays |
| 1.1.0 | 2026-01-19 | Pay button in My Order tab |
| 1.0.0 | 2026-01-16 | Initial release with full ordering system |

---

## Migration Notes

### From Excel to v1.0.0

**Before:**
- Manual Excel editing
- Email/WhatsApp order compilation
- No real-time visibility

**After:**
- Web-based ordering
- Automatic summary generation
- Real-time order tracking

**Data Migration:**
- No migration needed
- New sheets created automatically
- Historical sheets preserved
