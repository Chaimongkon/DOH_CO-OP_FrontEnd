"use client";

import { useState, useEffect, useCallback } from "react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import { useRouter } from "next/navigation";

interface Society {
  id: number;
  image: string;
  subcategories: string;
  status: boolean;
}

const MemberShip = () => {
  const [society, setSociety] = useState<Society[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Serve`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const processedData: Society[] = data
        .map((society: any) => ({
          id: society.Id,
          image: base64ToBlobUrl(society.Image, "image/webp"),
          subcategories: society.Subcategories,
          status: society.IsActive,
        }))
        .filter(
          (society: Society) =>
            society.subcategories === "สวัสดิการสมาชิกสามัญประเภท ข"
        );

      setSociety(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleViewAllClick = () => {
    localStorage.setItem("menuName", "แบบฟอร์มขอรับสวัสดิการ");
    router.push("/Welfare");
  };

  return (
    <>
      <section className="py-5">
        {society.map((s, i) => (
          <div className="container py-4" key={i}>
            <center>
              <img className="img-fluid-7" src={s.image} alt="" />
            </center>
          </div>
        ))}
        <div className="container py-4">
          <div className="row gy-4">
            <h3 className="text-uppercase lined mb-4">
              ดาวน์โหลดเอกสารใช้ในการขอสวัสดิการของสมาชิก
            </h3>
          </div>
          <ul className="list-unstyled">
            <li className="d-flex mb-32">
              <div
                className="icon-filled2 me-2"
                style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)" }}
              >
                <i className="fas fa-download"></i>
              </div>
              <a
                href="/Welfare"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleViewAllClick}
              >
                <p className="text-sm3 mb-0">สวัสดิการสมาชิกสามัญประเภท ข</p>
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default MemberShip;
