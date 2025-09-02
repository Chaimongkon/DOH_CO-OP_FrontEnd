import { generateSocietyMetadata } from "@/utils/societyMetadata";
import { fetchSocietyData } from "@/utils/societyFetcher";
import PolicyClient from "./PolicyClient";

export const metadata = generateSocietyMetadata({
  title: "นโยบายสหกรณ์ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "นโยบายและแนวปฏิบัติของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด เพื่อการดำเนินงานที่มีประสิทธิภาพและการให้บริการที่ตอบสนองความต้องการของสมาชิก",
  keywords: ["นโยบายสหกรณ์", "แนวปฏิบัติ", "สหกรณ์ออมทรัพย์กรมทางหลวง", "การดำเนินงาน", "บริการสมาชิก", "เป้าหมายองค์กร"],
  ogTitle: "นโยบายสหกรณ์",
  ogDescription: "นโยบายและแนวปฏิบัติของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "นโยบายสหกรณ์",
  twitterDescription: "นโยบายและแนวปฏิบัติของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Policy() {
  const initialData = await fetchSocietyData("นโยบายสหกรณ์");
  
  return <PolicyClient initialData={initialData} />;
}
