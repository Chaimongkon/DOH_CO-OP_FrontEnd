import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";



export default () => {
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView="auto"
      onSlideChange={() => {}}
      onSwiper={(swiper) => {}}
      style={{ marginTop: "50px" }}
    >
      <SwiperSlide style={{ width: "270px" }}>
        {" "}
        <div className="swiper-slide h-auto">
          <Link href="/Contact">
            <img
              className="img-fluid img-grayscale d-block mx-auto"
              src="image/ImageMenu/Contact.png"
              alt="..."
              width={100}
              height={100}
              style={{
                width: "100px",
                borderRadius: "50%",
                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
              }}
            />
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              ติดต่อ สอ.ทล.{" "}
            </p>
          </Link>
        </div>
      </SwiperSlide>
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
              width={100}
              height={100}
              style={{
                width: "100px",
                borderRadius: "50%",
                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
              }}
            />
          </a>
          <p className="lead mb-4" style={{ textAlign: "center" }}>
            เข้าสู้ระบบสมาชิกออนไลน์
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
              width={100}
              height={100}
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
            src="image/ImageMenu/customer-66.png"
            alt="..."
            width={100}
            height={100}
            style={{ width: "115px" }}
          />
          <p className="lead mb-4" style={{ textAlign: "center" }}>
            แจ้งการฝาก-ถอน
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide style={{ width: "270px" }}>
        <div className="swiper-slide h-auto">
          <img
            className="img-fluid img-grayscale d-block mx-auto"
            src="image/ImageMenu/QA.png"
            alt="..."
            width={100}
            height={100}
            style={{ width: "100px" }}
          />
          <p className="lead mb-4" style={{ textAlign: "center" }}>
            กระดานถาม ตอบ{" "}
          </p>
        </div>
      </SwiperSlide>
      <SwiperSlide style={{ width: "270px" }}>
        <div className="swiper-slide h-auto">
          <img
            className="img-fluid img-grayscale d-block mx-auto"
            src="image/ImageMenu/Report.png"
            alt="..."
            width={100}
            height={100}
            style={{
              width: "100px",
              borderRadius: "50%",
              boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
          <p className="lead mb-4" style={{ textAlign: "center" }}>
            แจ้งข้อเสนอแนะ ร้องเรียน{" "}
          </p>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};
