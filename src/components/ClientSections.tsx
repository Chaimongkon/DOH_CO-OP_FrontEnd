import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ComplaintDialog from "@/app/(ClientSections)/Complaint/ComplaintDialog"; // Import new dialog component

export default function SwiperMenu() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleViewAllClick = () => {
    router.push("/Questions");
  };

  const handleBankClick = () => {
    router.push("/BankAccount");
  };

  const handleContactClick = () => {
    router.push("/Contact");
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
              <Image
                className="img-fluid img-grayscale d-block mx-auto"
                src="/image/ImageMenu/LoginApp.png"
                alt="Login to online member system"
                width={100}
                height={100}
                style={{
                  width: "100px",
                  height: "100px",
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
          <div className="swiper-slide h-auto" style={{ cursor: "pointer" }}>
              <Image
                className="img-grayscale d-block mx-auto"
                src="/image/ImageMenu/bookbankcoop.png"
                alt="Bank account book management"
                width={135}
                height={100}
                style={{ width: "auto", height: "auto", maxWidth: "135px", cursor: "pointer" }}
                onClick={handleBankClick}
              />
              <p className="lead mb-4" style={{ textAlign: "center" }}>
                บัญชีธนาคารสหกรณ์
              </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto" style={{ cursor: "pointer" }}>
            <Image
              className="img-fluid img-grayscale d-block mx-auto"
              src="/image/ImageMenu/QA.png"
              alt="Q&A questions and answers"
              width={100}
              height={100}
              style={{ width: "100px", height: "auto", cursor: "pointer" }}
              onClick={handleViewAllClick}
            />

            <p className="lead mb-4" style={{ textAlign: "center" }}>
              กระดานถาม ตอบ
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div
            className="swiper-slide h-auto"
            onClick={handleOpenDialog}
            style={{ cursor: "pointer" }}
          >
            <Image
              className="img-fluid img-grayscale d-block mx-auto"
              src="/image/ImageMenu/Report.png"
              alt="แจ้งข้อเสนอแนะ ร้องเรียน"
              width={100}
              height={100}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
                cursor: "pointer"
              }}
            />
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              แจ้งข้อเสนอแนะ ร้องเรียน
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto">
            <Image
              className="img-grayscale d-block mx-auto"
              src="/image/ImageMenu/customer-66.png"
              alt="Customer deposit and withdrawal notifications"
              width={115}
              height={100}
              style={{ width: "auto", height: "auto", maxWidth: "115px" }}
            />
            <p className="lead mb-4" style={{ textAlign: "center" }}>
              แจ้งการฝาก-ถอน
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide style={{ width: "270px" }}>
          <div className="swiper-slide h-auto" style={{ cursor: "pointer" }}>
              <Image
                className="img-fluid img-grayscale d-block mx-auto"
                src="/image/ImageMenu/Contact.png"
                alt="Contact Department of Highways Cooperative"
                width={100}
                height={100}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
                  cursor: "pointer"
                }}
                onClick={handleContactClick}
              />
              <p className="lead mb-4" style={{ textAlign: "center" }}>
                ติดต่อ สอ.ทล.
              </p>
          </div>
        </SwiperSlide>
      </Swiper>
      <ComplaintDialog open={isDialogOpen} handleClose={handleCloseDialog} />
    </>
  );
}
