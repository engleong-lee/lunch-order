/**
 * Lunch Ordering System - Google Apps Script Web App
 * ===================================================
 * A click-based ordering system deployed as a standalone web app.
 * 
 * Features:
 * - Click to select menu items
 * - Rice portion options (normal, less, no rice)
 * - Order submission to daily sheet
 * - Order cancellation
 * - Mobile-friendly responsive design
 * - Shareable URL for all users
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  SPREADSHEET_ID: '', // <-- PASTE YOUR SPREADSHEET ID HERE after deployment
  DEFAULT_PRICE: 7,
  MENU_SHEET: 'Menu',
  TEMPLATE_SHEET: 'template',
  ORDER_START_ROW: 2,
  MAX_ORDERS: 100,
  COLUMNS: {
    ROW_NUM: 1,
    WHO: 2,
    WHAT: 3,
    PRICE: 4,
    PAID: 5,
    ADMIN: 6
  }
};

// ==================== WEB APP ENTRY POINT ====================
/**
 * Serves the web app HTML
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('WebApp');
  return template.evaluate()
    .setTitle('🍱 Lunch Order')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

/**
 * Include HTML files (for modular HTML)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== SPREADSHEET ACCESS ====================
/**
 * Gets the spreadsheet (works both from bound script and web app)
 */
function getSpreadsheet() {
  // If bound to a spreadsheet, use that
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {
    // Not bound, use ID
  }
  
  // Use configured spreadsheet ID
  if (CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  }
  
  throw new Error('Spreadsheet not configured. Please set SPREADSHEET_ID in Code.gs');
}

// ==================== MENU DATA ====================
/**
 * Returns the structured menu data from the Menu sheet
 * Menu sheet structure:
 * - Columns A-D: Categories stacked vertically within each column
 * - Category headers start with ✔️ or ✔
 * - Items start with "- "
 */
function getMenuData() {
  try {
    const ss = getSpreadsheet();
    const menuSheet = ss.getSheetByName('Menu');
    
    if (!menuSheet) {
      return getDefaultMenuData();
    }
    
    const lastCol = menuSheet.getLastColumn();
    const lastRow = menuSheet.getLastRow();
    
    if (lastCol < 1 || lastRow < 1) {
      return getDefaultMenuData();
    }
    
    // Read data from columns A-D (4 columns max)
    const numCols = Math.min(lastCol, 4);
    const data = menuSheet.getRange(1, 1, lastRow, numCols).getValues();
    
    const menu = {};
    
    // Process each column - categories are stacked vertically
    for (let col = 0; col < numCols; col++) {
      let currentCategory = null;
      
      for (let row = 0; row < lastRow; row++) {
        let cellValue = data[row][col];
        if (!cellValue || cellValue.toString().trim() === '') continue;
        
        cellValue = cellValue.toString().trim();
        
        // Check if this is a category header (starts with ✔️/✔, or doesn't start with "- ")
        if (cellValue.startsWith('✔️') || cellValue.startsWith('✔')) {
          // Remove the tick prefix
          currentCategory = cellValue.replace(/^✔️?\s*/, '').replace(/^✔\s*/, '').trim();
          if (!menu[currentCategory]) {
            menu[currentCategory] = [];
          }
        }
        // Check if this is an item (starts with "- ")
        else if (cellValue.startsWith('- ') || cellValue.startsWith('-')) {
          if (!currentCategory) continue; // Skip items without category
          
          let itemText = cellValue.replace(/^-\s*/, '').trim();
          
          if (!itemText) continue;
          
          const item = { name: itemText, emoji: '' };
          
          // Check for fixed price (e.g., "烧鸡胸饭 rm8")
          const priceMatch = itemText.match(/rm\s*(\d+)/i);
          if (priceMatch) {
            item.fixedPrice = parseInt(priceMatch[1]);
          }
          
          item.emoji = getAutoEmoji(itemText);
          menu[currentCategory].push(item);
        }
        // Otherwise, it's a category header without tick prefix
        else {
          currentCategory = cellValue;
          if (!menu[currentCategory]) {
            menu[currentCategory] = [];
          }
        }
      }
    }
    
    // Remove empty categories
    for (const cat of Object.keys(menu)) {
      if (menu[cat].length === 0) {
        delete menu[cat];
      }
    }
    
    if (Object.keys(menu).length === 0) {
      return getDefaultMenuData();
    }
    
    return menu;
    
  } catch (error) {
    console.error('Error reading menu:', error);
    return getDefaultMenuData();
  }
}

/**
 * Auto-assign emoji based on item name keywords
 */
function getAutoEmoji(itemName) {
  const emojiMap = {
    '鸡': '', '鱼': '', '蛋': '🥚', '虾': '🦐',
    '辣': '🌶️', '菇': '🍄', '番茄': '🍅', '洋葱': '🧅',
    '马铃薯': '🥔', '土豆': '🥔', '茄子': '🍆', '柠檬': '🍋',
    '药材': '🌿', '花椰菜': '🥦', '包菜': '🥗', '小白菜': '🥬',
    '番薯叶': '🍃', '煎蛋': '🍳', '套餐': '🍱', '胸肉': '💪'
  };
  
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (itemName.includes(keyword) && emoji) {
      return emoji;
    }
  }
  return '';
}

/**
 * Returns default hardcoded menu data
 */
