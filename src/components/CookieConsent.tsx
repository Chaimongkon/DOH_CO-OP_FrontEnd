import { useState, useEffect, useCallback, memo } from "react";
import Cookies from "js-cookie";
import styles from "./CookieConsent.module.css";
import { Button, Modal, Switch, Table } from "antd";
import logger from "@/lib/logger";

interface ConsentData {
  userId: string;
  consentStatus: boolean;
  consentDate: string;
  cookieCategories: string;
  userAgent: string;
  ipAddress: string;
}

interface IpResponse {
  ip: string;
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface WindowWithGtag extends Window {
  gtag?: (command: string, action: string, parameters: Record<string, string>) => void;
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

const CookieConsent: React.FC = memo(function CookieConsent() {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
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
      
      // Load saved preferences if they exist
      const savedPreferences = Cookies.get("cookie_preferences");
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences);
          setCookiePreferences(preferences);
        } catch (error) {
          logger.error("Error parsing saved cookie preferences", error);
        }
      }
    }
  }, []);

  const getIpAddress = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) {
        throw new Error('Failed to fetch IP address');
      }
      const data: IpResponse = await response.json();
      return data.ip;
    } catch (error) {
      logger.error("Error fetching IP address", error);
      return "unknown";
    }
  }, []);

  const manageCookies = useCallback((preferences: CookiePreferences) => {
    // Save preferences
    Cookies.set("cookie_preferences", JSON.stringify(preferences), { expires: 365 });
    
    // Essential cookies are always enabled (session, security, etc.)
    // These are handled by the application automatically
    
    // Analytics cookies
    if (preferences.analytics) {
      // Enable analytics tracking
      Cookies.set("analytics_enabled", "true", { expires: 365 });
      
      // If Google Analytics is used, enable it here
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag!('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    } else {
      // Disable analytics tracking
      Cookies.remove("analytics_enabled");
      Cookies.remove("_ga");
      Cookies.remove("_ga_*");
      
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag!('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }
    
    // Marketing cookies
    if (preferences.marketing) {
      // Enable marketing tracking
      Cookies.set("marketing_enabled", "true", { expires: 365 });
      
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag!('consent', 'update', {
          'ad_storage': 'granted'
        });
      }
    } else {
      // Disable marketing tracking
      Cookies.remove("marketing_enabled");
      
      // Remove common marketing cookies
      Cookies.remove("_fbp");
      Cookies.remove("_fbc");
      
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag!('consent', 'update', {
          'ad_storage': 'denied'
        });
      }
    }
  }, []);

  const sendConsentData = useCallback(async (categories: string, preferences: CookiePreferences) => {
    try {
      const userId = Cookies.get("user_id") || "anonymous";
      const userAgent = navigator.userAgent;
      const ipAddress = await getIpAddress();
      const consentDate = new Date().toISOString();

      const consentData: ConsentData = {
        userId,
        consentStatus: true,
        consentDate,
        cookieCategories: categories,
        userAgent,
        ipAddress,
      };

      const response = await fetch(`${API}/Cookie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consentData),
      });

      if (!response.ok) {
        throw new Error('Failed to send consent data');
      }

      const data = await response.json();
      logger.info("Consent data sent", { data });

      // Set consent status
      Cookies.set("cookie_consent", "true", { expires: 365 });
      
      // Apply cookie preferences
      manageCookies(preferences);
      
      setConsentGiven(true);
      setIsModalOpen(false);
    } catch (error) {
      logger.error("Error sending consent data", error);
    }
  }, [API, getIpAddress, manageCookies]);

  const removeNonEssentialCookies = useCallback(() => {
    // Remove analytics cookies
    Cookies.remove("analytics_enabled");
    Cookies.remove("_ga");
    Cookies.remove("_ga_*");
    
    // Remove marketing cookies
    Cookies.remove("marketing_enabled");
    Cookies.remove("_fbp");
    Cookies.remove("_fbc");
    
    // Remove other non-essential cookies as needed
    // Add more cookie names that should be removed when declined
    
    logger.info("Non-essential cookies removed");
  }, []);

  const handleAccept = useCallback(async () => {
    const allAcceptedPreferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setCookiePreferences(allAcceptedPreferences);
    await sendConsentData("essential, analytics, marketing", allAcceptedPreferences);
  }, [sendConsentData]);

  const handleDecline = useCallback(() => {
    const essentialOnlyPreferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    
    // Set consent status
    Cookies.set("cookie_consent", "false", { expires: 365 });
    
    // Apply essential-only cookie preferences
    manageCookies(essentialOnlyPreferences);
    setCookiePreferences(essentialOnlyPreferences);
    
    // Remove non-essential cookies
    removeNonEssentialCookies();
    
    setConsentGiven(false);
    setIsModalOpen(false);
  }, [manageCookies, removeNonEssentialCookies]);

  const handleTogglePreference = useCallback((category: keyof CookiePreferences) => {
    setCookiePreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const CookieSetting = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleOk = useCallback(async () => {
    const selectedCategories = Object.keys(cookiePreferences)
      .filter(
        (key) => cookiePreferences[key as keyof CookiePreferences]
      )
      .join(", ");
    await sendConsentData(selectedCategories, cookiePreferences);
  }, [cookiePreferences, sendConsentData]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const showDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(true);
  }, []);

  const handleDetailsOk = useCallback(() => {
    setIsDetailsModalOpen(false);
  }, []);

  const handleDetailsCancel = useCallback(() => {
    setIsDetailsModalOpen(false);
  }, []);

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
          <p >
            เราใช้คุกกี้เพื่อเพิ่มประสบการณ์ที่ดีในการใช้เว็บไซต์
            แสดงเนื้อหาและโฆษณาให้ตรงกับความสนใจ
            รวมถึงเพื่อวิเคราะห์การเข้าใช้งานเว็บไซต์และทำความเข้าใจว่าผู้ใช้งานมาจากที่ใด
          </p>

          <Button type="primary"  onClick={handleAccept}>
            ยอมรับทั้งหมด
          </Button>
          <Button  onClick={handleDecline}>ไม่ยอมรับทั้งหมด</Button>
          <Button  onClick={CookieSetting}>การตั้งค่าคุกกี้</Button>
        </>
      )}
      <Modal
        title="การตั้งค่าความเป็นส่วนตัว"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{fontFamily:'DOHCOOP'}}
        footer={[
          <Button key="submit" type="primary" style={{fontFamily:'DOHCOOP'}} onClick={handleOk}>
            ยืนยันตัวเลือกของฉัน
          </Button>,
          <Button key="submit" type="primary" style={{fontFamily:'DOHCOOP'}} onClick={handleAccept}>
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
});

export default CookieConsent;
