import React from "react";
import Link from "next/link";

function AppDetails() {
  return (
    <>
      <section
        className="py-5 bg-fixed bg-cover bg-center dark-overlay"
        style={{
          background: "url(image/BackgroundApp.png)",
          boxShadow: "0px 15px 7px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="overlay-content">
          <div className="container py-4 text-white text-center">
            <img
              className="rounded mx-auto d-block"
              src="image/logo/logoapp.png"
              width={150}
              height={150}
              alt=""
            />
            <h2 className="text-uppercase mb-3">วิธีใช้งาน DOH Saving</h2>
            <p className="lead mb-4">
              รวมวิธีการใช้บริการสหกรณ์ออนไลน์
              เพิ่มความสะดวกในการทำธุรกรรมได้ทุกที่ ทุกเวลา ผ่าน Application DOH
              Saving.
            </p>
            <Link className="btn btn-outline-light btn-lg" href="/AppDetail">
              ดูรายละเอียดทั้งหมด
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default AppDetails;
