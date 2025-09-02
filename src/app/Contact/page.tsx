import { Metadata } from "next";
import ContactClient from "./ContactClient";
import logger from "@/lib/logger";
import { Contact } from "@/types/contact";

export const metadata: Metadata = {
  title: "ติดต่อเรา | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ช่องทางการติดต่อสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ที่อยู่ เบอร์โทรศัพท์ เวลาทำการ และช่องทางติดต่อเพิ่มเติม",
  keywords: "ติดต่อ, สหกรณ์, กรมทางหลวง, เบอร์โทร, ที่อยู่, เวลาทำการ",
  openGraph: {
    title: "ติดต่อเรา | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    description: "ช่องทางการติดต่อสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    type: "website",
  },
};

async function getContacts(): Promise<Contact[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  try {
    const response = await fetch(`${API_BASE_URL}/Contract`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    const data = responseData.data || responseData;
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logger.error("Failed to fetch contact data on server:", error);
    return [];
  }
}

export default async function ContactPage() {
  const initialData = await getContacts();

  return <ContactClient initialData={initialData} />;
}
