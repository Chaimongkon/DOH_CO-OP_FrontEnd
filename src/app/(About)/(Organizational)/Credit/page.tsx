import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import CreditClient from "./CreditClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายสินเชื่อ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายสินเชื่อสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลการติดต่อและบริการสินเชื่อต่างๆ",
  keywords: ["ฝ่ายสินเชื่อ", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "สินเชื่อ", "เงินกู้", "บริการสินเชื่อ"],
  ogTitle: "ฝ่ายสินเชื่อ",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายสินเชื่อสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายสินเชื่อ",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายสินเชื่อสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Credit() {
  const initialData = await fetchOrganizationalData("ฝ่ายสินเชื่อ");
  
  return <CreditClient initialData={initialData} />;
}
