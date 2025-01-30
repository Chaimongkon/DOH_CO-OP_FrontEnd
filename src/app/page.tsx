"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Skeleton } from "antd";
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
    <div className={isHappyNewYear ? "happy-new-year" : ""}>
      <CookieConsent />
      <Suspense fallback={<Skeleton />}>
        {isHappyNewYear ? <FireworksParticles /> : <SnowParticles />}
        <DialogBoxes />
        <SlidesPage />
        <NewsPage />
        <CoopMiddle />
        <AppDetails />
        <ClientSections />
      </Suspense>
    </div>
  );
}
