/**
 * Accessibility utilities for DOH Cooperative website
 * ยูทิลิตี้สำหรับการเข้าถึงได้ของเว็บไซต์สหกรณ์ออมทรัพย์กรมทางหลวง
 */

import React, { JSX } from 'react';
import logger from './logger';

// Accessibility configuration
export const A11Y_CONFIG = {
  // Thai language support
  language: 'th',
  locale: 'th-TH',
  
  // Common ARIA labels in Thai
  labels: {
    // Navigation
    mainNavigation: 'เมนูหลัก',
    breadcrumb: 'เส้นทางนำทาง',
    skipToContent: 'ข้ามไปยังเนื้อหาหลัก',
    backToTop: 'กลับไปด้านบน',
    
    // Content areas
    mainContent: 'เนื้อหาหลัก',
    sidebar: 'แถบด้านข้าง',
    footer: 'ส่วนท้ายเว็บไซต์',
    
    // Loading states
    loading: 'กำลังโหลด...',
    loadingComplete: 'โหลดเสร็จสิ้น',
    
    // Actions
    close: 'ปิด',
    open: 'เปิด',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    search: 'ค้นหา',
    
    // Data states
    noData: 'ไม่มีข้อมูล',
    error: 'เกิดข้อผิดพลาด',
    retry: 'ลองใหม่',
  },
  
  // Common descriptions in Thai
  descriptions: {
    image: 'รูปภาพ',
    document: 'เอกสาร',
    pdf: 'ไฟล์ PDF',
    externalLink: 'ลิงก์ภายนอก',
    newWindow: 'เปิดในหน้าต่างใหม่',
  },
} as const;

/**
 * Generate unique ID for accessibility
 * สร้าง ID ที่ไม่ซ้ำกันสำหรับการเข้าถึงได้
 */
let idCounter = 0;
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Create accessible image props
 * สร้าง props สำหรับรูปภาพที่เข้าถึงได้
 */
export function createAccessibleImageProps(
  alt: string,
  description?: string,
  decorative: boolean = false
) {
  if (decorative) {
    return {
      alt: '',
      role: 'presentation',
      'aria-hidden': true,
    };
  }

  const props: Record<string, string> = {
    alt,
  };

  if (description) {
    const descId = generateA11yId('img-desc');
    props['aria-describedby'] = descId;
    props['data-description'] = description;
    props['data-description-id'] = descId;
  }

  return props;
}

/**
 * Create accessible heading props
 * สร้าง props สำหรับหัวข้อที่เข้าถึงได้
 */
export function createAccessibleHeadingProps(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  id?: string,
  className?: string
) {
  const headingId = id || generateA11yId('heading');
  
  return {
    role: 'heading',
    'aria-level': level,
    id: headingId,
    className,
    tabIndex: level === 1 ? 0 : -1, // Make main headings focusable
  };
}

/**
 * Create accessible list props
 * สร้าง props สำหรับรายการที่เข้าถึงได้
 */
export function createAccessibleListProps(
  label?: string,
  labelledBy?: string,
  description?: string
) {
  const props: Record<string, string | undefined> = {
    role: 'list',
  };

  if (label) {
    props['aria-label'] = label;
  }

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }

  if (description) {
    const descId = generateA11yId('list-desc');
    props['aria-describedby'] = descId;
    props['data-description'] = description;
    props['data-description-id'] = descId;
  }

  return props;
}

/**
 * Create accessible button props
 * สร้าง props สำหรับปุ่มที่เข้าถึงได้
 */
export function createAccessibleButtonProps(
  label: string,
  description?: string,
  pressed?: boolean,
  expanded?: boolean
) {
  const props: Record<string, string | boolean> = {
    'aria-label': label,
    type: 'button',
  };

  if (description) {
    const descId = generateA11yId('btn-desc');
    props['aria-describedby'] = descId;
    props['data-description'] = description;
    props['data-description-id'] = descId;
  }

  if (typeof pressed === 'boolean') {
    props['aria-pressed'] = pressed;
  }

  if (typeof expanded === 'boolean') {
    props['aria-expanded'] = expanded;
  }

  return props;
}

/**
 * Create accessible landmark props
 * สร้าง props สำหรับจุดสำคัญที่เข้าถึงได้
 */
export function createAccessibleLandmarkProps(
  role: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary' | 'region',
  label?: string,
  labelledBy?: string
) {
  const props: Record<string, string> = {
    role,
  };

  if (label) {
    props['aria-label'] = label;
  }

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }

  return props;
}

/**
 * Screen reader only text component
 * คอมโพเนนต์สำหรับข้อความที่อ่านได้เฉพาะ screen reader
 */
export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  React.createElement(
    'span',
    {
      className: 'sr-only',
      style: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      },
    },
    children
  );

/**
 * Skip link component
 * คอมโพเนนต์สำหรับลิงก์ข้าม
 */
// Interfaces for the components and utilities
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

interface FocusManagement {
  focusById: (id: string, delay?: number) => void;
  focusFirst: (container: HTMLElement) => void;
  trapFocus: (container: HTMLElement) => () => void;
}

