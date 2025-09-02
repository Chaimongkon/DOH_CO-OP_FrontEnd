import { Metadata } from "next";
import { getApiConfig } from "@/lib/config";
import { ApiSociety } from "@/types";
import { Society } from "@/types/about";
import logger from "@/lib/logger";
import BoardEthicsClient from "./BoardEthicsClient";

export const metadata: Metadata = {
  title: "จรรยาบรรณสำหรับคณะกรรมการดำเนินการ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "จรรยาบรรณและหลักจริยธรรมสำหรับคณะกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด เพื่อการบริหารงานที่โปร่งใสและเป็นธรรม",
  keywords: ["จรรยาบรรณ", "คณะกรรมการ", "จริยธรรม", "สหกรณ์ออมทรัพย์กรมทางหลวง", "ธรรมาภิบาล", "การบริหารงาน"],
  authors: [{ name: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" }],
  openGraph: {
    title: "จรรยาบรรณสำหรับคณะกรรมการดำเนินการ",
    description: "จรรยาบรรณและหลักจริยธรรมสำหรับคณะกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    type: "website",
    locale: "th_TH",
    siteName: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  },
  twitter: {
    card: "summary",
    title: "จรรยาบรรณสำหรับคณะกรรมการดำเนินการ",
    description: "จรรยาบรรณและหลักจริยธรรมสำหรับคณะกรรมการดำเนินการ",
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

async function fetchBoardEthicsData(): Promise<Society[]> {
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
          society.societyType === "จรรยาบรรณสำหรับคณะกรมมการดำเนินการ" && 
          society.status && 
          society.imagePath
      );
  } catch (error) {
    logger.error("Failed to fetch board ethics data:", error);
    return [];
  }
}

export default async function BoardEthics() {
  const initialData = await fetchBoardEthicsData();
  
  return <BoardEthicsClient initialData={initialData} />;
}
