"use client";

// import Link from "next/link"; // Unused import
import Image from "next/image";
import React, { useCallback, memo } from "react";
import { useRouter } from "next/navigation";

interface AppFeature {
  imageSrc: string;
  title: string;
  description: string;
  href: string;
  alt: string;
}

const installationFeatures: AppFeature[] = [
    {
      imageSrc: "/image/ImageMenu/install.png",
      title: "ขั้นตอนดาวน์โหลด App",
      description: "สามารถดาวน์โหลดแอปพลิเคชั่นผ่าน APP Store, Play Store, APP Gallery",
      href: "/Install",
      alt: "ไอคอนการติดตั้งแอปพลิเคชั่น DOHSaving"
    },
    {
      imageSrc: "/image/ImageMenu/Register.png",
      title: "การลงทะเบียน",
      description: "สามารถลงทะเบียนด้วยต้นเอง และยอมรับข้อตกลงและเงื่อนไขการใช้บริการเพื่อลงทะเบียน",
      href: "/Register",
      alt: "ไอคอนการลงทะเบียนผู้ใช้งาน"
    },
    {
      imageSrc: "/image/ImageMenu/forgot.png",
      title: "การลืมรหัสผ่าน และ รหัส PIN",
      description: "สามารถกดลืมรหัสผ่านด้วยตัวเองและรอรับ SMS เพื่อรับรหัสชั่วคราว",
      href: "/ForgotPassword",
      alt: "ไอคอนการลืมรหัสผ่าน"
    }
];

const personalDataFeatures: AppFeature[] = [
    {
      imageSrc: "/image/ImageMenu/stock.png",
      title: "ดูรายการเคลื่อนไหวหุ้น",
      description: "จะแสดงข้อมูลรายการซื้อหุ้นรายเดือน",
      href: "/TradeHistory",
      alt: "ไอคอนรายการเคลื่อนไหวหุ้น"
    },
    {
      imageSrc: "/image/ImageMenu/dividend.png",
      title: "ดูเงินปันผล - เฉลี่ยคืน",
      description: "จะแสดงข้อมูลรายการปันผลและเฉลี่ยคืนเป็นรายปี",
      href: "/Dividend",
      alt: "ไอคอนเงินปันผลและเฉลี่ยคืน"
    },
    {
      imageSrc: "/image/ImageMenu/deposit.png",
      title: "ดูบัญชีเงินฝาก",
      description: "จะแสดงข้อมูลรายการเงินฝากที่สมาชิกมีอยู่กับสหกรณ์ฯ",
      href: "/DepositAccount",
      alt: "ไอคอนบัญชีเงินฝาก"
    }
];

const accountManagementFeatures: AppFeature[] = [
    {
      imageSrc: "/image/ImageMenu/BankAccount.png",
      title: "เพิ่มบัญชีสหกรณ์ สำหรับทำธุรกรรม",
      description: "เพิ่มบัญชีสหกรณ์ เพื่อทำธุรกรรมเกี่ยวกับการฝาก - ถอน",
      href: "/CooperativeAccount",
      alt: "ไอคอนบัญชีสหกรณ์"
    },
    {
      imageSrc: "/image/ImageMenu/BankAccount2.png",
      title: "เพิ่มบัญชีธนาคาร สำหรับทำธุรกรรม",
      description: "เพิ่มบัญชีธนาคาร เพื่อทำธุรกรรมเกี่ยวกับการฝาก - ถอน กู้ ไปยังธนคารภายนอก",
      href: "/AddBankAccount",
      alt: "ไอคอนบัญชีธนาคาร"
    }
];

const DetailApp: React.FC = memo(function DetailApp() {
  const router = useRouter();

  const handleFeatureClick = useCallback((href: string, title: string) => {
    localStorage.setItem("menuName", title);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('menuNameChanged'));
    router.push(href);
  }, [router]);

  const renderFeatureCard = useCallback((feature: AppFeature) => (
    <div key={feature.title} className="col-lg-4">
      <div className="box-image-text text-center primary-overlay">
        <Image
          className="img-fluid"
          src={feature.imageSrc}
          alt={feature.alt}
          width={400}
          height={300}
          priority
        />
        <div className="overlay-content d-flex flex-column justify-content-center p-4">
          <h3 className="text-black text-uppercase box-image-text-heading">
            {feature.title}
          </h3>
          <p className="text-black box-image-text-description">
            {feature.description}
          </p>
          <ul className="list-inline mb-0 box-image-text-content">
            <li className="list-inline-item">
              <button 
                className="btn btn-outline-light"
                onClick={() => handleFeatureClick(feature.href, feature.title)}
              >
                รายละเอียด
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ), [handleFeatureClick]);

  return (
    <section className="py-5">
      <div className="container py-4">
        <header className="mb-5">
          <h2 className="text-uppercase lined mb-4">
            วิธีใช้งาน Application DOHSaving
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
          {installationFeatures.map(renderFeatureCard)}
        </div>

        <div className="row gy-4 mt-5">
          <header className="mb-2">
            <h3 className="text-uppercase lined">2. วิธีดูข้อมูลส่วนบุคคล</h3>
          </header>
          {personalDataFeatures.map(renderFeatureCard)}
        </div>

        <div className="row gy-4 mt-5">
          <header className="mb-2">
            <h3 className="text-uppercase lined">3. จัดการบัญชี</h3>
          </header>
          {accountManagementFeatures.map(renderFeatureCard)}
        </div>
      </div>
    </section>
  );
});

export default DetailApp;