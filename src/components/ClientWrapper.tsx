// File: ClientWrapper.tsx
"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from '@/layout/header/Header';
import SubHeader from '@/layout/header/SubHeader';

interface ClientWrapperProps {
  children: React.ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  const pathname = usePathname();

  // STATIC Route to menuName mapping - NO state updates
  const routeMenuMap = useMemo(() => ({
    // Home
    '/': 'Home',
    
    // About Section (เกี่ยวกับสหกรณ์ฯ)
    '/CoopHistory': 'ประวัติสหกรณ์ฯ',
    '/Vision': 'ค่านิยม วิสัยทัศน์และพันธกิจ',
    '/BoardEthics': 'จรรยาบรรณคณะกรมมการดำเนินการ',
    '/OfficerEthics': 'จรรยาบรรณเจ้าหน้าที่',
    '/Policy': 'นโยบายสหกรณ์',
    '/MessageChairman': 'สารจากประธาน สอ.ทล.',
    
    // Management Section (ผู้บริหารและฝ่ายจัดการ)
    '/Board': 'คณะกรรมการดำเนินการ',
    '/Auditor': 'ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ',
    '/Executive': 'ผู้จัดการใหญ่และรองผู้จัดการฯ',
    '/Credit': 'ฝ่ายสินเชื่อ',
    '/Financel': 'ฝ่ายการเงินและการลงทุน',
    '/MemberRelations': 'ฝ่ายสมาชิกสัมพันธ์และสวัสดิการ',
    '/ShareRegistration': 'ฝ่ายทะเบียนหุ้นและติดตามหนี้สิน',
    '/General': 'ฝ่ายบริหารทั่วไป',
    '/Account': 'ฝ่ายบัญชี',
    '/Information': 'ฝ่ายสารสนเทศ',
    
    // Membership Section
    '/MemberTypeG': 'สมาชิกสามัญประเภท ก',
    '/MemberTypeB': 'สมาชิกสามัญประเภท ข',
    '/MemberTypeS': 'สมาชิกสมทบ',
    
    // Welfare Section
    '/WelfareTypeG': 'สวัสดิการสมาชิกสามัญประเภท ก',
    '/WelfareTypeB': 'สวัสดิการสมาชิกสามัญประเภท ข',
    '/WelfareTypeS': 'สวัสดิการสมาชิกสมทบ',
    
    // Insurance Section
    '/CarInsurance': 'บริการทำประกันภัยรถยนต์',
    '/Act': 'บริการทำ พรบ. รถยนต์',
    
    // Banking Services
    '/WithdrawMoney': 'ถอนเงิน ผ่านช่องทาง Online',
    '/Saving': 'เงินฝากออมทรัพย์',
    '/DepositDurable': 'เงินฝากออมทรัพย์ยั่งยืน',
    '/SpecialSaving': 'เงินฝากออมทรัพย์พิเศษ',
    '/DepositRetire': 'เงินฝากออมทรัพย์พิเศษเกษียณสุข',
    '/TimeDeposit24': 'เงินฝากประจำ 24 เดือน',
    
    // Loan Services
    '/EmergencyLoan': 'เงินกู้ฉุกเฉิน',
    '/OrdinaryLoan': 'เงินกู้สามัญ',
    '/SpecialLoan': 'เงินกู้พิเศษ',
    
    // Forms Section
    '/Welfare': 'แบบฟอร์มขอรับสวัสดิการ',
    '/Membership': 'แบบฟอร์มสมัครสมาชิก',
    '/DepositWithdraw': 'แบบฟอร์มเงินฝาก-ถอน',
    '/Loan': 'แบบฟอร์มเกี่ยวกับเงินกู้',
    '/Appeal': 'แบบฟอร์มหนังสือร้องทุกข์ / ร้องเรียน',
    '/Beneficiary': 'หนังสือแต่งตั้งผู้รับโอนประโยชน์',
    '/Insurances': 'ใบคำขอเอาประกันภัยกลุ่มสหกรณ์',
    '/Other': 'แบบฟอร์มอื่น ๆ',
    
    // App Section
    '/DetailApp': 'Application DohSaving',
    
    // Reports Section
    '/AssetsAndLiabilities': 'รายการย่อแสดงสินทรัพย์และหนี้สิน',
    '/BusinessReport': 'เอกสารประกอบการประชุมใหญ่',
    
    // Legal Documents
    '/Statute': 'ข้อบังคับ',
    '/Regularity': 'ระเบียบ',
    '/Declare': 'ประกาศ',
    
    // Contact
    '/Contact': 'ติดต่อเรา',
    
    // Election Section
    '/Election': 'ตรวจสอบรายชื่อผู้มีสิทธิเลือกตั้ง',
    '/ElectionDepartment': 'รายชื่อเลือกตั้งตามสังกัด',
    '/ElectionVideos': 'วิดีโอแนะผู้สมัครกรรมการดำเนินการ',
    
    // Common pages
    '/BankAccount': 'บัญชีธนาคาร',
    '/Complaint': 'ข้อร้องเรียน',
    '/Questions': 'กระดานถาม-ตอบ (Q&A)',
    '/NewsAll': 'ข่าวสารทั้งหมด',
    '/DownloadApp': 'ดาวน์โหลดแอปพลิเคชัน',
    '/AppDetails': 'รายละเอียดแอปพลิเคชัน',
    '/ShowAllPhotos': 'รูปภาพกิจกรรม',
    '/AlbumPhotosOverAll': 'ภาพกิจกรรมสหกรณ์ทั้งหมด',
    '/Interest': 'ความสนใจ',
    '/CoopMiddle': 'กิจกรรมสหกรณ์'
  }), []);

