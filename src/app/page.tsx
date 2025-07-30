// app/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "antd";
import Head from "next/head";
import CookieConsent from "@/components/CookieConsent";
import AppDetails from "./(Home)/AppDetails/page";
import ClientSections from "@/components/ClientSections";
import SlidesPage from "./(Home)/Slides/page";
import DialogBoxes from "./(Home)/DialogBoxes/page";
import NewsPage from "./(Home)/News/page";
import CoopMiddle from "./(Home)/(PhotoVideoInterest)/CoopMiddle/page";
import SnowParticles from "@/components/SnowParticles";
import FireworksParticles from "@/components/Particles";

export default function Home() {
  const [isHappyNewYear, setIsHappyNewYear] = useState(false);
  const pathname = usePathname();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API}/StatusHome`);
        const data = await response.json();
        const statusCode = data.some(
          (item: { Id: number; Status: number }) =>
            item.Id === 2 && item.Status === 1
        );
        setIsHappyNewYear(statusCode);
      } catch (error) {
        console.error("Failed to fetch status:", error);
      }
    };

    fetchStatus();
  }, [API]);

  useEffect(() => {
    if (isHappyNewYear && pathname === "/") {
      document.querySelectorAll(".bg-cover").forEach((element) => {
        (element as HTMLElement).style.backgroundSize = "cover";
        (element as HTMLElement).style.background = "transparent";
      });
    }
  }, [isHappyNewYear, pathname]);

  return (
    <>
      <Head>
        {/* Page-specific SEO for Homepage */}
        <title>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด | บริการเงินฝาก สินเชื่อ และสวัสดิการ</title>
        <meta name="description" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ให้บริการเงินฝาก สินเชื่อ และสวัสดิการสำหรับสมาชิกกรมทางหลวง พร้อมอัตราดอกเบี้ยที่ดี ข่าวสาร กิจกรรม และข้อมูลสำคัญ" />
        <meta name="keywords" content="สหกรณ์ออมทรัพย์กรมทางหลวง, เงินฝาก, สินเชื่อ, สวัสดิการ, ดอกเบี้ย, สมาชิก, ข่าวสาร, กิจกรรม" />
        <link rel="canonical" href="https://www.dohsaving.com" />
        
        {/* Homepage specific Open Graph */}
        <meta property="og:title" content="สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด - หน้าแรก" />
        <meta property="og:url" content="https://www.dohsaving.com" />
        <meta property="og:image" content="https://www.dohsaving.com/image/home-og-image.png" />
      </Head>

      <main role="main" className={isHappyNewYear ? "happy-new-year" : ""}>
        <CookieConsent />
        <Suspense fallback={<Skeleton />}>
          {isHappyNewYear ? <FireworksParticles /> : <SnowParticles />}
          
          <section aria-label="ข่าวประชาสัมพันธ์และข้อมูลสำคัญ">
            <DialogBoxes />
          </section>
          
          <section aria-label="ภาพสไลด์แสดงบริการและกิจกรรม">
            <SlidesPage />
          </section>
          
          <section aria-label="ข่าวสารและประชาสัมพันธ์">
            <NewsPage />
          </section>
          
          <section aria-label="กิจกรรมและความร่วมมือ">
            <CoopMiddle />
          </section>
          
          <section aria-label="รายละเอียดแอปพลิเคชันและบริการ">
            <AppDetails />
          </section>
          
          <section aria-label="ข้อมูลสำหรับลูกค้าและสมาชิก">
            <ClientSections />
          </section>
        </Suspense>
      </main>
    </>
  );
}