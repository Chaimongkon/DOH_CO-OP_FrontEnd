import { Metadata } from "next";
import { getApiConfig } from "@/lib/config";
import { ApiSociety } from "@/types";
import { Society } from "@/types/about";
import logger from "@/lib/logger";
import OfficerEthicsClient from "./OfficerEthicsClient";

export const metadata: Metadata = {
  title: "จรรยาบรรณสำหรับเจ้าหน้าที่ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "จรรยาบรรณและหลักจริยธรรมสำหรับเจ้าหน้าที่สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด เพื่อการให้บริการที่มีมาตรฐานและเป็นมืออาชีพ",
  keywords: ["จรรยาบรรณ", "เจ้าหน้าที่", "จริยธรรม", "สหกรณ์ออมทรัพย์กรมทางหลวง", "มาตรฐานการทำงาน", "การให้บริการ"],
  authors: [{ name: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" }],
  openGraph: {
    title: "จรรยาบรรณสำหรับเจ้าหน้าที่",
    description: "จรรยาบรรณและหลักจริยธรรมสำหรับเจ้าหน้าที่สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    type: "website",
    locale: "th_TH",
    siteName: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  },
  twitter: {
    card: "summary",
    title: "จรรยาบรรณสำหรับเจ้าหน้าที่",
    description: "จรรยาบรรณและหลักจริยธรรมสำหรับเจ้าหน้าที่",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

async function fetchOfficerEthicsData(): Promise<Society[]> {
  try {
    const { apiUrl, fileUrl } = getApiConfig();
    const response = await fetch(`${apiUrl}/SocietyCoop`, {
      next: { revalidate: 3600 }, // Cache for 1 hour, revalidate every hour
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const data: ApiSociety[] = await response.json();
    
    return data
      .map((society: ApiSociety) => ({
        id: society.Id,
        imagePath: society.ImagePath ? `${fileUrl}${society.ImagePath}` : "",
        societyType: society.SocietyType,
        status: society.IsActive,
      }))
      .filter(
        (society: Society) =>
          society.societyType === "จรรยาบรรณสำหรับเจ้าหน้าที่" && 
          society.status && 
          society.imagePath
      );
  } catch (error) {
    logger.error("Failed to fetch officer ethics data:", error);
    return [];
  }
}

export default async function OfficerEthics() {
  const initialData = await fetchOfficerEthicsData();
  
  return <OfficerEthicsClient initialData={initialData} />;
}
