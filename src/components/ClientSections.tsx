import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Navigation } from 'swiper/modules';
import "swiper/css";
import "swiper/css/pagination";
import 'swiper/css/navigation';
import Link from "next/link";
import { useState } from "react";
import Complaint from "@/app/(ClientSections)/Complaint/page";

export default function SwiperMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  return (
    <>
      <Swiper
        spaceBetween={30}
        breakpoints={{
          991: {
            slidesPerView: 6,
            spaceBetween: 30,
          },
          0: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
        }}
        modules={[Pagination, Navigation]} // Include Pagination module
        pagination={{ clickable: true }}
        navigation={true}
        style={{ marginTop: "50px" }}
      >
        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto">
            <a
              href="https://doh.icoopsiam.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="img-fluid img-grayscale d-block mx-auto"
                src="image/ImageMenu/LoginApp.png"
                alt="..."
                style={{
                  width: "100px",
                  borderRadius: "50%",
                  boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
                }}
              />
            </a>
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              เข้าสู่ระบบสมาชิกออนไลน์
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto">
            <Link href="/BankAccount">
              <img
                className="img-fluid img-grayscale d-block mx-auto"
                src="image/ImageMenu/bookbankcoop.png"
                alt="..."
                style={{ width: "135px" }}
              />
              <p className="lead mb-4" style={{ textAlign: "center" }}>
                บัญชีธนาคารสหกรณ์
              </p>
            </Link>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto">
          <a
              href="/Questions"
              target="_blank"
              rel="noopener noreferrer"
            >
            <img
              className="img-fluid img-grayscale d-block mx-auto"
              src="image/ImageMenu/QA.png"
              alt="..."
              style={{ width: "100px" }}
            />
             </a>
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              กระดานถาม ตอบ
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto" onClick={handleOpenDialog}>
            <img
              className="img-fluid img-grayscale d-block mx-auto"
              src="image/ImageMenu/Report.png"
              alt="แจ้งข้อเสนอแนะ ร้องเรียน"
              style={{
                width: "100px",
                borderRadius: "50%",
                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
              }}
            />
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              แจ้งข้อเสนอแนะ ร้องเรียน
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto">
            <img
              className="img-fluid img-grayscale d-block mx-auto"
              src="image/ImageMenu/customer-66.png"
              alt="..."
              style={{ width: "115px" }}
            />
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              แจ้งการฝาก-ถอน
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto">
            <Link href="/Contact">
              <img
                className="img-fluid img-grayscale d-block mx-auto"
                src="image/ImageMenu/Contact.png"
                alt="..."
                style={{
                  width: "100px",
                  borderRadius: "50%",
                  boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
                }}
              />
              <p className="lead mb-4" style={{ textAlign: "center" }}>
                ติดต่อ สอ.ทล.
              </p>
            </Link>
          </div>
        </SwiperSlide>
      </Swiper>
      <Complaint open={isDialogOpen} handleClose={handleCloseDialog} />
    </>
  );
}
