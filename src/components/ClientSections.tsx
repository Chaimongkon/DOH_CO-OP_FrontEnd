import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";

export default function SwiperMenu() {
  return (
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
          <img
            className="img-fluid img-grayscale d-block mx-auto"
            src="image/ImageMenu/QA.png"
            alt="..."
            style={{ width: "100px" }}
          />
          <p className="lead mb-4" style={{ textAlign: "center" }}>
            กระดานถาม ตอบ
          </p>
        </div>
      </SwiperSlide>

      <SwiperSlide style={{ width: "270px" }}>
        <div className="swiper-slide h-auto">
          <img
            className="img-fluid img-grayscale d-block mx-auto"
            src="image/ImageMenu/Report.png"
            alt="..."
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
  );
}
