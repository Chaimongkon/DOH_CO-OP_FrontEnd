import React from "react";
import Link from "next/link";

function Footer() {
  return (
    <>
      <footer>
        {/* MAIN FOOTER*/}
        <div className="bg-gray-700 text-white py-5">
          <div className="container py-4">
            <div className="row gy-4">
              <div className="col-lg-3">
                <h4 className="mb-3 text-uppercase">เกี่ยวกับเรา</h4>
                <p className="text-sm text-gray-500">
                  เป็นสหกรณ์ที่มั่นคง ดำรงหลักธรรมาภิบาล
                  จัดการด้วยเทคโนโลยีทันสมัย ใส่ใจสมาชิกและสังคม
                </p>
                <hr />
                <h4 className="h6 text-uppercase">ศูนย์บริการข้อมูลสมาชิก</h4>
                <h2 className="h2 text-uppercase">02-644-4633</h2>
              </div>
              <div className="col-lg-3">
                <h4 className="mb-3 text-uppercase">ลิ้งก์ที่เกี่ยวข้อง</h4>
                <ul className="list-unstyled">
                  <li className="d-flex align-items-center mb-2">
                    <div className="ms-2">
                      <h6 className="text-uppercase mb-0">
                        {" "}
                        <Link
                          className="text-reset"
                          href="http://www.fsct.com/fsct_main.php?f1=fsct_news12.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          สหกรณ์ออมทรัพย์ต่างๆ
                        </Link>
                      </h6>
                    </div>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <div className="ms-2">
                      <h6 className="text-uppercase mb-0">
                        {" "}
                        <Link
                          className="text-reset"
                          href="https://www.clt.or.th/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          สันนิบาตสหกรณ์
                        </Link>
                      </h6>
                    </div>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <div className="ms-2">
                      <h6 className="text-uppercase mb-0">
                        {" "}
                        <Link
                          className="text-reset"
                          href="http://cpd.go.th/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          กรมส่งเสริมสหกรณ์
                        </Link>
                      </h6>
                    </div>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <div className="ms-2">
                      <h6 className="text-uppercase mb-0">
                        {" "}
                        <Link
                          className="text-reset"
                          href="https://www.cad.go.th/main.php?filename=index"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          กรมตรวจบัญชีสหกรณ์
                        </Link>
                      </h6>
                    </div>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <div className="ms-2">
                      <h6 className="text-uppercase mb-0">
                        {" "}
                        <Link
                          className="text-reset"
                          href="http://www.fsct.com/fsct_main.php"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          สหกรณ์ต่างประเทศ
                        </Link>
                      </h6>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="col-lg-3">
                <h4 className="mb-3 text-uppercase">ติดต่อเรา</h4>
                <p className="text-uppercase text-sm text-gray-500">
                  <strong>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด.</strong>
                  <br />
                  2/486 <br />
                  อาคาร 26 <br />
                  ถนนศรีอยุธยา <br />
                  แขวงทุ่งพญาไท <br />
                  เขตราชเทวี
                  <br />
                  กรุงเทพมหานคร 10400
                  <br />
                </p>
                <Link className="btn btn-primary" href="/Contact">
                  Go to contact
                </Link>
              </div>
              <div className="col-lg-3">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item mb-2 me-2 pb-1">
                    <Link
                      href="https://www.facebook.com/profile.php?id=100062755236000"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        className="img-fluid"
                        src="/image/logo/facebook.png"
                        alt="..."
                        width={70}
                      />
                    </Link>
                  </li>
                  <li className="list-inline-item mb-2 me-2 pb-1">
                    <Link
                      href="https://lin.ee/hbQCmHe"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        className="img-fluid"
                        src="/image/logo/LineOA.png"
                        alt="..."
                        width={70}
                      />
                    </Link>
                  </li>
                  <li className="list-inline-item mb-2 me-2 pb-1">
                    <Link href="mailto:dohcoop@hotmail.com">
                      <img
                        className="img-fluid"
                        src="/image/logo/Email.png"
                        alt="..."
                        width={70}
                      />
                    </Link>
                  </li>
                </ul>
                <ul className="list-inline mb-0">
                  <li className="list-inline-item mb-2 me-2 pb-1">
                    <Link
                      href="https://www.youtube.com/@dohcoop..0161/videos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        className="img-fluid"
                        src="/image/logo/youtube.png"
                        alt="..."
                        width={70}
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-dark py-5">
          <div className="container">
            <div className="row align-items-cenrer gy-3 text-center">
              <div className="col-md-6 text-md-start">
                <p className="mb-0 text-sm text-gray-500">
                  สงวนสิทธิ์ 2566. สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด{" "}
                </p>
              </div>
              <div className="col-md-6 text text-md-end">
                <p className="mb-0 text-sm text-gray-500">
                  Powered by <a href="https://bootstrapious.com">CHAIMONGKON</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