  // Simple localStorage read without reactive hook
  const [menuNameFromStorage, setMenuNameFromStorage] = useState<string>('');
  
  // Read from localStorage on pathname change and listen for storage changes
  useEffect(() => {
    const updateMenuName = () => {
      const stored = localStorage.getItem('menuName') || '';
      setMenuNameFromStorage(stored);
    };
    
    // Update on pathname change
    updateMenuName();
    
    // Listen for storage changes (for ShowAllPhotos dynamic updates)
    window.addEventListener('storage', updateMenuName);
    
    // Custom event for same-tab updates
    window.addEventListener('menuNameChanged', updateMenuName);
    
    return () => {
      window.removeEventListener('storage', updateMenuName);
      window.removeEventListener('menuNameChanged', updateMenuName);
    };
  }, [pathname]);
  
  // STATIC displayMenuName based ONLY on pathname - with dynamic override for specific routes
  const displayMenuName = useMemo(() => {
    // Use dynamic title for routes that support dynamic menu names
    const dynamicRoutes = ['/ShowAllPhotos/', '/Install', '/Register', '/ForgotPassword', '/TradeHistory', '/Dividend', '/DepositAccount', '/CooperativeAccount', '/AddBankAccount'];
    
    // Check if current path should use dynamic menu name
    const shouldUseDynamic = dynamicRoutes.some(route => 
      pathname.startsWith(route) || pathname === route
    );
    
    if (shouldUseDynamic && menuNameFromStorage && menuNameFromStorage !== 'Home') {
      return menuNameFromStorage;
    }
    
    return routeMenuMap[pathname as keyof typeof routeMenuMap] || 'Home';
  }, [pathname, routeMenuMap, menuNameFromStorage]);

  // NO-OP setMenuName for Header - disabled localStorage updates
  const noOpSetMenuName = useCallback(() => {
    // Silent no-op - do nothing
  }, []);

  // Define the routes where SubHeader should not be shown
  const hideSubHeaderRoutes = ["/"];

  return (
    <>
      <Header setMenuName={noOpSetMenuName} />
      {!hideSubHeaderRoutes.includes(pathname) && (
        <SubHeader menuName={displayMenuName} />
      )}
      {children}
    </>
  );
};

export default ClientWrapper;
