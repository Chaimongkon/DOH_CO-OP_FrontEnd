"use client";

import Image from "next/image";
import { useServiceData } from "@/hooks/useServiceData";

const DepositRetire = () => {
  const { service, loading, error } = useServiceData("เงินฝากออมทรัพย์พิเศษเกษียณสุข");
  const customLabels = ["แบบฟอร์มเงินฝากออมทรัพย์พิเศษเกษียณสุข", "บันทึกข้อความเงินฝากออมทรัพย์พิเศษเกษียณสุข"];

  if (loading) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <center>
            <div>กำลังโหลดข้อมูล...</div>
          </center>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container py-4">
          <center>
            <div>เกิดข้อผิดพลาด: {error}</div>
          </center>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      {service.map((s) => (
        <div className="container py-4" key={s.id}>
          <center>
            <Image
              className="img-fluid-7"
              src={s.imagePath}
              alt={`Service Image for ${s.subcategories}`}
              width={800}
              height={600}
              priority
            />
          </center>
          {s.urlLinks && s.urlLinks.length > 0 && (
            <div className="container py-4">
              <div className="row gy-4">
                <h3 className="text-uppercase lined mb-4">ดาวน์โหลดเอกสาร</h3>
              </div>
              <ul className="list-unstyled">
                {s.urlLinks.map((link: string, index: number) => (
                  <li className="d-flex mb-3" key={index}>
                    <div className="icon-filled2 me-2">
                      <i className="fas fa-download"></i>
                    </div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      <p className="text-sm312 mb-0">
                        {customLabels[index] || `แบบฟอร์ม ${s.subcategories}`}
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default DepositRetire;
