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

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด</title>
        <link rel="icon" type="image/x-icon" href="/icon.ico" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.7.1/css/all.css"
          integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/css/swiper-bundle.min.css" />
      </head>
      <body className={inter.className}>
        <TopHeader className="top-header" />
        <VisitsCount />

        {isSnow && <Snowflake />} {/* Show Snowflake on all pages if isSnow is true */}
        {pathname !== "/" && <SnowParticles />} {/* Show SnowParticles on all pages except "/" */}
        
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
