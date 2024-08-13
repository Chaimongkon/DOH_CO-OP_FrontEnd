import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./CookieConsent.module.css";
import { Button, FloatButton, Modal, Switch, Table } from "antd";
import { CommentOutlined, CustomerServiceOutlined } from '@ant-design/icons';

interface ConsentData {
  userId: string;
  consentStatus: boolean;
  consentDate: string;
  cookieCategories: string;
  userAgent: string;
  ipAddress: string;
}

const essentialCookies = [
  {
    name: "session_id",
    purpose: "รักษาเซสชันของผู้ใช้ระหว่างการเข้าชมหน้าเว็บ",
    duration: "เซสชัน",
  },
  {
    name: "csrf_token",
    purpose: "ป้องกันการโจมตี Cross-Site Request Forgery",
    duration: "เซสชัน",
  },
  // เพิ่มคุกกี้พื้นฐานอื่น ๆ ตามต้องการ
];

const CookieConsent = () => {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const localConsent = Cookies.get("cookie_consent");
    if (localConsent) {
      setConsentGiven(localConsent === "true");
    }
  }, []);

  const handleAccept = async () => {
    try {
      const userId = Cookies.get("user_id") || "anonymous";
      const userAgent = navigator.userAgent;
      const ipAddress = await getIpAddress();
      const consentDate = new Date().toISOString();
      const selectedCategories = "essential, analytics, marketing";

      const consentData: ConsentData = {
        userId,
        consentStatus: true,
        consentDate,
        cookieCategories: selectedCategories,
        userAgent,
        ipAddress,
      };

      const response = await axios.post(`${API}/Cookie`, consentData);
      console.log("Consent data sent:", response.data);

      Cookies.set("cookie_consent", "true", { expires: 365 });
      setConsentGiven(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error sending consent data:", error);
    }
  };

  const handleDecline = () => {
    Cookies.set("cookie_consent", "false", { expires: 365 });
    setConsentGiven(false);
    setIsModalOpen(false);
  };

  const handleTogglePreference = (category: keyof typeof cookiePreferences) => {
    setCookiePreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getIpAddress = async (): Promise<string> => {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.error("Error fetching IP address:", error);
      return "unknown";
    }
  };

  const CookieSetting = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const userId = Cookies.get("user_id") || "anonymous";
      const userAgent = navigator.userAgent;
      const ipAddress = await getIpAddress();
      const consentDate = new Date().toISOString();
      const selectedCategories = Object.keys(cookiePreferences)
        .filter(
          (key) => cookiePreferences[key as keyof typeof cookiePreferences]
        )
        .join(", ");

      const consentData: ConsentData = {
        userId,
        consentStatus: true,
        consentDate,
        cookieCategories: selectedCategories,
        userAgent,
        ipAddress,
      };

      const response = await axios.post(`${API}/Cookie`, consentData);
      console.log("Consent data sent:", response.data);

      Cookies.set("cookie_consent", "true", { expires: 365 });
      setConsentGiven(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error sending consent data:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showDetailsModal = () => {
    setIsDetailsModalOpen(true);
  };

  const handleDetailsOk = () => {
    setIsDetailsModalOpen(false);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalOpen(false);
  };

  const columns = [
    {
      title: "ชื่อคุกกี้",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "วัตถุประสงค์",
      dataIndex: "purpose",
      key: "purpose",
    },
    {
      title: "ระยะเวลาการจัดเก็บ",
      dataIndex: "duration",
      key: "duration",
    },
  ];

  return (
    <div className={styles.cookieBanner}>
      {consentGiven === null && (
        <>
          <p>
            เราใช้คุกกี้เพื่อเพิ่มประสบการณ์ที่ดีในการใช้เว็บไซต์
            แสดงเนื้อหาและโฆษณาให้ตรงกับความสนใจ
            รวมถึงเพื่อวิเคราะห์การเข้าใช้งานเว็บไซต์และทำความเข้าใจว่าผู้ใช้งานมาจากที่ใด
          </p>

          <Button type="primary" onClick={handleAccept}>
            ยอมรับทั้งหมด
          </Button>
          <Button onClick={handleDecline}>ไม่ยอมรับทั้งหมด</Button>
          <Button onClick={CookieSetting}>การตั้งค่าคุกกี้</Button>
        </>
      )}
      <Modal
        title="การตั้งค่าความเป็นส่วนตัว"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            ยืนยันตัวเลือกของฉัน
          </Button>,
          <Button key="submit" type="primary" onClick={handleAccept}>
          ยอมรับทั้งหมด
        </Button>,
        ]}
      >
        <div className={styles.cookieCategory}>
          <div className={styles.cookieCategoryHeader}>
            <div className={styles.cookieCategoryTitle}>
              คุกกี้พื้นฐานที่จำเป็น
            </div>
            <div className={styles.cookieCategoryChoice}>
              เปิดใช้งานตลอดเวลา
            </div>
          </div>
          <div className={styles.cookieCategoryDesc}>
            คุกกี้พื้นฐานที่จำเป็น เพื่อช่วยให้การทำงานหลักของเว็บไซต์ใช้งานได้
            รวมถึงการเข้าถึงพื้นที่ที่ปลอดภัยต่าง ๆ ของเว็บไซต์
            หากไม่มีคุกกี้นี้เว็บไซต์จะไม่สามารถทำงานได้อย่างเหมาะสม
            และจะใช้งานได้โดยการตั้งค่าเริ่มต้น
            โดยไม่สามารถปิดการใช้งานได้&nbsp;
            <a href="#" onClick={showDetailsModal}>
              รายละเอียดคุกกี้
            </a>
          </div>
        </div>

        <div className={styles.cookieCategory}>
          <div className={styles.cookieCategoryHeader}>
            <div className={styles.cookieCategoryTitle}>
              คุกกี้ในส่วนวิเคราะห์
            </div>
            <Switch
              checked={cookiePreferences.analytics}
              onChange={() => handleTogglePreference("analytics")}
            />
          </div>
          <div className={styles.cookieCategoryDesc}>
            คุกกี้ในส่วนวิเคราะห์
            จะช่วยให้เว็บไซต์เข้าใจรูปแบบการใช้งานของผู้ใช้บริการและช่วยปรับปรุงประสบการณ์การใช้งานให้ดีขึ้น
            โดยการเก็บรวบรวมข้อมูลและรายงานผลการใช้งานของผู้ใช้บริการ&nbsp;
            <a href="#">รายละเอียดคุกกี้</a>
          </div>
        </div>

        <div className={styles.cookieCategory}>
          <div className={styles.cookieCategoryHeader}>
            <div className={styles.cookieCategoryTitle}>
              คุกกี้ในส่วนการตลาด
            </div>
            <Switch
              checked={cookiePreferences.marketing}
              onChange={() => handleTogglePreference("marketing")}
            />
          </div>
          <div className={styles.cookieCategoryDesc}>
            คุกกี้ในส่วนการตลาด
            ใช้เพื่อติดตามพฤติกรรมผู้ใช้บริการในเว็บไซต์เพื่อแสดงโฆษณาที่เหมาะสมสำหรับบัญชีของผู้ใช้บริการและเพิ่มประสิทธิผลในการโฆษณาสำหรับผู้เผยแพร่และผู้โฆษณารายอื่น&nbsp;
            <a href="#">รายละเอียดคุกกี้</a>
          </div>
        </div>
      </Modal>

      <Modal
        title="รายละเอียดคุกกี้พื้นฐานที่จำเป็น"
        open={isDetailsModalOpen}
        onOk={handleDetailsOk}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="ok" type="primary" onClick={handleDetailsOk}>
            ปิด
          </Button>,
        ]}
      >
        <Table
          columns={columns}
          dataSource={essentialCookies}
          pagination={false}
          rowKey="name"
        />
      </Modal>
    </div>
    
  );
};

export default CookieConsent;
