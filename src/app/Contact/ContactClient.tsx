"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { message } from "antd";
import logger from "@/lib/logger";
import ComplaintDialog from "@/app/(ClientSections)/Complaint/ComplaintDialog";
import { LottieSectionLoading } from "@/components/LottieLoading";
import { Contact, ContactClientProps } from "@/types/contact";

export default function ContactClient({ initialData }: ContactClientProps) {
  const [contracts, setContracts] = useState<Contact[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API}/Contract`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const data = responseData.data || responseData;
      setContracts(data);
    } catch (error) {
      logger.error("Failed to fetch contact data:", error);
      setError("ไม่สามารถโหลดข้อมูลการติดต่อได้");
      message.error("ไม่สามารถโหลดข้อมูลการติดต่อได้");
    } finally {
      setLoading(false);
    }
  }, [API]);

  if (loading) {
    return <LottieSectionLoading tip="กำลังโหลดข้อมูลการติดต่อ..." />;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <h4>เกิดข้อผิดพลาด</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchContacts}
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-5">
        <div className="container py-4">
          <div className="row gy-5">
            <div className="col-lg-8">
              <h2 className="text-uppercase lined mb-4">
                ช่องทางการติดต่อกับสหกรณ์
              </h2>
              <p className="lead mb-5">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;สหกรณ์ออมทรัพย์กรมทางหลวง
                จำกัด ได้กำหนดแนวทางการบริหารกิจการของสหกรณ์ให้
                เป็นไปตามหลักธรรมาภิบาล เพื่อให้มีความโปร่งใส ซื่อสัตย์
                ความรับผิดชอบ สร้างการมีส่วนร่วม และมี
                การใช้กระบวนการบริหารจัดการแก่ผู้มีส่วนได้ส่วนเสียทุกฝ่ายอย่างเป็นธรรม
                จึงจัดให้มีผู้ดูแล
                รับผิดชอบงานด้านการเปิดเผยและให้บริการข้อมูลข่าวสารแก่สมาชิก
                กรรมการ เจ้าหน้าที่สหกรณ์ และ ผู้มีส่วนได้ส่วนเสียทุกกลุ่ม
              </p>

              {/* CONTACT FORM*/}
              <h2 className="lined text-uppercase mb-4">
                หมายเลขโทรศัพท์ติดต่อภายใน
              </h2>
              <p>
                โทรศัพท์ สายตรงกรมทางหลวง 02-345-6668 ต่อ สายภายในสหกรณ์ <br />
                โทรศัพท์ สายตรงสหกรณ์ 02-644-7940-43, 02-644-9243, 02-644-4633
                <br />
                FAX 02-354-6717 (ฝ่ายทะเบียนหุ้นและติดตามหนี้สิน
                ฝ่ายบริหารทั่วไป ฝ่ายบัญชี ) <br />
                FAX 02-644-4826 (ฝ่ายการเงินและการลงทุน ฝ่ายสินเชื่อ
                ฝ่ายประชาสัมพันธ์และสวัสดิการ)
              </p>

              <div className="table-responsive">
                <table className="table table-hover text-nowrap">
                  <thead>
                    <tr className="text-sm">
                      <th className="border-gray-300 border-top py-3">
                        ฝ่ายงานสหกรณ์ฯ
                      </th>
                      <th className="border-gray-300 border-top py-3">
                        สายตรงกรมทางหลวง
                      </th>
                      <th className="border-gray-300 border-top py-3">
                        สายตรงสหกรณ์
                      </th>
                      <th className="border-gray-300 border-top py-3">
                        มือถือ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr className="text-sm" key={contract.Id}>
                        <th className="align-middle py-3">
                          {contract.Id}. {contract.Name}
                        </th>
                        <td className="align-middle py-3">{contract.Doh}</td>
                        <td className="align-middle py-3">{contract.Coop}</td>
                        <td className="align-middle py-3">{contract.Mobile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* CONTACT INFO*/}
            <div className="col-lg-4">
              <h3 className="text-uppercase mb-3">ที่อยู่</h3>
              <p className="text-sm mb-4">
                <strong>สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด.</strong>
                <br />
                2/486 อาคาร 26 <br />
                ถนนศรีอยุธยา <br />
                แขวงทุ่งพญาไท เขตราชเทวี
                <br />
                กรุงเทพมหานคร 10400
                <br />
              </p>
              <h3 className="text-uppercase mb-3">เวลาทำการ</h3>
              <p className="text-gray-600 text-sm">
                วันจันทร์ - ศุกร์ เวลา 08.30 - 16.30 น.
              </p>
              <p className="text-sm mb-4">
                <strong style={{ color: "red" }}>
                  (การเงิน ปิดทำการเวลา 15.30 น.)
                </strong>
              </p>
              <h3 className="text-uppercase mb-3">ช่องทางติดต่อเพิ่มเติม</h3>
              <p className="text-gray-600 text-sm">
                &nbsp;&nbsp;ช่องทางการให้บริการข้อมูลข่าวสาร ที่สมาชิก กรรมการ
                เจ้าหน้าที่สหกรณ์ และผู้มีส่วนได้ส่วนเสียทุกกลุ่ม
                สามารถเข้าถึงได้ง่ายและสะดวก
              </p>
              <ul className="text-sm mb-0">
                <li>
                  <strong>
                    <a href="mailto:dohcoop@hotmail.com">dohcoop@hotmail.com</a>
                  </strong>
                </li>
                <li>
                  <strong>
                    <Link
                      href="https://lin.ee/hbQCmHe"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LINE Official
                    </Link>
                  </strong>{" "}
                  - ช่องทางการติดตามข่าวสารสหกรณ์{" "}
                </li>
              </ul>
              <br />
              <h3 className="text-uppercase mb-3">
                ช่องทางติดต่อทาง Line ฝ่ายต่างๆ
              </h3>
              <ul className="text-sm mb-0">
                <li>
                  <strong>
                    <Link
                      href="https://line.me/ti/p/vFLO1kRR0g"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LINE ฝ่ายการเงินและการลงทุน
                    </Link>
                  </strong>
                </li>
                <li>
                  <strong>
                    <Link
                      href="https://line.me/ti/p/g8Pp6RF0PU"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LINE ฝ่ายสินเชื่อ 1
                    </Link>
                  </strong>
                </li>
                <li>
                  <strong>
                    <Link
                      href="https://line.me/ti/p/l-cisnHSiQ"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LINE ฝ่ายสินเชื่อ 2
                    </Link>
                  </strong>
                </li>
                <li>
                  <strong>
                    <Link
                      href="https://line.me/ti/p/PlckMoqQ04"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LINE ฝ่ายทะเบียนหุ้นและติดตามหนี้สิน
                    </Link>
                  </strong>{" "}
                </li>
                <li>
                  <strong>
                    <Link
                      href="https://line.me/ti/p/u66nXOIiPr"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LINE ฝ่ายสมาชิกสัมพันธ์และสวัสดิการ
                    </Link>
                  </strong>{" "}
                </li>
              </ul>
              <br />
              <h3 className="text-uppercase mb-3">เลขบัญชีธนาคารของสหกรณ์ฯ</h3>
              <ul className="text-sm mb-0">
                <li>
                  <strong>
                    <Link
                      href="/BankAccount"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      บัญชีธนาคารของสหกรณ์ฯ
                    </Link>
                  </strong>
                </li>
              </ul>
              <br />
              <h3 className="text-uppercase mb-3">
                แจ้งข้อเสนอแนะ ร้องเรียนสหกรณ์ฯ
              </h3>
              <ul className="text-sm mb-0">
                <li>
                  <strong>
                    <button
                      className="btn btn-link p-0 text-start"
                      onClick={handleOpenDialog}
                      style={{ 
                        textDecoration: "none",
                        border: "none",
                        background: "none",
                        fontSize: "inherit",
                        fontWeight: "inherit",
                        color: "inherit"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                        e.currentTarget.style.color = "orange";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                        e.currentTarget.style.color = "inherit";
                      }}
                    >
                      แจ้งข้อเสนอแนะ ร้องเรียน
                    </button>
                  </strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <ComplaintDialog open={isDialogOpen} handleClose={handleCloseDialog} />
      <div className="border-top border-primary">
        <iframe
          title="Google Maps - สหกรณ์ออมทรัพย์กรมทางหลวง"
          width="100%"
          height={300}
          id="gmap_canvas"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.4907!2d100.5243988!3d13.7606906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29954f7c763fd%3A0xf63f50384ed0c4b!2z4Liq4Lir4LiB4Lij4LiT4LmM4Lit4Lit4Lih4LiX4Lij4Lix4Lie4Lii4LmM4LiB4Lij4Lih4LiX4Liy4LiH4Lir4Lil4Lin4LiH!5e0!3m2!1sth!2sth!4v1692000000000!5m2!1sth!2sth"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
    </>
  );
}