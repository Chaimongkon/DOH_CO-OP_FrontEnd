import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import FinancelClient from "./FinancelClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายการเงินและการลงทุน | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายการเงินและการลงทุนสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลการจัดการเงินทุนและการลงทุน",
  keywords: ["ฝ่ายการเงิน", "การลงทุน", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "จัดการเงินทุน", "การเงิน"],
  ogTitle: "ฝ่ายการเงินและการลงทุน",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายการเงินและการลงทุนสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายการเงินและการลงทุน",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายการเงินและการลงทุนสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Financel() {
  const initialData = await fetchOrganizationalData("ฝ่ายการเงินและการลงทุน");
  
  return <FinancelClient initialData={initialData} />;
}
