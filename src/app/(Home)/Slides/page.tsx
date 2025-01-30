"use client";
import React, { useCallback, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-cube";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation, EffectCube } from "swiper/modules";
import HomeApplication from "@/layout/application/HomeApplication";
import "./styles.css";
import { Slide } from "@/types";
import HomeElection from "@/layout/election/HomeElection";

const PageSlide = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [statusHome, setStatusHome] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const URLFile = process.env.NEXT_PUBLIC_PICHER_BASE_URL;

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Slides`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const processedData = data.map((slide: any) => ({
        id: slide.Id,
        no: slide.No,
        imagePath: slide.ImagePath ? `${URLFile}${slide.ImagePath}` : "",
        url: slide.URLLink,
      }));

      setSlides(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API}/StatusHome`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
  
      // ค้นหารายการที่มี Id เท่ากับ 1
      const StatusCode = data.find((item: { Id: number; Status: number }) => item.Id === 1)?.Status === 1;
  
      setStatusHome(StatusCode); // ตั้งค่าผลลัพธ์ที่ตรวจสอบแล้วไปที่ `setStatusHome`
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  }, [API]);
  

  useEffect(() => {
    fetchImages();
    fetchStatus();
  }, [fetchImages, fetchStatus]);

  return (
    <section
      className="text-white bg-cover bg-center primary-overlay overlay-dense"
    >
      <div className="overlay-content py-5">
        <div className="container py-4">
          <Swiper
            spaceBetween={30}
            effect={"cube"}
            grabCursor={true}
            autoplay={{
              delay: 2500,
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
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <img className="img-fluid" src={slide.imagePath} alt="" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {statusHome ? <HomeElection /> : <HomeApplication />}
      </div>
    </section>
  );
};

export default PageSlide;
