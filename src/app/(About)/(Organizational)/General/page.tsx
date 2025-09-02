import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import GeneralClient from "./GeneralClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายทั่วไป | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายทั่วไปสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลการบริหารจัดการและงานสนับสนุนทั่วไป",
  keywords: ["ฝ่ายทั่วไป", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "บริหารจัดการ", "งานบริหาร", "งานทั่วไป"],
  ogTitle: "ฝ่ายทั่วไป",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายทั่วไปสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายทั่วไป",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายทั่วไปสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function General() {
  const initialData = await fetchOrganizationalData("ฝ่ายทั่วไป");
  
  return <GeneralClient initialData={initialData} />;
}
