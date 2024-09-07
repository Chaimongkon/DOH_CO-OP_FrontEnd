"use client";
import React, { useCallback, useState, useEffect } from "react";
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
import HomeApplication from "@/layout/application/HomeApplication";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
import "./styles.css";
import { Slide } from "@/types";



const PageSlide = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

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
        image: base64ToBlobUrl(slide.Image, "image/webp"),
        url: slide.URLLink,
      }));

      setSlides(processedData);
    } catch (error) {
      console.error("Failed to fetch images:", error);
    }
  }, [API]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    
    <section
      className="text-white bg-cover bg-center primary-overlay overlay-dense"
      style={{ background: 'url("image/SlideBackGround.jpg") repeat' }}
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
                <img className="img-fluid" src={slide.image} alt="" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <HomeApplication />
      </div>
    </section>
  );
};

export default PageSlide;
