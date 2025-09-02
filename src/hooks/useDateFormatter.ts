import { useMemo, useCallback } from 'react';

// Thai month names
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", 
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
] as const;

// Thai month abbreviations
const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", 
  "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
  "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
] as const;

// Thai day names
const THAI_DAYS = [
  "อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"
] as const;

// Thai day abbreviations
const THAI_DAYS_SHORT = [
  "อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."
] as const;

export type DateFormatType = 
  | 'thai-full'        // "1 เดือนมกราคม 2567"
  | 'thai-with-prefix' // "วันที่ 1 เดือนมกราคม 2567" 
  | 'thai-short'       // "1/1/2567"
  | 'thai-medium'      // "1 ม.ค. 2567"
  | 'thai-with-day'    // "วันจันทร์ที่ 1 เดือนมกราคม 2567"
  | 'gregorian-short'  // "1/1/2024" (Gregorian year)
  | 'iso-date';        // "2024-01-01"

export interface DateFormatterOptions {
  /** Default format to use when no format is specified */
  defaultFormat?: DateFormatType;
  /** Custom error message for invalid dates */
  invalidDateMessage?: string;
  /** Whether to use Buddhist era (พ.ศ.) or Gregorian era (ค.ศ.) */
  useBuddhistEra?: boolean;
}

export interface UseDateFormatterReturn {
  /** Format a date string or Date object to Thai format */
  formatDate: (
    dateInput: string | Date | number,
    format?: DateFormatType
  ) => string;
  
  /** Format date with full Thai month name */
  formatThaiFullDate: (dateInput: string | Date | number) => string;
  
  /** Format date with prefix "วันที่" */
  formatThaiWithPrefix: (dateInput: string | Date | number) => string;
  
  /** Format date in short format (dd/mm/yyyy) */
  formatThaiShortDate: (dateInput: string | Date | number) => string;
  
  /** Format date with abbreviated month */
  formatThaiMediumDate: (dateInput: string | Date | number) => string;
  
  /** Format date with day name */
  formatThaiWithDay: (dateInput: string | Date | number) => string;
  
  /** Get current date in Thai format */
  getCurrentThaiDate: (format?: DateFormatType) => string;
  
  /** Check if date is valid */
  isValidDate: (dateInput: string | Date | number) => boolean;
  
  /** Get Buddhist year from date */
  getBuddhistYear: (dateInput: string | Date | number) => number | null;
  
  /** Get Thai month name */
  getThaiMonthName: (monthIndex: number, abbreviated?: boolean) => string;
  
  /** Get Thai day name */
  getThaiDayName: (dayIndex: number, abbreviated?: boolean) => string;
}

/**
 * Custom hook for formatting dates in Thai (Buddhist era) format
 * 
 * @param options - Configuration options for date formatting
 * 
 * @example
 * ```tsx
 * const { formatDate, formatThaiFullDate, getCurrentThaiDate } = useDateFormatter({
 *   defaultFormat: 'thai-full',
 *   useBuddhistEra: true
 * });
 * 
 * // Format a date string
 * const formattedDate = formatDate('2024-01-15'); // "15 เดือนมกราคม 2567"
 * 
 * // Format with specific format
 * const shortDate = formatDate('2024-01-15', 'thai-short'); // "15/1/2567"
 * ```
 */