function getDefaultMenuData() {
  return {
    "🐔 鸡 Chicken": [
      { name: "咖喱鸡 curry chicken", emoji: "" },
      { name: "冬菇焖姜鸡", emoji: "🍄" },
      { name: "药材蒸鸡 herbal steamed chicken", emoji: "🌿" },
      { name: "咸蛋鸡 salted egg chicken", emoji: "🥚" },
      { name: "妈蜜鸡 marmite chicken", emoji: "" },
      { name: "柠檬鸡丁 lemon chicken", emoji: "🍋" },
      { name: "辣子鸡丁 spicy chicken", emoji: "🌶️" },
      { name: "蒸鸡胸肉 steamed chicken breast", emoji: "💪" },
      { name: "卤蛋卤鸡腿肉", emoji: "" }
    ],
    "🐷 猪 Pork": [
      { name: "咸鱼花腩 pork belly salted fish", emoji: "🐟" },
      { name: "辣椒小炒肉 chili pork", emoji: "🌶️" },
      { name: "杏鲍菇炒肉 mushroom pork", emoji: "🍄" },
      { name: "咕噜肉 sweet & sour pork", emoji: "" },
      { name: "焖排骨 braised ribs", emoji: "" },
      { name: "爆炒肉碎 stir-fried minced pork", emoji: "" }
    ],
    "🐟 海鲜 Seafood": [
      { name: "蒸鱼片 steamed fish fillet", emoji: "" },
      { name: "水煮鱼 boiled fish", emoji: "🌶️" },
      { name: "麦片咸蛋鱼片 cereal salted egg fish", emoji: "" }
    ],
    "🥚 蛋 Egg": [
      { name: "番茄炒蛋 tomato egg", emoji: "🍅" },
      { name: "洋葱炒蛋 onion egg", emoji: "🧅" },
      { name: "蒸水蛋 steamed egg", emoji: "" },
      { name: "煎蛋 fried egg", emoji: "🍳" }
    ],
    "🍲 配料 Others": [
      { name: "马铃薯 potato", emoji: "🥔" },
      { name: "麻辣香锅菜 mala vegetables", emoji: "🌶️" },
      { name: "酸辣土豆丝 potato floss", emoji: "" },
      { name: "日本豆腐 japanese tofu", emoji: "" },
      { name: "爆炒鲍鱼菇 stir-fried mushroom", emoji: "🍄" },
      { name: "菜脯豆腐 preserved radish tofu", emoji: "" },
      { name: "茄子 eggplant", emoji: "🍆" },
      { name: "腐竹卷 beancurd roll", emoji: "" },
      { name: "苦瓜 bitter gourd", emoji: "" },
      { name: "酿豆腐 stuffed tofu", emoji: "" }
    ],
    "🥬 菜 Vegetables": [
      { name: "生菜 lettuce", emoji: "" },
      { name: "小白菜 bok choy", emoji: "🥬" },
      { name: "奶白仔 nai bai", emoji: "" },
      { name: "kangkung 蕹菜 water spinach", emoji: "" },
      { name: "炒羊角豆 okra", emoji: "" },
      { name: "炒豆角 long beans", emoji: "" },
      { name: "手撕包菜 cabbage", emoji: "🥗" },
      { name: "元菜 bayam spinach", emoji: "" },
      { name: "花椰菜 cauliflower", emoji: "🥦" },
      { name: "番薯叶 sweet potato leaves", emoji: "🍃" }
    ],
    "🍱 套餐 Set Meals": [
      { name: "烧鸡胸饭 RM8", emoji: "", fixedPrice: 8 },
      { name: "烧鸡二度 RM9", emoji: "", fixedPrice: 9 },
      { name: "烧鸡翅膀 RM8", emoji: "", fixedPrice: 8 }
    ]
  };
}

/**
 * Imports raw menu text to F2, then parses it to populate columns A-E
 * @param {string} rawMenuText - Raw menu text from WhatsApp
 * @returns {Object} - Result object with success status
 */
