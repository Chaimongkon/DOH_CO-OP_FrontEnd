import { generateOrganizationalMetadata } from "@/utils/organizationalMetadata";
import { fetchOrganizationalData } from "@/utils/organizationalFetcher";
import BoardClient from "./BoardClient";

export const metadata = generateOrganizationalMetadata({
  title: "คณะกรรมการดำเนินการ ชุดที่ 49 | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "ข้อมูลคณะกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ชุดที่ 49 พร้อมรายชื่อและตำแหน่งของกรรมการทุกท่าน",
  keywords: ["คณะกรรมการ", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "กรรมการดำเนินการ", "ชุดที่ 49"],
  ogTitle: "คณะกรรมการดำเนินการ ชุดที่ 49",
  ogDescription: "ข้อมูลคณะกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ชุดที่ 49",
  twitterTitle: "คณะกรรมการดำเนินการ ชุดที่ 49",
  twitterDescription: "ข้อมูลคณะกรรมการดำเนินการสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
});

export default async function Board() {
  const initialData = await fetchOrganizationalData("คณะกรรมการดำเนินการ ชุดที่ 49");
  
  return <BoardClient initialData={initialData} />;
}
