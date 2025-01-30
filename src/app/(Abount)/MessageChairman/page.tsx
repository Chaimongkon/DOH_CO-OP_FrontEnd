"use client";

import { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  Autoplay,
  Pagination,
  Navigation,
  EffectFade,
  EffectCube,
} from "swiper/modules";

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
            society.societyType === "สารจากประธานกรรมการดำเนินการ"
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
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="text-uppercase lined mb-4">
              {society.length > 0 ? `${society[0].societyType}` : "Loading..."}{" "}
              สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด{" "}
            </h2>
          </header>
          <Swiper
            spaceBetween={30}
            effect={"cube"}
            grabCursor={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            cubeEffect={{
              shadow: true,
              slideShadows: true,
              shadowOffset: 20,
              shadowScale: 0.94,
            }}
            pagination={{
              clickable: true,
            }}
            modules={[Autoplay, EffectCube, Pagination, Navigation]}
            className="mySwiper"
          >
            {society.map((s, i) => (
              <SwiperSlide>
                <center key={i}>
                  <div className="container py-4">
                    <img
                      className="custom-image-size"
                      src={s.imagePath}
                      alt=""
                    />
                  </div>
                </center>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>
    </>
  );
};

export default Vision;
