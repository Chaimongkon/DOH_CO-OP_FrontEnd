"use client";
import { Suspense, useEffect, useRef } from "react";
import { FloatButton, Skeleton } from "antd";
import CookieConsent from "@/components/CookieConsent";
import AppDetails from "./(Home)/AppDetails/page";
import ClientSections from "@/components/ClientSections";
import SlidesPage from "./(Home)/Slides/page";
import DialogBoxes from "./(Home)/DialogBoxes/page";
import NewsPage from "./(Home)/News/page";
import CoopMiddle from "./(Home)/(PhotoVideoInterest)/CoopMiddle/page";

export default function Home() {
 
  return (
    <div>
      <CookieConsent />
      <Suspense fallback={<Skeleton />}>
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
