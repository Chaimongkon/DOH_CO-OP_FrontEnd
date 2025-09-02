/**
 * SEO Metadata utilities for DOH Cooperative website
 * ยูทิลิตี้สำหรับจัดการ SEO metadata ของเว็บไซต์สหกรณ์ออมทรัพย์กรมทางหลวง
 */

import { Metadata } from "next";

// Base metadata configuration
const BASE_CONFIG = {
  siteName: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://dohsaing.com",
  locale: "th_TH",
  twitterHandle: "@dohcoop",
  author: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  commonKeywords: [
    "สหกรณ์ออมทรัพย์",
    "กรมทางหลวง",
    "สหกรณ์",
    "ออมทรัพย์",
    "สินเชื่อ",
    "เงินฝาก",
    "สวัสดิการ",
    "สมาชิก"
  ],
} as const;

// Metadata generation interface
interface MetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Generate comprehensive metadata for pages
 * สร้าง metadata ที่ครบถ้วนสำหรับหน้าเว็บ
 */
export function generateMetadata(config: MetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = "website",
    noIndex = false,
  } = config;

  const fullTitle = `${title} | ${BASE_CONFIG.siteName}`;
  const allKeywords = [...BASE_CONFIG.commonKeywords, ...keywords];
  const pageUrl = url ? `${BASE_CONFIG.siteUrl}${url}` : BASE_CONFIG.siteUrl;

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: BASE_CONFIG.author }],
    creator: BASE_CONFIG.author,
    publisher: BASE_CONFIG.author,
    
    // OpenGraph metadata
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: BASE_CONFIG.siteName,
      locale: BASE_CONFIG.locale,
      type,
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
    },

    // Twitter metadata
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: BASE_CONFIG.twitterHandle,
      images: image ? [image] : [],
    },

    // Robots configuration
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Additional metadata
    category: "สหกรณ์ออมทรัพย์",
    classification: "ธุรกิจการเงิน",
    
    // Structured data
    other: {
      "og:locale:alternate": ["en_US"],
    },
  };
}

/**
 * Generate metadata for organizational pages
 * สร้าง metadata สำหรับหน้าองค์กร
 */
export function generateOrganizationalMetadata(departmentName: string, description?: string): Metadata {
  const defaultDescription = `ข้อมูล${departmentName}ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมรายชื่อและตำแหน่งหน้าที่`;
  
  return generateMetadata({
    title: departmentName,
    description: description || defaultDescription,
    keywords: [
      departmentName,
      "โครงสร้างองค์กร",
      "บุคลากร",
      "คณะกรรมการ",
      "เจ้าหน้าที่",
    ],
    url: `/about/organizational/${departmentName.toLowerCase()}`,
  });
}

/**
 * Generate metadata for About section pages
 * สร้าง metadata สำหรับหน้าเกี่ยวกับเรา
 */
export function generateAboutMetadata(pageName: string, description: string, additionalKeywords: string[] = []): Metadata {
  return generateMetadata({
    title: pageName,
    description,
    keywords: [
      ...additionalKeywords,
      "เกี่ยวกับเรา",
      "ข้อมูลสหกรณ์",
      "ประวัติ",
      "นโยบาย",
    ],
    url: `/about/${pageName.toLowerCase()}`,
  });
}

/**
 * Generate JSON-LD structured data for organization
 * สร้างข้อมูล structured data รูปแบบ JSON-LD สำหรับองค์กร
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "CooperativeOrganization",
    "name": BASE_CONFIG.siteName,
    "alternateName": "DOH Cooperative",
    "url": BASE_CONFIG.siteUrl,
    "logo": `${BASE_CONFIG.siteUrl}/logo.png`,
    "description": "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการทางการเงินแก่สมาชิกข้าราชการและลูกจ้างกรมทางหลวง",
    "foundingDate": "1977-05-30",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TH",
      "addressLocality": "กรุงเทพมหานคร",
      "addressRegion": "กรุงเทพมหานคร",
      "streetAddress": "กรมทางหลวง"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["th", "en"]
    },
    "sameAs": [
      // Add social media URLs here when available
    ]
  };
}

/**
 * Default metadata for error pages
 * metadata เริ่มต้นสำหรับหน้า error
 */
export const errorPageMetadata: Metadata = generateMetadata({
  title: "ไม่พบหน้าที่ต้องการ",
  description: "ขออภัย ไม่พบหน้าที่คุณต้องการ กรุณาตรวจสอบ URL หรือกลับไปหน้าหลัก",
  keywords: ["404", "ไม่พบหน้า", "ข้อผิดพลาด"],
  noIndex: true,
});

/**
 * Default metadata for the home page
 * metadata เริ่มต้นสำหรับหน้าหลัก
 */
export const homePageMetadata: Metadata = generateMetadata({
  title: "หน้าหลัก",
  description: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการทางการเงินครบวงจร สินเชื่อ เงินฝาก สวัสดิการ และบริการอื่นๆ แก่สมาชิก",
  keywords: [
    "หน้าหลัก",
    "บริการทางการเงิน",
    "สินเชื่อดอกเบียต่ำ",
    "เงินฝากดอกเบียสูง",
    "สวัสดิการสมาชิก",
  ],
  url: "/",
});