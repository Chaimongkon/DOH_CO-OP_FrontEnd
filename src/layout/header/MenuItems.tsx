// layout/header/MenuItems.tsx
export interface SectionType {
  subheader?: string;
  items?: {
    title: string;
    href: string;
  }[];
  imageSrc?: string; // Optional property for image source
}

export interface ColumnType {
  sections: SectionType[];
}

export interface MenuItemType {
  navlabel: boolean;
  title: string;
  dropdown?: boolean;
  columns?: ColumnType[];
  href?: string;
}

const MenuItems: MenuItemType[] = [
  {
    navlabel: false,
    title: "เกี่ยวกับสหกรณ์ฯ",
    dropdown: true,
    columns: [
      {
        sections: [
          {
            imageSrc: "/image/ImageMenu/template-easy-code2.png", // Image source for this section
          },
        ],
      },
      {
        sections: [
          {
            subheader: "รู้จักสหกรณ์ฯ",
            items: [
              {
                title: "ประวัติสหกรณ์ฯ",
                href: "/CoopHistory",
              },
              {
                title: "ค่านิยม วิสัยทัศน์และพันธกิจ",
                href: "/Vision",
              },
              {
                title: "จรรยาบรรณคณะกรมมการดำเนินการ",
                href: "/BoardEthics",
              },
              {
                title: "จรรยาบรรณเจ้าหน้าที่",
                href: "/OfficerEthics",
              },
              {
                title: "นโยบายสหกรณ์",
                href: "/Policy",
              },
              {
                title: "สารจากประธาน สอ.ทล.",
                href: "/MessageChairman",
              },
            ],
          },
        ],
      },
      {
        sections: [
          {
            subheader: "ผู้บริหารและฝ่ายจัดการ",
            items: [
              {
                title: "คณะกรรมการดำเนินการ",
                href: "/Board",
              },
              {
                title: "ผู้ตรวจสอบบัญชีและผู้ตรวจสอบกิจการ",
                href: "/Auditor",
              },
              {
                title: "ผู้จัดการใหญ่และรองผู้จัดการฯ",
                href: "/Executive",
              },
              {
                title: "ฝ่ายสินเชื่อ",
                href: "/Credit",
              },
              {
                title: "ฝ่ายการเงิน",
                href: "/Financel",
              },
              {
                title: "ฝ่ายหารายได้และสมาชิกสัมพันธ์",
                href: "/MemberRelations",
              },
              {
                title: "ฝ่ายทะเบียนหุ้น และบัญชีเงินกู้",
                href: "/ShareRegistration",
              },
              {
                title: "ฝ่ายบริหารทั่วไป",
                href: "/General",
              },
              {
                title: "ฝ่ายบัญชี",
                href: "/Account",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    navlabel: false,
    title: "บริการ",
    dropdown: true,
    columns: [
      {
        sections: [
          {
            imageSrc: "/image/ImageMenu/template-homepage3.png", // Image source for this section
          },
        ],
      },
      {
        sections: [
          {
            subheader: "สมัครสมาชิก",
            items: [
              {
                title: "สมาชิกสามัญประเภท ก",
                href: "/MemberG",
              },
              {
                title: "สมาชิกสามัญประเภท ข",
                href: "/MemberK",
              },
              {
                title: "สมาชิกสมทบ",
                href: "/MemberS",
              },
            ],
          },
          {
            subheader: "สวัสดิการ",
            items: [
              {
                title: "สวัสดิการสมาชิกสามัญประเภท ก",
                href: "/WelfareG",
              },
              {
                title: "สวัสดิการสมาชิกสามัญประเภท ข",
                href: "/WelfareK",
              },
              {
                title: "สวัสดิการสมาชิกสมทบ",
                href: "/WelfareS",
              },
            ],
          },
          {
            subheader: "บริการทำประกัน",
            items: [
              {
                title: "บริการทำประกันภัยรถยนต์",
                href: "/Insurance",
              },
              {
                title: "บริการทำ พรบ. รถยนต์",
                href: "/Act",
              },
            ],
          },
        ],
      },
      {
        sections: [
          {
            subheader: "บริการเงินฝาก",
            items: [
              {
                title: "ถอนเงิน ผ่านช่องทาง Online",
                href: "/WithdrawMoney",
              },
              {
                title: "เงินฝากออมทรัพย์",
                href: "/Saving",
              },
              {
                title: "เงินฝากออมทรัพย์ยั่งยืน",
                href: "/DepositDurable",
              },
              {
                title: "เงินฝากออมทรัพย์พิเศษ",
                href: "/SpecialSaving",
              },
              {
                title: "เงินฝากออมทรัพย์พิเศษเกษียณสุข",
                href: "/DepositRetire",
              },
              {
                title: "เงินฝากประจำ 3 6 12 เดือน",
                href: "/TimeDeposit3612",
              },
              {
                title: "เงินฝากประจำ 24 เดือน",
                href: "/TimeDeposit24",
              },
            ],
          },
          {
            subheader: "บริการเงินกู้",
            items: [
              {
                title: "เงินกู้ฉุกเฉิน",
                href: "/EmergencyLoan",
              },
              {
                title: "เงินกู้สามัญ",
                href: "/OrdinaryLoan",
              },
              {
                title: "เงินกู้พิเศษ",
                href: "/SpecialLoan",
              },
            ],
          },
        ],
      },
      {
        sections: [
          {
            subheader: "ดาวน์โหลดแบบฟอร์ม",
            items: [
              {
                title: "แบบฟอร์มขอรับสวัสดิการ",
                href: "/Welfare",
              },
              {
                title: "แบบฟอร์มสมัครสมาชิก",
                href: "/Membership",
              },
              {
                title: "แบบฟอร์มเงินฝาก-ถอน",
                href: "/DepositWithdraw",
              },
              {
                title: "แบบฟอร์มเกี่ยวกับเงินกู้",
                href: "/Loan",
              },
              {
                title: "แบบฟอร์มหนังสือร้องทุกข์ / ร้องเรียน",
                href: "/Appeal",
              },
              {
                title: "หนังสือแต่งตั้งผู้รับโอนประโยชน์",
                href: "/Beneficiary",
              },
              {
                title: "ใบคำขอเอาประกันภัยกลุ่มสหกรณ์",
                href: "/Insurances",
              },
              {
                title: "แบบฟอร์มอื่น ๆ",
                href: "/Other",
              },
            ],
          },
          {
            subheader: "บริการสหกรณ์อิเล็กทรอนิกส์",
            items: [
              {
                title: "Application DohSaving",
                href: "/AppDetail",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    navlabel: false,
    title: "ผลการดำเนินการ",
    dropdown: true,
    columns: [
      {
        sections: [
          {
            imageSrc: "/image/ImageMenu/template-homepage4.png", // Image source for this section
          },
        ],
      },
      {
        sections: [
          {
            subheader: "งบแสดงฐานะการเงินอย่างย่อ",
            items: [
              {
                title: "รายการย่อแสดงสินทรัพย์และหนี้สิน",
                href: "/AssetsAndLiabilities",
              },             
            ],
          },
          {
            subheader: "รายงานกิจการประจำปี",
            items: [
              {
                title: "เอกสารประกอบการประชุมใหญ่",
                href: "/WelfareG",
              },
            ],
          },
        ],
       
      },
    ],
  },
  {
    navlabel: false,
    title: "ข้อบังคับ ระเบียบ ประกาศ",
    dropdown: true,
    columns: [
      {
        sections: [
          {
            imageSrc: "/image/ImageMenu/template.png", // Image source for this section
          },
        ],
      },
      {
        sections: [
          {
            subheader: "ข้อบังคับ ระเบียบ ประกาศ",
            items: [
              {
                title: "ข้อบังคับ",
                href: "/Abont/CoopHistory",
              },
              {
                title: "ระเบียบ",
                href: "/Abont/Vision",
              },
              {
                title: "ประกาศ",
                href: "/BoardEthics",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    navlabel: false,
    title: "ติดต่อเรา",
    href: "/Contact",
    dropdown: false,
  },

];

export default MenuItems;
