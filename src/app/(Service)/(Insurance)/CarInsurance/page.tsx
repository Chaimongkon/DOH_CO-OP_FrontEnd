"use client";

import { useState, useEffect, useCallback } from "react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";


interface Society {
  id: number;
  image: string;
  subcategories: string;
  status: boolean;
}

const CarInsurance = () => {
  const [society, setSociety] = useState<Society[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;


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
          (society: Society) => society.subcategories === "บริการทำประกัยรถยนต์"
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
            <center>
              <img className="img-fluid-7" src={s.image} alt="" />
            </center>
          </div>
        ))}
      </section>
    </>
  );
};

export default CarInsurance;
