import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import AccountClient from "./AccountClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายบัญชี | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายบัญชีสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลการจัดการบัญชีและการเงิน",
  keywords: ["ฝ่ายบัญชี", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "บัญชี", "การเงิน", "จัดการบัญชี"],
  ogTitle: "ฝ่ายบัญชี",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายบัญชีสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายบัญชี",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายบัญชีสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Account() {
  const initialData = await fetchOrganizationalData("ฝ่ายบัญชี");
  
  return <AccountClient initialData={initialData} />;
}
