import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import AuditorClient from "./AuditorClient";

export const metadata = generateOrganizationalMetadata({
  title: "ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมรายชื่อและตำแหน่งหน้าที่",
  keywords: ["ผู้ตรวจสอบบัญชี", "ผู้ตรวจสอบกิจการ", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "การตรวจสอบ"],
  ogTitle: "ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ",
  ogDescription: "ข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ",
  twitterDescription: "ข้อมูลผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Auditor() {
  const initialData = await fetchOrganizationalData("ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ");
  
  return <AuditorClient initialData={initialData} />;
}
