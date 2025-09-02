import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import ExecutiveClient from "./ExecutiveClient";

export const metadata = generateOrganizationalMetadata({
  title: "ผู้จัดการใหญ่และรองผู้จัดการฯ | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลผู้จัดการใหญ่และรองผู้จัดการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมรายชื่อและตำแหน่งบริหาร",
  keywords: ["ผู้จัดการใหญ่", "รองผู้จัดการ", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "ผู้บริหาร"],
  ogTitle: "ผู้จัดการใหญ่และรองผู้จัดการฯ",
  ogDescription: "ข้อมูลผู้จัดการใหญ่และรองผู้จัดการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ผู้จัดการใหญ่และรองผู้จัดการฯ",
  twitterDescription: "ข้อมูลผู้จัดการใหญ่และรองผู้จัดการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Executive() {
  const initialData = await fetchOrganizationalData("ผู้จัดการใหญ่และรองผู้จัดการฯ");
  
  return <ExecutiveClient initialData={initialData} />;
}
