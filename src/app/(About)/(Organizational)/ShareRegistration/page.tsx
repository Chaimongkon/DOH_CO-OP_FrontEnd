import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import ShareRegistrationClient from "./ShareRegistrationClient";

export const metadata = generateOrganizationalMetadata({
  title: "ฝ่ายทะเบียนหุ้น | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลเจ้าหน้าที่ฝ่ายทะเบียนหุ้นและติดตามหนี้สินสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด พร้อมข้อมูลการจัดการหุ้นและติดตามหนี้",
  keywords: ["ฝ่ายทะเบียนหุ้น", "ติดตามหนี้สิน", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "ทะเบียนหุ้น", "หนี้สิน"],
  ogTitle: "ฝ่ายทะเบียนหุ้น",
  ogDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายทะเบียนหุ้นและติดตามหนี้สินสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  twitterTitle: "ฝ่ายทะเบียนหุ้น",
  twitterDescription: "ข้อมูลเจ้าหน้าที่ฝ่ายทะเบียนหุ้นและติดตามหนี้สินสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function ShareRegistration() {
  const initialData = await fetchOrganizationalData("ฝ่ายทะเบียนหุ้นและติดตามหนี้สิน");
  
  return <ShareRegistrationClient initialData={initialData} />;
}
