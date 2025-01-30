import Link from "next/link";
import React from "react";

function DetailApp() {
  return (
    <>
      <section className="py-5">
        <div className="container py-4">
          <header className="mb-5">
            <h2 className="text-uppercase lined mb-4">
              วิธีใช้งาน Application DOHSaving{" "}
            </h2>
            <p className="lead">
              เพื่อความสะดวกต่อสมาชิกสหกรณ์ออมทรัพย์กรมทางหลวง ทุกท่าน
              ทางสหกรณ์ฯได้รวบรวมวิธีการใช้งานแอปพลิเคชั่นทั้งหมด
              เพื่อง่ายต่อการใช้งาน
            </p>
          </header>
          <div className="row gy-4">
            <header className="mb-2">
              <h3 className="text-uppercase lined">
                1. วิธีการติดตั้ง และ การลืมรหัสผ่าน
              </h3>
            </header>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/install.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black  text-uppercase box-image-text-heading">
                    ขั้นตอนดาวน์โหลด App
                  </h3>
                  <p className="text-black  box-image-text-description">
                    สามารถดาวน์โหลดแอปพลิเคชั่นผ่าน APP Store, Play Store, APP
                    Gallery
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <Link className="btn btn-outline-light" href="/Install">
                        รายละเอียด
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/Register.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black text-uppercase box-image-text-heading">
                    การลงทะเบียน
                  </h3>
                  <p className="text-black  box-image-text-description">
                    สามารถลงทะเบียนด้วยต้นเอง
                    และยอมรับข้อตกลงและเงื่อนไขการใช้บริการเพื่อลงทะเบียน
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <Link className="btn btn-outline-light" href="/Register">
                        รายละเอียด
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/forgot.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black text-uppercase box-image-text-heading">
                    การลืมรหัสผ่าน และ รหัส PIN
                  </h3>
                  <p className="text-black  box-image-text-description">
                    สามารถกดลืมรหัสผ่านด้วยตัวเองและรอรับ SMS
                    เพื่อรับรหัสชั่วคราว
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <Link className="btn btn-outline-light" href="/ForgotPassword">
                        รายละเอียด
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row gy-4">
            <header className="mb-2" style={{ marginTop: "80px" }}>
              <h3 className="text-uppercase lined">2. วิธีดูข้อมูลส่วนบุคคล</h3>
            </header>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/stock.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black text-uppercase box-image-text-heading">
                    ดูรายการเคลื่อนไหวหุ้น
                  </h3>
                  <p className="text-black  box-image-text-description">
                    จะแสดงข้อมูลรายการซื้อหุ้นรายเดือน
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                    <Link className="btn btn-outline-light" href="/Stockmovement">
                        รายละเอียด
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/dividend.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black text-uppercase box-image-text-heading">
                    ดูเงินปันผล - เฉลี่ยคืน
                  </h3>
                  <p className="text-black  box-image-text-description">
                    จะแสดงข้อมูลรายการปันผลและเฉลี่ยคืนเป็นรายปี
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <a className="btn btn-outline-light" href="/404">
                        รายละเอียด
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/deposit.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black text-uppercase box-image-text-heading">
                    ดูบัญชีเงินฝาก
                  </h3>
                  <p className="text-black  box-image-text-description">
                    จะแสดงข้อมูลรายการเงินฝากที่สมาชิกมีอยู่กับสหกรณ์ฯ
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <a className="btn btn-outline-light" href="/404">
                        รายละเอียด
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row gy-4">
            <header className="mb-2" style={{ marginTop: "80px" }}>
              <h3 className="text-uppercase lined">3. จัดการบัญชี</h3>
            </header>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/BankAccount.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black  text-uppercase box-image-text-heading">
                    เพิ่มบัญชีสหกรณ์ สำหรับทำธุรกรรม
                  </h3>
                  <p className="text-black box-image-text-description">
                    เพิ่มบัญชีสหกรณ์ เพื่อทำธุรกรรมเกี่ยวกับการฝาก - ถอน
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <a className="btn btn-outline-light" href="/404">
                        รายละเอียด
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              {/* Portfolio item*/}
              <div className="box-image-text text-center primary-overlay">
                <img
                  className="img-fluid"
                  src="image/ImageMenu/BankAccount2.png"
                  alt="..."
                />
                <div className="overlay-content d-flex flex-column justify-content-center p-4">
                  <h3 className="text-black text-uppercase box-image-text-heading">
                    เพิ่มบัญชีธนาคาร สำหรับทำธุรกรรม
                  </h3>
                  <p className="text-black  box-image-text-description">
                    เพิ่มบัญชีธนาคาร เพื่อทำธุรกรรมเกี่ยวกับการฝาก - ถอน กู้
                    ไปยังธนคารภายนอก
                  </p>
                  <ul className="list-inline mb-0 box-image-text-content">
                    <li className="list-inline-item">
                      <a className="btn btn-outline-light" href="/404">
                        รายละเอียด
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default DetailApp;
