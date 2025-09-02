import { Metadata } from "next";
import { getApiConfig } from "@/lib/config";
import logger from "@/lib/logger";
import {
  BankAccountService,
  BankAccountApiService,
  BANK_ACCOUNT_CONFIG,
  BANK_ACCOUNT_ENDPOINTS,
  mapApiServiceToService,
} from "@/types/bank-account";
import BankAccountClient from "./BankAccountClient";
import BankAccountErrorBoundary from "./BankAccountErrorBoundary";

export const metadata: Metadata = {
  title: "บัญชีธนาคารสหกรณ์ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลบัญชีธนาคารและการให้บริการทางการเงินของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด รวมถึงแบบฟอร์มและเอกสารที่เกี่ยวข้อง",
  keywords: ["บัญชีธนาคาร", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "บริการทางการเงิน", "แบบฟอร์ม", "ดาวน์โหลด"],
  authors: [{ name: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" }],
  openGraph: {
    title: "บัญชีธนาคารสหกรณ์ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    description: "ข้อมูลบัญชีธนาคารและการให้บริการทางการเงินของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    type: "website",
    locale: "th_TH",
    siteName: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  },
  twitter: {
    card: "summary",
    title: "บัญชีธนาคารสหกรณ์",
    description: "ข้อมูลบัญชีธนาคารและการให้บริการทางการเงินของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
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

async function fetchBankAccountData(): Promise<BankAccountService[]> {
  try {
    const { apiUrl, fileUrl } = getApiConfig();
    const response = await fetch(`${apiUrl}${BANK_ACCOUNT_ENDPOINTS.SERVICES}`, {
      next: { revalidate: BANK_ACCOUNT_CONFIG.defaultCacheTime },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const data: BankAccountApiService[] = await response.json();
    
    return data
      .map((service: BankAccountApiService) => 
        mapApiServiceToService(service, fileUrl)
      )
      .filter(
        (service: BankAccountService) => 
          service.subcategories === BANK_ACCOUNT_CONFIG.subcategoryFilter && 
          service.status
      );
  } catch (error) {
    logger.error("Failed to fetch bank account data:", error);
    return [];
  }
}

export default async function BankAccountPage() {
  const initialData = await fetchBankAccountData();
  
  return (
    <BankAccountErrorBoundary>
      <BankAccountClient initialData={initialData} />
    </BankAccountErrorBoundary>
  );
}