function importMenuToSheet(rawMenuText) {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(10000)) {
      return { success: false, message: 'System is busy. Please try again.' };
    }
    
    const ss = getSpreadsheet();
    let menuSheet = ss.getSheetByName('Menu');
    
    // Create Menu sheet if it doesn't exist
    if (!menuSheet) {
      menuSheet = ss.insertSheet('Menu');
    }
    
    // Write raw text to F2 (source of truth)
    menuSheet.getRange('F2').setValue(rawMenuText);
    
    // Now parse F2 and populate A-E
    const result = updateMenuFromF2();
    
    lock.releaseLock();
    return result;
    
  } catch (error) {
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Parses the raw menu text in F2 and populates columns A-D
 * Split logic matches spreadsheet formulas:
 * - A: Everything before "猪" (chicken)
 * - B: From "猪" to before "蛋" (pork, seafood)
 * - C: From "蛋" to before "菜 Veg" (egg, others)
 * - D: From "菜 Veg" to end (vegetable, food)
 */
function updateMenuFromF2() {
  try {
    const ss = getSpreadsheet();
    const menuSheet = ss.getSheetByName('Menu');
    
    if (!menuSheet) {
      return { success: false, message: 'Menu sheet not found.' };
    }
    
    // Read raw text from F2
    const rawText = menuSheet.getRange('F2').getValue();
    
    if (!rawText || rawText.toString().trim() === '') {
      return { success: false, message: 'F2 is empty. Please paste menu text first.' };
    }
    
    // Parse the raw text into categories with their items
    const categories = parseRawMenuTextToCategories(rawText.toString());
    
    if (categories.length === 0) {
      return { success: false, message: 'Could not parse menu. Check format.' };
    }
    
    // Clear columns A-D (keep E onwards for buttons/instructions)
    menuSheet.getRange('A:D').clear();
    
    // Split markers (match formula logic)
    const splitMarkers = ['猪', '蛋', '菜 Veg'];
    
    // Distribute categories into 4 columns based on markers
    const columns = [[], [], [], []]; // A, B, C, D
    let currentCol = 0;
    
    for (const cat of categories) {
      // Check if this category header contains a split marker
      // If so, move to next column
      for (let i = currentCol; i < splitMarkers.length; i++) {
        if (cat.header.includes(splitMarkers[i])) {
          currentCol = i + 1;
          break;
        }
      }
      
      // Add category to current column (max column D = index 3)
      const colIndex = Math.min(currentCol, 3);
      columns[colIndex].push(cat);
    }
    
    // Build the data arrays for each column
    const columnsData = [[], [], [], []];
    
    for (let col = 0; col < 4; col++) {
      for (const cat of columns[col]) {
        // Add category header
        columnsData[col].push(cat.header);
        
        // Add items with "- " prefix
        for (const item of cat.items) {
          columnsData[col].push('- ' + item);
        }
      }
    }
    
    // Find max rows needed
    const maxRows = Math.max(...columnsData.map(col => col.length));
    
    if (maxRows === 0) {
      return { success: false, message: 'No menu items found.' };
    }
    
    // Prepare 2D array for writing
    const data = [];
    for (let row = 0; row < maxRows; row++) {
      const rowData = [];
      for (let col = 0; col < 4; col++) {
        rowData.push(columnsData[col][row] || '');
      }
      data.push(rowData);
    }
    
    // Write to sheet
    menuSheet.getRange(1, 1, data.length, 4).setValues(data);
    
    // Format category headers (cells that don't start with "- " are category headers)
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < columnsData[col].length; row++) {
        const cellValue = columnsData[col][row];
        // Category headers are non-empty and don't start with "- "
        if (cellValue && !cellValue.startsWith('- ') && !cellValue.startsWith('-')) {
          const cell = menuSheet.getRange(row + 1, col + 1);
          cell.setFontWeight('bold');
          cell.setBackground('#c8e6c9');
        }
      }
    }
    
    // Auto-resize columns with minimum width
    for (let i = 1; i <= 4; i++) {
      menuSheet.autoResizeColumn(i);
      // Ensure minimum width of 250 pixels
      const currentWidth = menuSheet.getColumnWidth(i);
      if (currentWidth < 250) {
        menuSheet.setColumnWidth(i, 250);
      }
    }
    
    // Force spreadsheet to recalculate (helps with rendering)
    SpreadsheetApp.flush();
    
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    
    return { 
      success: true, 
      message: `Menu updated! ${categories.length} categories, ${totalItems} items.`
    };
    
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Parse raw WhatsApp menu text into array of categories with items
 * Format: ✔️Category followed by items with "- " prefix
 */
function parseRawMenuTextToCategories(rawText) {
  const categories = [];
  const lines = rawText.split('\n');
  let currentCategory = null;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Check if this is a category header (starts with ✔️ or ✔)
    if (line.startsWith('✔️') || line.startsWith('✔')) {
      if (currentCategory) {
        categories.push(currentCategory);
      }
      // Remove the tick prefix
      const cleanHeader = line.replace(/^✔️?\s*/, '').replace(/^✔\s*/, '').trim();
      currentCategory = { header: cleanHeader, items: [] };
    }
    // Check if this is an item (starts with "- ")
    else if (currentCategory && (line.startsWith('- ') || line.startsWith('-'))) {
      let itemText = line.replace(/^-\s*/, '').trim();
      if (itemText) {
        currentCategory.items.push(itemText);
      }
    }
  }
  
  // Don't forget the last category
  if (currentCategory) {
    categories.push(currentCategory);
  }
  
  return categories;
}

/**
 * Legacy function - kept for compatibility
 */
function parseRawMenuText(rawText) {
  const categories = parseRawMenuTextToCategories(rawText);
  const menu = {};
  for (const cat of categories) {
    menu[cat.header] = cat.items;
  }
  return menu;
}

// ==================== ORDERING STATUS ====================
/**
 * Check if ordering is open
 * Ordering is CLOSED if:
 * 1. Today's sheet doesn't exist
 * 2. F1 = "CLOSED" (admin manually closed)
 * 
 * @returns {Object} - Status object with isOpen, isClosed, todayDate, message
 */
function getOrderingStatus() {
  try {
    const ss = getSpreadsheet();
    const todaySheetName = getTodaySheetName(); // e.g., "20260107"
    const todaySheet = ss.getSheetByName(todaySheetName);
    
    // Debug: list all sheet names
    const allSheets = ss.getSheets().map(s => s.getName());
    
    if (todaySheet) {
      // Today's sheet exists - check if ordering is closed (F1 = "CLOSED")
      const closedStatus = todaySheet.getRange('F1').getValue();
      const isClosed = closedStatus === 'CLOSED';
      
      if (isClosed) {
        return {
          isOpen: true, // Sheet exists
          isClosed: true, // But ordering is closed by admin
          todayDate: formatDateForDisplay(todaySheetName),
          sheetName: todaySheetName,
          allSheets: allSheets,
          message: 'Ordering is closed for today. No more changes allowed.'
        };
      }
      
      return {
        isOpen: true,
        isClosed: false,
        todayDate: formatDateForDisplay(todaySheetName),
        sheetName: todaySheetName,
        allSheets: allSheets,
        message: 'Ordering is open for ' + formatDateForDisplay(todaySheetName)
      };
    } else {
      // Today's sheet doesn't exist - ordering not started
      return {
        isOpen: false,
        isClosed: true, // Treat as closed since today's sheet doesn't exist
        todayDate: formatDateForDisplay(todaySheetName),
        sheetName: todaySheetName,
        allSheets: allSheets,
        message: 'Ordering not started for ' + formatDateForDisplay(todaySheetName) + '. Please wait for admin to open.'
      };
    }
  } catch (error) {
    return {
      isOpen: false,
      isClosed: true,
      todayDate: '',
      sheetName: 'ERROR',
      allSheets: [],
      message: 'Error checking status: ' + error.message
    };
  }
}

/**
 * Close ordering for today - prevents any new orders/edits
 * Sets F1 of today's sheet to "CLOSED"
 */
