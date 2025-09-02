import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import InformationClient from "./InformationClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายสารสนเทศ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายสารสนเทศสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลการจัดการระบบสารสนเทศและเทคโนโลยี",
  keywords: ["ฝ่ายสารสนเทศ", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "สารสนเทศ", "เทคโนโลยี", "ระบบสารสนเทศ"],
  ogTitle: "ฝ่ายสารสนเทศ",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายสารสนเทศสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายสารสนเทศ",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายสารสนเทศสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Information() {
  const initialData = await fetchOrganizationalData("ฝ่ายสารสนเทศ");
  
  return <InformationClient initialData={initialData} />;
}
