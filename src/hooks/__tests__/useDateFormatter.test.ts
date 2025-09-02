// Test data for useDateFormatter hook

export const testDates = {
  // ISO date string
  isoDate: '2024-01-15T10:30:00.000Z',
  
  // Date object
  dateObject: new Date('2024-01-15'),
  
  // Timestamp
  timestamp: 1705305600000, // January 15, 2024
  
  // Invalid date
  invalidDate: 'invalid-date-string',
  
  // Edge cases
  leapYear: '2024-02-29T00:00:00.000Z',
  endOfYear: '2024-12-31T23:59:59.999Z',
  startOfYear: '2024-01-01T00:00:00.000Z',
};

export const expectedOutputs = {
  // Expected Thai date formats for January 15, 2024 (15 มกราคม 2567)
  thaiFullDate: '15 เดือนมกราคม 2567',
  thaiWithPrefix: 'วันที่ 15 เดือนมกราคม 2567',
  thaiShortDate: '15/1/2567',
  thaiMediumDate: '15 ม.ค. 2567',
  thaiWithDay: 'วันจันทร์ที่ 15 เดือนมกราคม 2567', // January 15, 2024 is a Monday
  gregorianShort: '15/1/2024',
  isoFormat: '2024-01-15',
};

// This file serves as test data for the useDateFormatter hook
// In a full test environment, you would add actual unit tests here using Jest/React Testing Library

// Example usage patterns that should work:
/*
const { formatDate, formatThaiFullDate, getCurrentThaiDate } = useDateFormatter();

// Basic formatting
formatDate('2024-01-15') // "15 เดือนมกราคม 2567"
formatDate('2024-01-15', 'thai-short') // "15/1/2567"

// Specific formatters
formatThaiFullDate('2024-01-15') // "15 เดือนมกราคม 2567"
formatThaiWithPrefix('2024-01-15') // "วันที่ 15 เดือนมกราคม 2567"

// Current date
getCurrentThaiDate() // Current date in default format
getCurrentThaiDate('thai-short') // Current date in short format

// Utility functions
isValidDate('2024-01-15') // true
isValidDate('invalid-date') // false
getBuddhistYear('2024-01-15') // 2567
getThaiMonthName(0) // "มกราคม"
getThaiDayName(1) // "จันทร์"
*/