function closeOrderingForToday() {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(10000)) {
      return { success: false, message: 'System is busy. Please try again.' };
    }
    
    const ss = getSpreadsheet();
    const todaySheetName = getTodaySheetName();
    const todaySheet = ss.getSheetByName(todaySheetName);
    
    if (!todaySheet) {
      lock.releaseLock();
      return { success: false, message: 'Today\'s order sheet does not exist.' };
    }
    
    // Set F1 to "CLOSED"
    todaySheet.getRange('F1').setValue('CLOSED');
    
    SpreadsheetApp.flush();
    lock.releaseLock();
    
    return { 
      success: true, 
      message: 'Ordering closed for ' + formatDateForDisplay(todaySheetName) + '. No more orders can be added.'
    };
    
  } catch (error) {
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Format YYYYMMDD to readable date
 */
function formatDateForDisplay(dateStr) {
  if (!dateStr || dateStr.length !== 8) return dateStr;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${day}/${month}/${year}`;
}

/**
 * Create new day order sheet - Admin function
 * 1. Hide all old order sheets (YYYYMMDD format, before today)
 * 2. Clone "template" sheet as today's date
 * @returns {Object} - Result with success status
 */
function createNewDayOrderSheet() {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(10000)) {
      return { success: false, message: 'System is busy. Please try again.' };
    }
    
    const ss = getSpreadsheet();
    const todaySheetName = getTodaySheetName();
    
    // Check if today's sheet already exists
    let todaySheet = ss.getSheetByName(todaySheetName);
    if (todaySheet) {
      // Make sure it's visible
      todaySheet.showSheet();
      ss.setActiveSheet(todaySheet);
      SpreadsheetApp.flush();
      lock.releaseLock();
      return { 
        success: true, 
        message: `Sheet "${todaySheetName}" already exists. Ordering is open.`,
        sheetName: todaySheetName
      };
    }
    
    // Hide all old order sheets (sheets with YYYYMMDD format before today)
    const sheets = ss.getSheets();
    const todayNum = parseInt(todaySheetName);
    let hiddenCount = 0;
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      // Check if sheet name is 8 digits (YYYYMMDD format)
      if (/^\d{8}$/.test(sheetName)) {
        const sheetNum = parseInt(sheetName);
        if (sheetNum < todayNum) {
          sheet.hideSheet();
          hiddenCount++;
        }
      }
    }
    
    // Find template sheet
    const templateSheet = ss.getSheetByName('template');
    if (!templateSheet) {
      lock.releaseLock();
      return { success: false, message: 'Template sheet not found. Please create a sheet named "template".' };
    }
    
    // Clone template as today's sheet
    todaySheet = templateSheet.copyTo(ss);
    todaySheet.setName(todaySheetName);
    
    // IMPORTANT: Show the sheet immediately (template might be hidden)
    todaySheet.showSheet();
    
    // Set as active and move to position
    ss.setActiveSheet(todaySheet);
    
    // Move to first position (after Menu sheet if exists)
    const menuSheet = ss.getSheetByName('Menu');
    if (menuSheet) {
      ss.moveActiveSheet(2); // Position after Menu
    } else {
      ss.moveActiveSheet(1);
    }
    
    SpreadsheetApp.flush();
    lock.releaseLock();
    
    return { 
      success: true, 
      message: `Created sheet "${todaySheetName}". ${hiddenCount > 0 ? `Hidden ${hiddenCount} old sheet(s).` : ''} Ordering is now open!`,
      sheetName: todaySheetName,
      hiddenCount: hiddenCount
    };
    
  } catch (error) {
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

// ==================== ORDER FUNCTIONS ====================
/**
 * Gets today's sheet name in YYYYMMDD format
 * Uses Malaysia timezone (Asia/Kuala_Lumpur) for consistency
 */
function getTodaySheetName() {
  const today = new Date();
  const timezone = 'Asia/Kuala_Lumpur'; // Malaysia timezone
  const dateString = Utilities.formatDate(today, timezone, 'yyyyMMdd');
  return dateString;
}

/**
 * Gets or creates today's order sheet
 * Note: This should only be called AFTER admin has opened ordering
 */
function getOrCreateTodaySheet() {
  const ss = getSpreadsheet();
  const sheetName = getTodaySheetName();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    const template = ss.getSheetByName(CONFIG.TEMPLATE_SHEET);
    if (template) {
      sheet = template.copyTo(ss);
      sheet.setName(sheetName);
      sheet.showSheet(); // Make sure it's visible
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(1);
    } else {
      sheet = ss.insertSheet(sheetName, 0);
      setupNewOrderSheet(sheet);
    }
  }
  
  return sheet;
}

/**
 * Gets today's order sheet WITHOUT creating it
 * Returns null if sheet doesn't exist
 */
function getTodaySheetOnly() {
  const ss = getSpreadsheet();
  const sheetName = getTodaySheetName();
  return ss.getSheetByName(sheetName);
}

/**
 * Sets up a new order sheet with headers
 */
function setupNewOrderSheet(sheet) {
  sheet.getRange('A1').setValue('');
  sheet.getRange('B1').setValue('Who?');
  sheet.getRange('C1').setValue('What?');
  sheet.getRange('D1').setValue('How much $?');
  sheet.getRange('E1').setValue('Paid 💵');
  sheet.getRange('F1').setValue('TRX Exchange 106, Level 17');
  sheet.getRange('G1').setValue('(Ignore column F, it\'s for admin purpose)');
  
  for (let i = 1; i <= CONFIG.MAX_ORDERS; i++) {
    sheet.getRange(i + 1, 1).setValue(i);
  }
  
  const specialRow = CONFIG.MAX_ORDERS + 3;
  sheet.getRange(specialRow, 2).setValue('Special Requests');
  sheet.getRange(specialRow, 5).setValue('💵');
  sheet.getRange(specialRow + 1, 2).setValue('(少饭) less rice');
  sheet.getRange(specialRow + 2, 2).setValue('(不要饭) no rice');
  
  const headerRange = sheet.getRange('A1:G1');
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f3f3f3');
}

/**
 * Extracts Chinese characters from menu item name
 * e.g., "咸蛋鸡 salted egg chicken" -> "咸蛋鸡"
 */
function extractChineseName(itemName) {
  // Check if item has a user note in parentheses: "酿豆腐 (茄子x2，苦瓜)"
  const noteMatch = itemName.match(/^(.+?)\s*\(([^)]+)\)$/);
  
  if (noteMatch) {
    // Item has a note - extract Chinese name from base and preserve note
    const basePart = noteMatch[1].trim();
    const notePart = noteMatch[2].trim();
    
    // Extract Chinese characters from anywhere in base part (handles emoji items like "🥦 花椰菜🥦")
    const chineseMatch = basePart.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g);
    const chineseName = chineseMatch ? chineseMatch.join('') : basePart.split(' ')[0].trim();
    
    // Return with note preserved
    return `${chineseName} (${notePart})`;
  }
  
  // No note - extract Chinese characters from anywhere in the string
  const chineseMatch = itemName.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g);
  if (chineseMatch) {
    return chineseMatch.join('');
  }
  // If no Chinese found, return first word (for items like "kangkung")
  return itemName.split(' ')[0].trim();
}

/**
 * Submits an order to the daily sheet (creates new or updates existing)
 * Uses LockService to prevent race conditions
 */
function submitOrder(orderData) {
  // Get a script lock to prevent concurrent modifications
  const lock = LockService.getScriptLock();
  
  try {
    // Try to acquire lock, wait up to 10 seconds
    if (!lock.tryLock(10000)) {
      return { 
        success: false, 
        message: 'System is busy. Please try again in a moment.' 
      };
    }
    
    // Check if ordering is closed
    const status = getOrderingStatus();
    if (!status.isOpen || status.isClosed) {
      lock.releaseLock();
      return { success: false, message: 'Ordering is closed. No more orders can be added.' };
    }
    
    const sheet = getTodaySheetOnly();
    if (!sheet) {
      lock.releaseLock();
      return { success: false, message: 'Ordering not started. Please wait for admin to open.' };
    }
    
    const userName = orderData.name.trim();
    const trimmedNameLower = userName.toLowerCase();
    
    if (!userName) {
      lock.releaseLock();
      return { success: false, message: 'Please enter your name!' };
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      lock.releaseLock();
      return { success: false, message: 'Please select at least one item!' };
    }
    
    // Check for existing order
    const existingRow = findUserOrderRow(sheet, userName);
    const isEdit = existingRow > 0;
    let targetRow;
    
    if (isEdit) {
      // EDIT MODE: Verify the row still belongs to this user
      const verifyName = sheet.getRange(existingRow, CONFIG.COLUMNS.WHO).getValue();
      if (!verifyName || verifyName.toString().trim().toLowerCase() !== trimmedNameLower) {
        lock.releaseLock();
        return { 
          success: false, 
          message: 'Your order was modified by another session. Please refresh and try again.' 
        };
      }
      targetRow = existingRow;
    } else {
      // NEW ORDER: Find empty row and verify it's still empty
      targetRow = findNextEmptyRow(sheet);
      
      if (targetRow < 0) {
        lock.releaseLock();
        return { success: false, message: 'Order sheet is full! Please contact admin.' };
      }
      
      // Verify the target row is still empty (another user might have taken it)
      const verifyEmpty = sheet.getRange(targetRow, CONFIG.COLUMNS.WHO).getValue();
      if (verifyEmpty && verifyEmpty.toString().trim() !== '') {
        // Row was taken, try to find another empty row
        targetRow = findNextEmptyRow(sheet);
        if (targetRow < 0) {
          lock.releaseLock();
          return { success: false, message: 'Order sheet is full! Please contact admin.' };
        }
        // Verify again
        const verifyEmpty2 = sheet.getRange(targetRow, CONFIG.COLUMNS.WHO).getValue();
        if (verifyEmpty2 && verifyEmpty2.toString().trim() !== '') {
          lock.releaseLock();
          return { success: false, message: 'System is busy. Please try again.' };
        }
      }
      
      // Also check if user already has an order (might have been created in another session)
      const doubleCheck = findUserOrderRow(sheet, userName);
      if (doubleCheck > 0) {
        lock.releaseLock();
        return { 
          success: false, 
          message: 'You already have an order. Please refresh to edit it.' 
        };
      }
    }
    
    // Extract Chinese names only (preserving item notes)
    const chineseItems = orderData.items.map(item => extractChineseName(item));
    let orderString = chineseItems.join(' + ');
    
    if (orderData.riceOption === 'less') {
      orderString += ' (少饭)';
    } else if (orderData.riceOption === 'none') {
      orderString += ' (不要饭)';
    }
    
    if (orderData.notes && orderData.notes.trim()) {
      orderString += ` (${orderData.notes.trim()})`;
    }
    
    let price = orderData.price || calculatePrice(orderData.items);
    
    // Write all values at once to minimize race window
    const rowNum = targetRow - 1;
    const adminValue = `${rowNum}. ${orderString} ${price}`;
    
    sheet.getRange(targetRow, CONFIG.COLUMNS.WHO).setValue(userName);
    sheet.getRange(targetRow, CONFIG.COLUMNS.WHAT).setValue(orderString);
    sheet.getRange(targetRow, CONFIG.COLUMNS.PRICE).setValue(price);
    sheet.getRange(targetRow, CONFIG.COLUMNS.ADMIN).setValue(adminValue);
    
    // Keep paid status if editing (don't clear the paid column)
    
    lock.releaseLock();
    
    const action = isEdit ? 'updated' : 'placed';
    return { 
      success: true, 
      message: `✅ Order ${action}!\n\n👤 ${userName}\n🍱 ${orderString}\n💰 RM${price}`,
      row: rowNum,
      isEdit: isEdit
    };
    
  } catch (error) {
    // Make sure to release lock even on error
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Calculates price based on number of items
 */
function calculatePrice(items) {
  for (const item of items) {
    if (item.includes('RM8') || item.includes('rm8')) return 8;
    if (item.includes('RM9') || item.includes('rm9')) return 9;
  }
  
  const itemCount = items.length;
  if (itemCount <= 2) return 6;
  if (itemCount === 3) return 8;
  return Math.min(12, 6 + (itemCount - 2) * 2);
}

/**
 * Finds the row number of a user's existing order
 */
function findUserOrderRow(sheet, userName) {
  const dataRange = sheet.getRange(CONFIG.ORDER_START_ROW, CONFIG.COLUMNS.WHO, CONFIG.MAX_ORDERS, 1);
  const values = dataRange.getValues();
  
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] && values[i][0].toString().toLowerCase() === userName.toLowerCase()) {
      return i + CONFIG.ORDER_START_ROW;
    }
  }
  return -1;
}

/**
 * Finds the next empty row for orders
 */
function findNextEmptyRow(sheet) {
  const dataRange = sheet.getRange(CONFIG.ORDER_START_ROW, CONFIG.COLUMNS.WHO, CONFIG.MAX_ORDERS, 1);
  const values = dataRange.getValues();
  
  for (let i = 0; i < values.length; i++) {
    if (!values[i][0] || values[i][0].toString().trim() === '') {
      return i + CONFIG.ORDER_START_ROW;
    }
  }
  return -1;
}

/**
 * Cancels an order by user name with row compaction
 * Uses LockService to prevent race conditions from concurrent cancellations
 */
function cancelOrderByName(userName) {
  // Get a script lock to prevent concurrent modifications
  const lock = LockService.getScriptLock();
  
  try {
    // Try to acquire lock, wait up to 10 seconds
    if (!lock.tryLock(10000)) {
      return { 
        success: false, 
        message: 'System is busy. Please try again in a moment.' 
      };
    }
    
    // Check if ordering is closed
    const status = getOrderingStatus();
    if (!status.isOpen || status.isClosed) {
      lock.releaseLock();
      return { success: false, message: 'Ordering is closed. Orders cannot be cancelled.' };
    }
    
    const sheet = getTodaySheetOnly();
    if (!sheet) {
      lock.releaseLock();
      return { success: false, message: 'No orders for today yet.' };
    }
    
    const trimmedName = userName.trim().toLowerCase();
    
    // Find the row with this user's order
    const dataRange = sheet.getRange(CONFIG.ORDER_START_ROW, CONFIG.COLUMNS.WHO, CONFIG.MAX_ORDERS, 1);
    const values = dataRange.getValues();
    
    let targetRow = -1;
    for (let i = 0; i < values.length; i++) {
      const cellValue = values[i][0];
      if (cellValue && cellValue.toString().trim().toLowerCase() === trimmedName) {
        targetRow = CONFIG.ORDER_START_ROW + i;
        break;
      }
    }
    
    if (targetRow < 0) {
      lock.releaseLock();
      return { success: false, message: `No order found for "${userName}" today.` };
    }
    
    // Double-check the row still has the correct user (extra safety)
    const verifyName = sheet.getRange(targetRow, CONFIG.COLUMNS.WHO).getValue();
    if (!verifyName || verifyName.toString().trim().toLowerCase() !== trimmedName) {
      lock.releaseLock();
      return { 
        success: false, 
        message: 'Order was already modified. Please refresh and try again.' 
      };
    }
    
    // Get order details before deletion for confirmation message
    const orderDetails = sheet.getRange(targetRow, CONFIG.COLUMNS.WHAT).getValue();
    
    // Delete the entire row (this shifts all rows below up automatically)
    sheet.deleteRow(targetRow);
    
    // Insert a new empty row at the end of the order section to maintain structure
    const lastOrderRow = CONFIG.ORDER_START_ROW + CONFIG.MAX_ORDERS - 1;
    sheet.insertRowAfter(lastOrderRow - 1); // -1 because we just deleted one
    
    // Update admin column row numbers for all remaining orders
    updateAdminColumnNumbers(sheet);
    
    lock.releaseLock();
    
    return { 
      success: true, 
      message: `✅ Order cancelled!\n\n👤 ${userName}\n🍱 ${orderDetails}` 
    };
    
  } catch (error) {
    // Make sure to release lock even on error
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Updates the admin column row numbers after row deletion
 */
function updateAdminColumnNumbers(sheet) {
  const dataRange = sheet.getRange(CONFIG.ORDER_START_ROW, CONFIG.COLUMNS.WHO, CONFIG.MAX_ORDERS, 3);
  const values = dataRange.getValues();
  
  for (let i = 0; i < values.length; i++) {
    const actualRow = CONFIG.ORDER_START_ROW + i;
    const rowNum = i + 1; // Display row number (1-based)
    const who = values[i][0];
    const what = values[i][1];
    const price = values[i][2];
    
    if (who && what) {
      // Has an order - update admin column with correct row number
      sheet.getRange(actualRow, CONFIG.COLUMNS.ADMIN).setValue(`${rowNum}. ${what} ${price}`);
    } else {
      // Empty row - clear admin column or just show row number
      sheet.getRange(actualRow, CONFIG.COLUMNS.ADMIN).setValue(`${rowNum}.`);
    }
  }
}

/**
 * Gets an order by user name (with details for editing)
 */
function getOrderByName(userName) {
  try {
    const sheet = getTodaySheetOnly();
    if (!sheet) {
      return { found: false, message: 'No orders for today yet.' };
    }
    
    const row = findUserOrderRow(sheet, userName.trim());
    
    if (row < 0) {
      return { found: false, message: `No order found for "${userName}" today.` };
    }
    
    const orderData = sheet.getRange(row, CONFIG.COLUMNS.WHAT).getValue();
    const price = sheet.getRange(row, CONFIG.COLUMNS.PRICE).getValue();
    const paid = sheet.getRange(row, CONFIG.COLUMNS.PAID).getValue();
    
    // Parse order to extract items, rice option, and notes
    // Format: "item1 (note1) + item2 + item3 (note3) (少饭) (special notes)"
    let orderText = orderData.toString();
    let riceOption = 'normal';
    let notes = '';
    
    // Extract rice option first (these are fixed strings)
    if (orderText.includes('(少饭)')) {
      riceOption = 'less';
      orderText = orderText.replace('(少饭)', '').trim();
    } else if (orderText.includes('(不要饭)')) {
      riceOption = 'none';
      orderText = orderText.replace('(不要饭)', '').trim();
    }
    
    // Extract special notes - only if string ends with ") (...)" pattern
    // This means there's an item note followed by special notes
    // e.g., "酿豆腐 (more doufu) (extra spicy)" → special notes = "extra spicy"
    const doubleParenMatch = orderText.match(/\)\s*\(([^)]+)\)$/);
    if (doubleParenMatch) {
      notes = doubleParenMatch[1];
      orderText = orderText.replace(/\s*\([^)]+\)$/, '').trim();
    } else {
      // Check if the last item (after final +) has NO item note but ends with (...)
      // This would be special notes on an item without its own note
      // e.g., "蒸水蛋 + 麻辣香锅菜 (extra spicy)" where 麻辣香锅菜 has no bracket in menu
      // We'll handle this by checking if last part's parentheses content looks like special notes
      // For now, assume if it ends with ) and there's no double pattern, it's an item note
    }
    
    // Split items by " + "
    const items = orderText.split(/\s*\+\s*/).filter(item => item.trim() !== '');
    
    return { 
      found: true, 
      order: orderData,
      items: items,
      riceOption: riceOption,
      notes: notes,
      price: price,
      paid: paid ? true : false,
      row: row - 1,
      message: `👤 ${userName}\n🍱 ${orderData}\n💰 RM${price}\n${paid ? '✅ Paid' : '❌ Not paid yet'}`
    };
    
  } catch (error) {
    return { found: false, message: 'Error: ' + error.message };
  }
}

/**
 * Marks an order as paid
 * Uses LockService to prevent race conditions
 */
function markOrderAsPaid(userName) {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(10000)) {
      return { success: false, message: 'System is busy. Please try again.' };
    }
    
    const sheet = getTodaySheetOnly();
    if (!sheet) {
      lock.releaseLock();
      return { success: false, message: 'No orders for today yet.' };
    }
    
    const trimmedName = userName.trim();
    const row = findUserOrderRow(sheet, trimmedName);
    
    if (row < 0) {
      lock.releaseLock();
      return { success: false, message: `No order found for "${userName}" today.` };
    }
    
    // Verify the row still belongs to this user
    const verifyName = sheet.getRange(row, CONFIG.COLUMNS.WHO).getValue();
    if (!verifyName || verifyName.toString().trim().toLowerCase() !== trimmedName.toLowerCase()) {
      lock.releaseLock();
      return { success: false, message: 'Order was modified. Please refresh and try again.' };
    }
    
    // Check if already paid
    const currentPaid = sheet.getRange(row, CONFIG.COLUMNS.PAID).getValue();
    if (currentPaid) {
      lock.releaseLock();
      return { success: false, message: `Order for "${userName}" is already marked as paid.` };
    }
    
    // Mark as paid with emoji
    sheet.getRange(row, CONFIG.COLUMNS.PAID).setValue('💵');
    
    const orderData = sheet.getRange(row, CONFIG.COLUMNS.WHAT).getValue();
    const price = sheet.getRange(row, CONFIG.COLUMNS.PRICE).getValue();
    
    lock.releaseLock();
    
    return { 
      success: true, 
      message: `✅ Marked as paid!\n\n👤 ${userName}\n🍱 ${orderData}\n💰 RM${price}`
    };
    
  } catch (error) {
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Unmarks an order as paid (in case of mistake)
 * Uses LockService to prevent race conditions
 */
function unmarkOrderAsPaid(userName) {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(10000)) {
      return { success: false, message: 'System is busy. Please try again.' };
    }
    
    const sheet = getTodaySheetOnly();
    if (!sheet) {
      lock.releaseLock();
      return { success: false, message: 'No orders for today yet.' };
    }
    
    const trimmedName = userName.trim();
    const row = findUserOrderRow(sheet, trimmedName);
    
    if (row < 0) {
      lock.releaseLock();
      return { success: false, message: `No order found for "${userName}" today.` };
    }
    
    // Verify the row still belongs to this user
    const verifyName = sheet.getRange(row, CONFIG.COLUMNS.WHO).getValue();
    if (!verifyName || verifyName.toString().trim().toLowerCase() !== trimmedName.toLowerCase()) {
      lock.releaseLock();
      return { success: false, message: 'Order was modified. Please refresh and try again.' };
    }
    
    sheet.getRange(row, CONFIG.COLUMNS.PAID).clearContent();
    
    lock.releaseLock();
    
    return { 
      success: true, 
      message: `Payment status cleared for "${userName}".`
    };
    
  } catch (error) {
    try { lock.releaseLock(); } catch(e) {}
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Gets all orders for today (for viewing)
 */
function getTodayOrders() {
  try {
    const sheet = getTodaySheetOnly();
    if (!sheet) {
      return {
        success: true,
        date: getTodaySheetName(),
        orders: [],
        totalOrders: 0,
        totalAmount: 0,
        paidCount: 0,
        unpaidCount: 0
      };
    }
    
    const dataRange = sheet.getRange(CONFIG.ORDER_START_ROW, CONFIG.COLUMNS.WHO, CONFIG.MAX_ORDERS, 4);
    const values = dataRange.getValues();
    
    const orders = [];
    let totalAmount = 0;
    
    for (let i = 0; i < values.length; i++) {
      if (values[i][0] && values[i][0].toString().trim() !== '') {
        const price = parseFloat(values[i][2]) || 0;
        totalAmount += price;
        orders.push({
          row: i + 1,
          name: values[i][0],
          order: values[i][1],
          price: price,
          paid: values[i][3] ? true : false
        });
      }
    }
    
    return {
      success: true,
      date: getTodaySheetName(),
      orders: orders,
      totalOrders: orders.length,
      totalAmount: totalAmount
    };
    
  } catch (error) {
    return { success: false, message: 'Error: ' + error.message };
  }
}

/**
 * Generates a text summary of today's orders
 * Can be used by the web app or the spreadsheet menu
 */
function generateOrderSummary() {
  const result = getTodayOrders();
  
  if (!result.success) {
    return result.message;
  }
  
  const orders = result.orders;
  
  let text = `TRX Exchange 106, Level 17\n`;
  
  if (orders.length === 0) {
    text += 'No orders yet today.\n';
    return text;
  }
  
  // Order list - simple format with padded numbers
  orders.forEach(order => {
    const rowNum = order.row.toString().padStart(2, ' ');
    text += `${rowNum}. ${order.order} ${order.price}\n`;
  });
  
  return text;
}

/**
 * Shows the order summary in a dialog (for spreadsheet menu)
 */
function showOrderSummaryDialog() {
  const summary = generateOrderSummary();
  const ui = SpreadsheetApp.getUi();
  ui.alert('Order Summary', summary, ui.ButtonSet.OK);
}

// ==================== API FOR WEB APP ====================
/**
 * Gets menu item order counts from today's orders
 * Returns an object with menu item names as keys and counts as values
 */
function getMenuItemCounts() {
  try {
    const ss = getSpreadsheet();
    const sheetName = getTodaySheetName();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return { counts: {}, orderedBy: {} }; // No orders today yet
    }
    
    // Get both WHO and WHAT columns
    const dataRange = sheet.getRange(CONFIG.ORDER_START_ROW, CONFIG.COLUMNS.WHO, CONFIG.MAX_ORDERS, 2);
    const values = dataRange.getValues();
    
    const counts = {};
    const orderedBy = {}; // Track who ordered what
    const menu = getMenuData();
    
    // Get all menu item names for matching
    const menuItems = [];
    for (const [category, items] of Object.entries(menu)) {
      for (const item of items) {
        menuItems.push(item.name);
      }
    }
    
    // Count each menu item in orders and track who ordered
    for (let i = 0; i < values.length; i++) {
      const whoOrdered = values[i][0];
      const orderText = values[i][1];
      
      if (orderText && orderText.toString().trim() !== '' && whoOrdered) {
        // Normalize order text: remove notes in parentheses for matching
        // "酿豆腐 (茄子x2) + 蒸鱼片" → "酿豆腐 + 蒸鱼片" for matching purposes
        const orderTextNormalized = orderText.toString().replace(/\s*\([^)]*\)/g, '');
        
        // Check each menu item
        for (const menuItem of menuItems) {
          // Extract the main part of the menu item name (strip brackets)
          // e.g., "酿豆腐（茄子，苦瓜，豆腐）" → "酿豆腐"
          const menuNameNoBrackets = menuItem.replace(/[\s]*[（(].*$/g, '').trim();
          
          // Extract Chinese characters only (for emoji items like "🥦 花椰菜🥦")
          const chineseMatch = menuNameNoBrackets.match(/[\u4e00-\u9fff\u3400-\u4dbf]+/g);
          const menuChineseOnly = chineseMatch ? chineseMatch.join('') : menuNameNoBrackets;
          
          // Check if this menu item appears in the normalized order text
          if (orderTextNormalized.includes(menuChineseOnly) || orderTextNormalized.includes(menuNameNoBrackets)) {
            counts[menuItem] = (counts[menuItem] || 0) + 1;
            
            // Track who ordered this item
            if (!orderedBy[menuItem]) {
              orderedBy[menuItem] = [];
            }
            orderedBy[menuItem].push(whoOrdered.toString().trim());
          }
        }
      }
    }
    
    return { counts, orderedBy };
    
  } catch (error) {
    console.error('Error getting menu counts:', error);
    return { counts: {}, orderedBy: {} };
  }
}

/**
 * Gets menu data with order counts and who ordered
 */
function getMenuWithCounts() {
  const menu = getMenuData();
  const { counts, orderedBy } = getMenuItemCounts();
  
  // Add counts and orderedBy to menu items
  for (const [category, items] of Object.entries(menu)) {
    for (const item of items) {
      item.count = counts[item.name] || 0;
      item.orderedBy = orderedBy[item.name] || [];
    }
  }
  
  return menu;
}

function getMenuForSidebar() {
  return getMenuWithCounts(); // Now returns menu with counts
}

function getTodayDate() {
  return getTodaySheetName();
}

function isOrderTimeValid() {
  return true; // Change to: return new Date().getHours() < 10; for production
}

// ==================== SPREADSHEET UI (Optional) ====================
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🍱 Lunch Order')
      .addItem('📝 Update Menu from F2', 'updateMenuFromF2WithAlert')
      .addItem('🌐 Get Web App URL', 'showWebAppUrl')
      .addToUi();
  } catch (e) {
    // Running as web app, no UI available
  }
}

function updateMenuFromF2WithAlert() {
  const result = updateMenuFromF2();
  const ui = SpreadsheetApp.getUi();
  if (result.success) {
    ui.alert('Success', result.message, ui.ButtonSet.OK);
  } else {
    ui.alert('Error', result.message, ui.ButtonSet.OK);
  }
}

function showWebAppUrl() {
  const ui = SpreadsheetApp.getUi();
  ui.alert('Web App URL', 
    'Deploy this script as a web app:\n\n' +
    '1. Click Deploy → New deployment\n' +
    '2. Select "Web app"\n' +
    '3. Set "Who has access" to "Anyone"\n' +
    '4. Click Deploy\n' +
    '5. Copy the URL and share with your team!',
    ui.ButtonSet.OK);
}

function generateOrderSummary() {
  const result = getTodayOrders();
  if (!result.success) {
    SpreadsheetApp.getUi().alert('Error', result.message, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const summary = result.orders.map((o, i) => `${i + 1}. ${o.name}: ${o.order} - RM${o.price}`).join('\n');
  
  SpreadsheetApp.getUi().alert('Order Summary', 
    `📅 ${result.date}\n` +
    `📦 Total Orders: ${result.totalOrders}\n` +
    `💰 Total Amount: RM${result.totalAmount}\n\n` +
    `Orders:\n${summary}`,
    SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Get payment QR image URL
 */
function getPaymentQRImage() {
  // File ID from: https://drive.google.com/file/d/1wRvkPHxrIFAGT1aMyNUt59uGmXWymthe/view
  const fileId = '1wRvkPHxrIFAGT1aMyNUt59uGmXWymthe';
  // Use lh3.googleusercontent.com format which works better for embedding
  return 'https://lh3.googleusercontent.com/d/' + fileId;
}