import AppDetails from "@/app/(Home)/AppDetails/page";
import React from "react";
function MobileApp() {
  return (
    <>
      {/* PORTFOLIO SLIDER SECTION*/}
      <section className="py-5">
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="text-uppercase lined mb-4">DohSaving : App </h2>
            <p className="lead mb-5">
              สวัสดีครับ สมาชิกสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ทุกท่าน เมื่อ
              เดือนเมษายน ปี 66 ที่ผ่านมา สหกรณ์ เปิดใช้งาน App
              ใหม่ให้ดาวน์โหลดกัน ในชื่อ App DohSaving ซึ่งเป็น App ที่ออกแบบ
              design และ ระบบ ใหม่ทั้งหมดเลยครับ
              สำหรับใครนะครับที่ยังไม่ได้ดาวน์โหลด หรือ
              มีเพื่อนที่ยังไม่ได้ดาวน์โหลด แนะนำให้มาโหลดกันเลยนะครับ
            </p>
          </header>
          <div className="col-lg-12">
            {/* Portfolio item*/}
            <div className="box-image-text text-center ">
              <img className="img-fluid" src="image/download app.png" alt="..." />
            </div>
          </div>
        </div>
      </section>
      <section className="py-5">
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="lined lined-center text-uppercase mb-4">
              Download APP Now !!
            </h2>
          </header>
          <div className="row gy-4">
            {/* Team member  */}
            <div className="col-lg-4 col-md-6 text-center">
              <a
                href="https://apps.apple.com/th/app/id1663748261"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="avatar avatar-xxl p-2 mb-4"
                  src="image/logo/ios.png"
                  alt="Princess Leia"
                />
              </a>
              <h3 className="h4 mb-1 text-uppercase">
                <a
                  className="text-reset"
                  href="https://apps.apple.com/th/app/id1663748261"
                >
                  IOS
                </a>
              </h3>
              <p className="text-muted small text-uppercase">App Store</p>
            </div>
            {/* Team member  */}
            <div className="col-lg-4 col-md-6 text-center">
              <a
                href="https://play.google.com/store/apps/details?id=com.dohsaving.mobile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="avatar avatar-xxl p-2 mb-4"
                  src="image/logo/Android2.png"
                  alt="Princess Leia"
                />
              </a>
              <h3 className="h4 mb-1 text-uppercase">
                <a
                  className="text-reset"
                  href="https://play.google.com/store/apps/details?id=com.dohsaving.mobile"
                  rel="noopener noreferrer"
                >
                  ANDROID
                </a>
              </h3>
              <p className="text-muted small text-uppercase">Google Play</p>
            </div>
            {/* Team member  */}
            <div className="col-lg-4 col-md-6 text-center">
              <a
                href="https://appgallery.huawei.com/#/app/C107569233"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="avatar avatar-xxl p-2 mb-4"
                  src="image/logo/huawei.png"
                  alt="Princess Leia"
                />
              </a>
              <h3 className="h4 mb-1 text-uppercase">
                <a
                  className="text-reset"
                  href="https://appgallery.huawei.com/#/app/C107569233"
                >
                  Huawei
                </a>
              </h3>
              <p className="text-muted small text-uppercase">App Gallery</p>
            </div>
          </div>
        </div>
      </section>
      <AppDetails />
    </>
  );
}

export default MobileApp;
