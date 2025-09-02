import { generateSocietyMetadata } from "@/utils/societyMetadata";
import { fetchSocietyData } from "@/utils/societyFetcher";
import VisionClient from "./VisionClient";

export const metadata = generateSocietyMetadata({
  title: "วิสัยทัศน์ พันธกิจ ค่านิยม | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "วิสัยทัศน์ พันธกิจ และค่านิยมของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด มุ่งเน้นการให้บริการทางการเงินที่เป็นเลิศ และการพัฒนาคุณภาพชีวิตสมาชิก",
  keywords: ["วิสัยทัศน์", "พันธกิจ", "ค่านิยม", "สหกรณ์ออมทรัพย์กรมทางหลวง", "ภารกิจ", "เป้าหมายองค์กร"],
  ogTitle: "วิสัยทัศน์ พันธกิจ ค่านิยม | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  ogDescription: "วิสัยทัศน์ พันธกิจ และค่านิยมของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "วิสัยทัศน์ พันธกิจ ค่านิยม",
  twitterDescription: "วิสัยทัศน์ พันธกิจ และค่านิยมของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Vision() {
  const initialData = await fetchSocietyData("ค่านิยม วิสัยทัศน์ พันธกิจ");
  
  return <VisionClient initialData={initialData} />;
}
