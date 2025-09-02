import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ภาพกิจกรรมสหกรณ์ทั้งหมด | สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  description: "รวมภาพกิจกรรมและเหตุการณ์ต่าง ๆ ของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  keywords: ["ภาพกิจกรรม", "สหกรณ์ออมทรัพย์", "กรมทางหลวง", "อัลบั้มภาพ", "กิจกรรมสหกรณ์"],
};

export default function AlbumPhotosOverAllLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}