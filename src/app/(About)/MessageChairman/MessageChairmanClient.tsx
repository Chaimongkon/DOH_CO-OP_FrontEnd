"use client";
import { memo } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cube";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  Autoplay,
  Pagination,
  Navigation,
  EffectCube,
} from "swiper/modules";
import styles from "./MessageChairman.module.css";
import { Society } from "@/types/about";
import DataStates from "@/components/DataStates";
import { useSociety } from "@/hooks/useSociety";

interface MessageChairmanClientProps {
  initialData: Society[];
}

const MessageChairmanClient = memo(function MessageChairmanClient({ initialData }: MessageChairmanClientProps) {
  const { 
    society, 
    loading, 
    error, 
    fetchImages 
  } = useSociety("สารจากประธานกรรมการดำเนินการ", initialData);

  return (
    <DataStates
      loading={loading}
      error={error}
      isEmpty={society.length === 0}
      onRetry={fetchImages}
      loadingText="กำลังโหลดสารจากประธานกรรมการดำเนินการ..."
      emptyText="ไม่พบสารจากประธานกรรมการดำเนินการ"
      emptyDescription="ไม่มีสารจากประธานกรรมการดำเนินการที่จะแสดง"
    >
      <main role="main" aria-label="สารจากประธานกรรมการดำเนินการสหกรณ์">
        <section 
          className={styles.section} 
          aria-label="สารจากประธานกรรมการดำเนินการ"
          aria-describedby="chairman-message-description"
        >
          <div id="chairman-message-description" className="sr-only">
            หน้านี้แสดงสารจากประธานกรรมการดำเนินการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ในรูปแบบสไลด์โชว์แบบได้ามิคและโต้ตอบได้
          </div>
          <article className={styles.container} aria-labelledby="chairman-title">
            <header className={styles.header}>
              <h1 
                id="chairman-title"
                className={styles.title}
                role="heading" 
                aria-level={1}
                tabIndex={0}
              >
                {society.length > 0 ? society[0].societyType : "สารจากประธานกรรมการดำเนินการ"} สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
              </h1>
            </header>
            <div 
              className={styles.swiperContainer}
              role="region"
              aria-label="สไลด์โชว์แสดงสารจากประธานกรรมการดำเนินการ"
              aria-describedby="swiper-instructions"
            >
              <div id="swiper-instructions" className="sr-only">
                ใช้ปุ่มลูกศรซ้าย-ขวาหรือแตะที่จุดเพื่อเปลี่ยนสไลด์ สไลด์จะเปลี่ยนโดยอัตโนมัติทุก 3.5 วินาที
              </div>
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
                  bulletActiveClass: 'swiper-pagination-bullet-active',
                }}
                navigation={{
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                }}
                modules={[Autoplay, EffectCube, Pagination, Navigation]}
                className={styles.swiper}
                a11y={{
                  enabled: true,
                  prevSlideMessage: 'สไลด์ก่อนหน้า',
                  nextSlideMessage: 'สไลด์ถัดไป',
                  firstSlideMessage: 'สไลด์แรก',
                  lastSlideMessage: 'สไลด์สุดท้าย',
                  paginationBulletMessage: 'ไปที่สไลด์ {{index}}',
                }}
                role="img"
                aria-label="สไลด์โชว์สารจากประธานกรรมการดำเนินการ"
              >
                {society.map((s, index) => (
                  <SwiperSlide 
                    key={s.id}
                    role="img"
                    aria-label={`สไลด์ที่ ${index + 1} จาก ${society.length}: ${s.societyType}`}
                  >
                    <div className={styles.slideContent}>
                      <Image
                        src={s.imagePath}
                        alt={`สารจากประธานกรรมการดำเนินการ สไลด์ที่ ${index + 1} ประกอบด้วยข้อความและเนื้อหาสำคัญจากประธานกรรมการ สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด`}
                        width={800}
                        height={600}
                        className={styles.image}
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                        style={{
                          width: '70%',
                          height: 'auto',
                          maxWidth: '700px',
                        }}
                        aria-describedby={`slide-content-${s.id}`}
                      />
                      <div id={`slide-content-${s.id}`} className="sr-only">
                        รูปภาพนี้แสดงเนื้อหาสารจากประธานกรรมการดำเนินการในรูปแบบที่สามารถอ่านและทำความเข้าใจได้
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </article>
        </section>
      </main>
    </DataStates>
  );
});

export default MessageChairmanClient;