export function useDateFormatter(
  options: DateFormatterOptions = {}
): UseDateFormatterReturn {
  const {
    defaultFormat = 'thai-full',
    invalidDateMessage = 'Invalid date',
    useBuddhistEra = true,
  } = options;

  // Memoized utility functions
  const parseDate = useCallback((dateInput: string | Date | number): Date | null => {
    try {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }, []);

  const isValidDate = useCallback((dateInput: string | Date | number): boolean => {
    return parseDate(dateInput) !== null;
  }, [parseDate]);

  const getBuddhistYear = useCallback((dateInput: string | Date | number): number | null => {
    const date = parseDate(dateInput);
    if (!date) return null;
    
    const gregorianYear = date.getFullYear();
    return useBuddhistEra ? gregorianYear + 543 : gregorianYear;
  }, [parseDate, useBuddhistEra]);

  const getThaiMonthName = useCallback((monthIndex: number, abbreviated = false): string => {
    if (monthIndex < 0 || monthIndex > 11) return '';
    return abbreviated ? THAI_MONTHS_SHORT[monthIndex] : THAI_MONTHS[monthIndex];
  }, []);

  const getThaiDayName = useCallback((dayIndex: number, abbreviated = false): string => {
    if (dayIndex < 0 || dayIndex > 6) return '';
    return abbreviated ? THAI_DAYS_SHORT[dayIndex] : THAI_DAYS[dayIndex];
  }, []);

  // Core formatting functions
  const formatThaiFullDate = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    const day = date.getDate();
    const month = date.getMonth();
    const year = getBuddhistYear(dateInput);
    
    return `${day} เดือน${getThaiMonthName(month)} ${year}`;
  }, [parseDate, invalidDateMessage, getBuddhistYear, getThaiMonthName]);

  const formatThaiWithPrefix = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    const day = date.getDate();
    const month = date.getMonth();
    const year = getBuddhistYear(dateInput);
    
    return `วันที่ ${day} เดือน${getThaiMonthName(month)} ${year}`;
  }, [parseDate, invalidDateMessage, getBuddhistYear, getThaiMonthName]);

  const formatThaiShortDate = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    const day = date.getDate();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const year = getBuddhistYear(dateInput);
    
    return `${day}/${month}/${year}`;
  }, [parseDate, invalidDateMessage, getBuddhistYear]);

  const formatThaiMediumDate = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    const day = date.getDate();
    const month = date.getMonth();
    const year = getBuddhistYear(dateInput);
    
    return `${day} ${getThaiMonthName(month, true)} ${year}`;
  }, [parseDate, invalidDateMessage, getBuddhistYear, getThaiMonthName]);

  const formatThaiWithDay = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    const dayName = getThaiDayName(date.getDay());
    const day = date.getDate();
    const month = date.getMonth();
    const year = getBuddhistYear(dateInput);
    
    return `วัน${dayName}ที่ ${day} เดือน${getThaiMonthName(month)} ${year}`;
  }, [parseDate, invalidDateMessage, getBuddhistYear, getThaiMonthName, getThaiDayName]);

  const formatGregorianShort = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear(); // Use Gregorian year
    
    return `${day}/${month}/${year}`;
  }, [parseDate, invalidDateMessage]);

  const formatIsoDate = useCallback((dateInput: string | Date | number): string => {
    const date = parseDate(dateInput);
    if (!date) return invalidDateMessage;

    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }, [parseDate, invalidDateMessage]);

  // Main format function
  const formatDate = useCallback((
    dateInput: string | Date | number,
    format: DateFormatType = defaultFormat
  ): string => {
    switch (format) {
      case 'thai-full':
        return formatThaiFullDate(dateInput);
      case 'thai-with-prefix':
        return formatThaiWithPrefix(dateInput);
      case 'thai-short':
        return formatThaiShortDate(dateInput);
      case 'thai-medium':
        return formatThaiMediumDate(dateInput);
      case 'thai-with-day':
        return formatThaiWithDay(dateInput);
      case 'gregorian-short':
        return formatGregorianShort(dateInput);
      case 'iso-date':
        return formatIsoDate(dateInput);
      default:
        return formatThaiFullDate(dateInput);
    }
  }, [
    defaultFormat,
    formatThaiFullDate,
    formatThaiWithPrefix,
    formatThaiShortDate,
    formatThaiMediumDate,
    formatThaiWithDay,
    formatGregorianShort,
    formatIsoDate,
  ]);

  // Get current date
  const getCurrentThaiDate = useCallback((format: DateFormatType = defaultFormat): string => {
    return formatDate(new Date(), format);
  }, [formatDate, defaultFormat]);

  // Memoized return object
  return useMemo(() => ({
    formatDate,
    formatThaiFullDate,
    formatThaiWithPrefix,
    formatThaiShortDate,
    formatThaiMediumDate,
    formatThaiWithDay,
    getCurrentThaiDate,
    isValidDate,
    getBuddhistYear,
    getThaiMonthName,
    getThaiDayName,
  }), [
    formatDate,
    formatThaiFullDate,
    formatThaiWithPrefix,
    formatThaiShortDate,
    formatThaiMediumDate,
    formatThaiWithDay,
    getCurrentThaiDate,
    isValidDate,
    getBuddhistYear,
    getThaiMonthName,
    getThaiDayName,
  ]);
}

export default useDateFormatter;