import type { Metadata } from 'next';

export const homeMetadata: Metadata = {
  title: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด | บริการเงินฝาก สินเชื่อ และสวัสดิการ',
  description: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง พร้อมอัตราดอกเบี้ยที่ดี ข่าวสาร กิจกรรม และข้อมูลสำคัญ',
  keywords: [
    'สหกรณ์ออมทรัพย์กรมทางหลวง',
    'เงินฝาก',
    'สินเชื่อ', 
    'สวัสดิการ',
    'ดอกเบี้ย',
    'สมาชิก',
    'ข่าวสาร',
    'กิจกรรม'
  ],
  authors: [{ name: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด' }],
  creator: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด',
  publisher: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: 'https://www.dohsaving.com',
    title: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด - หน้าแรก',
    description: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง',
    images: [
      {
        url: 'https://www.dohsaving.com/image/home-og-image.png',
        width: 1200,
        height: 630,
        alt: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด',
      },
    ],
    siteName: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด',
    description: 'สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง',
    images: ['https://www.dohsaving.com/image/home-og-image.png'],
  },
  alternates: {
    canonical: 'https://www.dohsaving.com',
  },
  verification: {
    google: 'your-google-verification-code', // ใส่ verification code จริงเมื่อมี
  },
};