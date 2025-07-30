// app/layout.tsx
"use client";
import { Inter } from "next/font/google";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import TopHeader from "@/layout/topheader/TopHeader";
import ClientWrapper from "@/components/ClientWrapper";
import VisitsCount from "@/components/VisitsCount";
import Footer from "@/layout/footer/Footer";
import SnowParticles from "@/components/SnowParticles";
import Snowflake from "@/components/Snowflake";
import Head from "next/head";

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap"
});

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const [isSnow, setIsSnow] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API}/StatusHome`);
        const data = await response.json();
        const statusCode = data.some(
          (item: { Id: number; Status: number }) =>
            item.Id === 3 && item.Status === 1
        );
        setIsSnow(statusCode);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    };

    fetchStatus();
  }, [API]);

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Basic SEO Meta Tags */}
        <title>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด | บริการเงินฝาก สินเชื่อ และสวัสดิการ</title>
        <meta name="description" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง พร้อมอัตราดอกเบี้ยที่ดี" />
        <meta name="keywords" content="สหกรณ์ออมทรัพย์, กรมทางหลวง, เงินฝาก, สินเชื่อ, สวัสดิการ, ดอกเบี้ย, สมาชิก, ข้าราชการ, พนักงาน, ออมทรัพย์" />
        <meta name="author" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.dohsaving.com" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" />
        <meta property="og:description" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.dohsaving.com" />
        <meta property="og:image" content="https://www.dohsaving.com/images/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" />
        <meta property="og:locale" content="th_TH" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" />
        <meta name="twitter:description" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง" />
        <meta name="twitter:image" content="https://www.dohsaving.com/images/og-image.jpg" />
        
        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/icon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* External Resources - Optimized Loading */}
        <link
          rel="preload"
          href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
          integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/css/swiper-bundle.min.css" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "name": "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
              "url": "https://www.dohsaving.com",
              "logo": "https://www.dohsaving.com/image/home-og-image.png",
              "description": "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง",
              "areaServed": "Thailand",
              "serviceType": "Financial Services",
              "telephone": "+66-2-xxx-xxxx",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "ที่อยู่ของสหกรณ์",
                "addressLocality": "กรุงเทพฯ",
                "addressCountry": "TH"
              },
              "sameAs": [
                "https://www.facebook.com/dohsaving"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <TopHeader className="top-header" />
        <VisitsCount />

        {isSnow && <Snowflake />}
        {pathname !== "/" && <SnowParticles />}

        <ClientWrapper>{children}</ClientWrapper>
        <Footer className="footer-top" />
        <script
          src="/vendor/bootstrap/js/bootstrap.bundle.min.js"
          defer
        ></script>
      </body>
    </html>
  );
}