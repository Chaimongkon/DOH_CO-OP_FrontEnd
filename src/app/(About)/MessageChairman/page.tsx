import { generateSocietyMetadata } from "@/utils/societyMetadata";
import { fetchSocietyData } from "@/utils/societyFetcher";
import MessageChairmanClient from "./MessageChairmanClient";

export const metadata = generateSocietyMetadata({
  title: "สารจากประธานกรรมการดำเนินการ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "สารจากประธานกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ข้อความและนโยบายจากผู้นำองค์กรเพื่อการพัฒนาสหกรณ์และการให้บริการสมาชิก",
  keywords: ["สารประธาน", "ประธานกรรมการ", "สหกรณ์ออมทรัพย์กรมทางหลวง", "ข้อความประธาน", "นโยบายผู้บริหาร", "ผู้นำสหกรณ์"],
  ogTitle: "สารจากประธานกรรมการดำเนินการ",
  ogDescription: "สารจากประธานกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "สารจากประธานกรรมการดำเนินการ",
  twitterDescription: "สารจากประธานกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function MessageChairman() {
  const initialData = await fetchSocietyData("สารจากประธานกรรมการดำเนินการ");
  
  return <MessageChairmanClient initialData={initialData} />;
}
