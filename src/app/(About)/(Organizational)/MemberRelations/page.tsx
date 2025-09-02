import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import MemberRelationsClient from "./MemberRelationsClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายสัมพันธ์สมาชิก | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายสัมพันธ์สมาชิกสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลบริการสมาชิกและสวัสดิการ",
  keywords: ["ฝ่ายสัมพันธ์สมาชิก", "สวัสดิการ", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "บริการสมาชิก", "สมาชิกสัมพันธ์"],
  ogTitle: "ฝ่ายสัมพันธ์สมาชิก",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายสัมพันธ์สมาชิกสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายสัมพันธ์สมาชิก",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายสัมพันธ์สมาชิกสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function MemberRelations() {
  const initialData = await fetchOrganizationalData("ฝ่ายสมาชิกสัมพันธ์และสวัสดิการ");
  
  return <MemberRelationsClient initialData={initialData} />;
}
