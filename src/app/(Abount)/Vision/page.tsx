"use client";
import { useState, useEffect, useCallback } from "react";
interface Society {
  id: number;
  imagePath: string;
  societyType: string;
  status: boolean;
}

const Vision = () => {
  const [society, setSociety] = useState<Society[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/SocietyCoop`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const processedData: Society[] = data
        .map((society: any) => ({
          id: society.Id,
          imagePath: society.ImagePath ? `${URLFile}${society.ImagePath}` : "",
          societyType: society.SocietyType,
          status: society.IsActive,
        }))
        .filter(
          (society: Society) =>
            society.societyType === "ค่านิยม วิสัยทัศน์ พันธกิจ"
        );

      setSociety(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <>
      <section className="py-5">
        {society.map((s, i) => (
          <div className="container py-4" key={i}>
            <header className="mb-5">
              <h2 className="text-uppercase lined mb-4">
                {s.societyType} สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด{" "}
              </h2>
            </header>
            <center>
              <img className="img-fluid" src={s.imagePath} alt="" />
            </center>
          </div>
        ))}
      </section>
    </>
  );
};

export default Vision;
