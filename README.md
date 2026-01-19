# 🍱 Lunch Order System

A Google Apps Script web application for managing daily lunch orders at TRX Exchange 106, Level 17.

## Overview

This system replaces manual Excel-based lunch ordering with a click-to-order web interface. Users can browse the daily menu, select items, customize rice portions, and submit orders—all from their phones or desktops.

## Features

- **Click-to-Order Interface** - Select menu items with a single tap
- **Real-time Order Counts** - See what's popular with live order tallies
- **Mobile-First Design** - Responsive UI optimized for phone ordering
- **Daily Sheet Management** - Automatic creation of daily order sheets
- **Menu Import** - Paste WhatsApp menus directly into the system
- **Admin Controls** - Open/close ordering, generate summaries
- **Payment Tracking** - Mark orders as paid with QR code support

## Quick Start

### 1. Deploy the Spreadsheet
1. Create a new Google Spreadsheet
2. Add sheets: `Menu`, `template`
3. Copy the template structure from `/data/spreadsheet-setup.md`

### 2. Deploy the Web App
1. Open Script Editor (Extensions → Apps Script)
2. Copy `src/Code.gs` and `src/WebApp.html`
3. Deploy → New deployment → Web app
4. Set "Execute as: Me" and "Who has access: Anyone"
5. Copy the Spreadsheet ID to `CONFIG.SPREADSHEET_ID` in Code.gs
6. Re-deploy

### 3. Daily Usage
**Admin (Morning):**
1. Copy menu from WhatsApp
2. Import menu via Admin tab
3. Click "Open Today's Ordering"
4. Share URL with team

**Users:**
1. Open URL
2. Enter name
3. Select items
4. Submit order
5. Pay at pickup

## Pricing Logic

| Items | Price (RM) |
|-------|------------|
| 1-2 items | 6 |
| 3 items | 8 |
| 4+ items | 6 + (items-2) × 2 (max 12) |
| Set meals | Fixed price (RM8-9) |

## Project Structure

```
lunch-order-system/
├── README.md                 # This file
├── docs/
│   ├── PRD.md               # Product Requirements Document
│   ├── ARCHITECTURE.md      # Technical Architecture
│   ├── CHANGELOG.md         # Version history
│   └── IMPLEMENTATION_HISTORY.md  # Development timeline
├── src/
│   ├── Code.gs              # Google Apps Script backend
│   └── WebApp.html          # Frontend (HTML/CSS/JS)
└── data/
    ├── spreadsheet-setup.md # Spreadsheet configuration guide
    └── Lunch_ordering_TRX_KL_17.xlsx  # Sample data
```

## Tech Stack

- **Backend:** Google Apps Script
- **Data Store:** Google Sheets
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Deployment:** Google Apps Script Web App

## Configuration

Edit `CONFIG` in `Code.gs`:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'your-spreadsheet-id-here',
  DEFAULT_PRICE: 7,
  MENU_SHEET: 'Menu',
  TEMPLATE_SHEET: 'template',
  ORDER_START_ROW: 2,
  MAX_ORDERS: 100
};
```

## Contributing

See [IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md) for development context.

## License

MIT License - See LICENSE file
