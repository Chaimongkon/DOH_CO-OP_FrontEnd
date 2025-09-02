import Image from "next/image";
import Link from "next/link";

export default function AppDetailsPage() {
  return (
    <section
      className="py-5 bg-fixed bg-cover-app bg-center dark-overlay"
      style={{
        background: "url(/image/BackgroundApp.png)",
        boxShadow: "0px 15px 7px rgba(0, 0, 0, 0.5)",
      }}
      aria-label="ข้อมูลแอปพลิเคชัน DOH Saving"
    >
      <div className="overlay-content">
        <div className="container py-4 text-white text-center">
          <div className="mb-4">
            <Image
              className="rounded mx-auto d-block"
              src="/image/logo/logoapp.png"
              width={150}
              height={150}
              alt="โลโก้แอปพลิเคชัน DOH Saving สหกรณ์ออมทรัพย์กรมทางหลวง"
              priority
              sizes="150px"
              style={{
                width: 'auto !important',
                height: 'auto !important',
                maxWidth: '150px',
                maxHeight: '150px',
              }}
            />
          </div>
          <header>
            <h1 className="text-uppercase mb-3" role="heading" aria-level={1}>
              วิธีใช้งาน DOH Saving
            </h1>
            <p className="lead mb-4">
              รวมวิธีการใช้บริการสหกรณ์ออนไลน์
              เพิ่มความสะดวกในการทำธุรกรรมได้ทุกที่ ทุกเวลา ผ่าน Application DOH
              Saving.
            </p>
          </header>
          <Link 
            className="btn btn-outline-light btn-lg" 
            href="/DetailApp"
            aria-label="ดูรายละเอียดการใช้งานแอปพลิเคชัน DOH Saving ทั้งหมด"
            style={{ borderRadius: "50px" }}
          >
            ดูรายละเอียดทั้งหมด
          </Link>
        </div>
      </div>
    </section>
  );
}
