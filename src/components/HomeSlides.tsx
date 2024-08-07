// /src/components/HomeSlides.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { base64ToBlobUrl } from "@/utils/base64ToBlobUrl";
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
import "./styles.css";
// Define the interface for the slide
interface Slide {
  id: number;
  no: number;
  image: string; // This will be the base64 string initially
  url: string;
}

const HomeSlides = ({ slides }: { slides: Slide[] }) => {
  const [blobUrls, setBlobUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = slides.map((slide) => {
      if (slide.image) {
        return base64ToBlobUrl(slide.image, "image/webp");
      }
      return "";
    });
    setBlobUrls(urls);

    return () => {
      // Revoke the object URLs to free up memory
      urls.forEach((url) => url && URL.revokeObjectURL(url));
    };
  }, [slides]);

  const handleClick = (sliderUrl: string) => {
    if (sliderUrl) {
      window.open(sliderUrl, "_blank");
    }
  };

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
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                {blobUrls[index] && (
                  <img
                    className="img-fluid"
                    src={blobUrls[index]}
                    alt=""
                    onClick={() => handleClick(slide.url)}
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <HomeApplication />
      </div>
    </section>
  );
};

export default HomeSlides;