interface A11yTesting {
  checkAriaLabels: (element: HTMLElement) => boolean;
  checkContrast: (foreground: string, background: string) => number;
  logIssues: () => void;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className = '' }): JSX.Element => (
  React.createElement('a', {
    href,
    className: `skip-link ${className}`,
    style: {
      position: 'absolute',
      left: '-10000px',
      top: 'auto',
      width: '1px',
      height: '1px',
      overflow: 'hidden',
    },
    onfocus: (e: React.FocusEvent<HTMLAnchorElement>) => {
      e.target.style.position = 'static';
      e.target.style.width = 'auto';
      e.target.style.height = 'auto';
      e.target.style.left = 'auto';
      e.target.style.overflow = 'visible';
    },
    onBlur: (e: React.FocusEvent<HTMLAnchorElement>) => {
      e.target.style.position = 'absolute';
      e.target.style.left = '-10000px';
      e.target.style.top = 'auto';
      e.target.style.width = '1px';
      e.target.style.height = '1px';
      e.target.style.overflow = 'hidden';
    }
  },
    children
  )
);

/**
 * Focus management utilities
 * ยูทิลิตี้สำหรับการจัดการ focus
 */
export const focusManagement: FocusManagement = {
  /**
   * Set focus to element by ID
   * ตั้งค่า focus ไปยัง element ตาม ID
   */
  focusById(id: string, delay: number = 0): void {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.focus();
      }
    }, delay);
  },

  /**
   * Set focus to first focusable element in container
   * ตั้งค่า focus ไปยัง element แรกที่สามารถ focus ได้ใน container
   */
  focusFirst(container: HTMLElement): void {
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusable[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }
  },

  /**
   * Trap focus within container
   * จำกัด focus ภายใน container
   */
  trapFocus(container: HTMLElement): () => void {
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    function handleTabKey(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
};

/**
 * Accessibility testing utilities
 * ยูทิลิตี้สำหรับการทดสอบการเข้าถึงได้
 */
export const a11yTesting: A11yTesting = {
  /**
   * Check if element has proper ARIA labels
   * ตรวจสอบว่า element มี ARIA label ที่เหมาะสมหรือไม่
   */
  checkAriaLabels(element: HTMLElement): boolean {
    const hasLabel = element.hasAttribute('aria-label') || 
                    element.hasAttribute('aria-labelledby') ||
                    element.textContent?.trim();
    return Boolean(hasLabel);
  },

  /**
   * Check color contrast ratio
   * ตรวจสอบอัตราส่วนความคมชัดของสี
   */
  checkContrast(foreground: string, background: string): number {
    // Simplified contrast calculation
    // In production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // This is a simplified version - use proper color parsing in production
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(x => {
        const val = parseInt(x) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Log accessibility issues to console (development only)
   * แสดงปัญหาการเข้าถึงได้ใน console (สำหรับ development เท่านั้น)
   */
  logIssues(): void {
    if (process.env.NODE_ENV !== 'development') return;

    // Check for missing alt text on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      logger.warn(`🔍 A11Y Warning: ${images.length} images missing alt text`, { elements: Array.from(images) });
    }

    // Check for headings without proper hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.slice(1));
      if (level > lastLevel + 1) {
        logger.warn('🔍 A11Y Warning: Heading hierarchy skip detected', {
          element: heading.tagName,
          text: heading.textContent || '',
          level
        });
      }
      lastLevel = level;
    });

    // Check for buttons without labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    const unlabeledButtons = Array.from(buttons).filter(btn => !btn.textContent?.trim());
    if (unlabeledButtons.length > 0) {
      logger.warn(`🔍 A11Y Warning: ${unlabeledButtons.length} buttons without labels`, { elements: Array.from(unlabeledButtons) });
    }
  },
};

/**
 * Thai language specific accessibility helpers
 * ตัวช่วยสำหรับการเข้าถึงได้เฉพาะภาษาไทย
 */
export const thaiA11y = {
  /**
   * Create Thai number pronunciation for screen readers
   * สร้างการออกเสียงตัวเลขภาษาไทยสำหรับ screen reader
   */
  formatThaiNumber(num: number): string {
    const thaiDigits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    return num.toString().split('').map(digit => thaiDigits[parseInt(digit)]).join('');
  },

  /**
   * Create Thai ordinal for screen readers
   * สร้างลำดับภาษาไทยสำหรับ screen reader
   */
  formatThaiOrdinal(num: number): string {
    return `ที่ ${num}`;
  },

  /**
   * Create accessible Thai date
   * สร้างวันที่ภาษาไทยที่เข้าถึงได้
   */
  formatThaiDate(date: Date): string {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear() + 543; // Convert to Buddhist Era
    
    return `วันที่ ${day} ${month} พ.ศ. ${year}`;
  },
};

const accessibility = {
  A11Y_CONFIG,
  generateA11yId,
  createAccessibleImageProps,
  createAccessibleHeadingProps,
  createAccessibleListProps,
  createAccessibleButtonProps,
  createAccessibleLandmarkProps,
  ScreenReaderOnly,
  SkipLink,
  focusManagement,
  a11yTesting,
  thaiA11y,
};

export default accessibility;