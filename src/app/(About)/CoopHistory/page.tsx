import { Metadata } from "next";
import styles from './CoopHistory.module.css';

export const metadata: Metadata = {
  title: "ประวัติสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด | ประวัติความเป็นมา",
  description: "ประวัติความเป็นมาของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด จัดตั้งเมื่อปี 2520 โดยคณะผู้ริเริ่ม 10 คน เพื่อส่งเสริมการออมทรัพย์และช่วยเหลือสมาชิก",
  keywords: ["ประวัติสหกรณ์", "สหกรณ์ออมทรัพย์กรมทางหลวง", "ประวัติความเป็นมา", "จัดตั้งสหกรณ์", "2520", "คณะผู้ริเริ่ม"],
  authors: [{ name: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด" }],
  openGraph: {
    title: "ประวัติสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    description: "ประวัติความเป็นมาของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด จัดตั้งเมื่อปี 2520",
    type: "website",
    locale: "th_TH",
    siteName: "สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  },
  twitter: {
    card: "summary",
    title: "ประวัติสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
    description: "ประวัติความเป็นมาของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function CoopHistory() {
    return (
      <main role="main" aria-label="ประวัติสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด">
        <section 
          className={styles.section} 
          aria-label="ประวัติและความเป็นมาของสหกรณ์"
          aria-describedby="history-description"
        >
          <div id="history-description" className="sr-only">
            หน้านี้แสดงประวัติความเป็นมาของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด ตั้งแต่การก่อตั้งในปี 2520 จนถึงปัจจุบัน
          </div>
          <article className={`${styles.container} ${styles.historyContainer}`}>
            <header className={styles.header}>
              <h1 
                className={styles.historyTitle}
                role="heading" 
                aria-level={1}
                id="main-title"
                tabIndex={0}
              >
                ประวัติสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
              </h1>
              <div className={styles.historyContent} role="document" aria-labelledby="main-title">
                <section aria-labelledby="founding-section">
                  <h2 id="founding-section" className="sr-only">การก่อตั้งสหกรณ์</h2>
                  <p className={`${styles.lead} ${styles.indentText} ${styles.responsiveText}`}>
                    เกิดจากคณะผู้ริเริ่มจำนวน 10 คน
                    ได้แก่ นายอนันต์ รัศมี, นายแพทย์ยิ่งยศ จันทรางศุ, นายพะเยาว์
                    มีศิลป์, นายสุวิทย์ ยิ้มละมัย, นายยอดยิ่ง ชินนิวัฒน์, นายสมหมาย
                    โกวิทย์, นางอุไร ทองอ่อน, นายสุพล แช่มจันทร์, นายวินัย สันสน
                    และนายดำรง นาคะรัตน์
                    มีความเห็นร่วมกันตามแนวทางของสหกรณ์ออมทรัพย์
                    โดยข้าราชการและลูกจ้างประจำกรมทางหลวง จำนวน 256 คน
                    ได้ดำเนินการจัดตั้งสหกรณ์ออมทรัพย์เพื่อส่งเสริมการออมทรัพย์ในหมู่สมาชิกและช่วยให้สมาชิกได้รับเงินกู้ตามความต้องการอันจำเป็น
                    ได้ประชุมใหญ่ผู้เข้าชื่อจดทะเบียนสหกรณ์เมื่อวันที่ 28 เมษายน
                    2520 มีมติให้ดำเนินการขอจดทะเบียนต่อนายทะเบียนสหกรณ์
                    ซึ่งนายทะเบียนสหกรณ์ได้รับจดทะเบียนสหกรณ์ออมทรัพย์กรมทางหลวง
                    จำกัด เมื่อวันที่ 30 พฤษภาคม 2520 เลขทะเบียนที่ กพธ.26/2520
                  </p>
                </section>

                <section aria-labelledby="early-operations-section">
                  <h2 id="early-operations-section" className="sr-only">การเริ่มต้นดำเนินการ</h2>
                  <p className={`${styles.lead} ${styles.indentText} ${styles.responsiveText}`}>
                    ต่อมาคณะผู้จัดตั้งสหกรณ์ทำหน้าที่คณะกรรมการดำเนินการสหกรณ์
                    ได้ประชุม 2 ครั้ง ครั้งแรกเมื่อวันที่ 3 สิงหาคม 2520 และครั้งที่
                    2 เมื่อวันที่ 19 สิงหาคม 2520
                    เพื่อรับทราบเรื่องการจดทะเบียนพิจารณากำหนดตราเครื่องหมายสหกรณ์
                    (รูปตราเครื่องหมายกรมทางหลวงและมีอักษรว่า
                    &ldquo;สหกรณ์ออมทรัพย์กรมทางหลวง จำกัด สอ.ทล.&rdquo;)
                    พิจารณากำหนดวันเริ่มประกอบธุรกิจ (เริ่มประกอบธุรกิจตั้งแต่วันที่
                    1 ตุลาคม 2520 เป็นต้นไป) พิจารณาแต่งตั้งเจ้าหน้าที่สหกรณ์
                    ทั้งนี้เนื่องจากสหกรณ์ยังไม่มีรายได้พอที่จะจัดจ้างเจ้าหน้าที่ประจำ
                    จึงแต่งตั้งให้เจ้าหน้าที่สังกัดกรมทางหลวง
                    (ผู้ซึ่งได้รับแต่งตั้งตามมติคณะกรรมการดำเนินการ) จำนวน 5 คน
                    ช่วยปฏิบัติงาน ได้แก่
                  </p>
                </section>

                <section aria-labelledby="first-officers-section">
                  <h2 
                    id="first-officers-section"
                    className={styles.sectionTitle}
                    role="heading" 
                    aria-level={2}
                    tabIndex={0}
                  >
                    เจ้าหน้าที่สหกรณ์ชุดแรก
                  </h2>
                  <ul 
                    className={`${styles.officersList} ${styles.responsiveText}`}
                    role="list"
                    aria-label="รายชื่อเจ้าหน้าที่สหกรณ์ชุดแรก"
                  >
                    <li role="listitem"><strong>นางชิดเชื้อ อาวะกุล</strong> เป็นผู้จัดการ</li>
                    <li role="listitem"><strong>น.ส.รำไพ พันธุ์ประภา</strong> เป็นเจ้าหน้าที่การเงิน</li>
                    <li role="listitem"><strong>น.ส.ฉันทนา ไชยมาศ</strong> เป็นนายทะเบียน</li>
                    <li role="listitem"><strong>นายวินัย สันสน</strong> เป็นเจ้าหน้าที่</li>
                    <li role="listitem"><strong>น.ส.บัวทิพย์ กัมพลาศิริ</strong> เป็นเจ้าหน้าที่</li>
                  </ul>
                </section>

                <section aria-labelledby="operations-start-section">
                  <h2 id="operations-start-section" className="sr-only">การเริ่มดำเนินกิจการ</h2>
                  <p className={`${styles.lead} ${styles.responsiveText}`}>
                    เมื่อวันที่ 29 สิงหาคม 2520 ได้มีการประชุมใหญ่สามัญครั้งแรก
                    และได้เริ่มดำเนินกิจการ
                  </p>
                  <p className={`${styles.lead} ${styles.responsiveText}`}>
                    ตั้งแต่วันที่ 1 ตุลาคม 2520 เป็นต้นมา
                    โดยคณะกรรมการดำเนินการชุดแรก ปี 2520 ได้แก่
                  </p>
                </section>

                <section aria-labelledby="first-board-section">
                  <h2 
                    id="first-board-section"
                    className={styles.sectionTitle}
                    role="heading" 
                    aria-level={2}
                    tabIndex={0}
                  >
                    คณะกรรมการดำเนินการชุดแรก ปี 2520
                  </h2>
                  <ul 
                    className={`${styles.boardList} ${styles.responsiveText}`}
                    role="list"
                    aria-label="รายชื่อคณะกรรมการดำเนินการชุดแรก ปี 2520"
                  >
                    <li role="listitem"><strong>ร.อ.สมสิทธิ์ วุฒิธรเนติรักษ์ ร.น.</strong> ประธานกรรมการ</li>
                    <li role="listitem"><strong>นายอารมณ์ จุฬจัมบก</strong> รองประธานกรรมการ</li>
                    <li role="listitem"><strong>นายเสถียร วงศ์วิเชียร</strong> กรรมการ</li>
                    <li role="listitem"><strong>นางสงวนศรี ปิยางค์สุวรณ</strong> กรรมการ</li>
                    <li role="listitem"><strong>นางชิดเชื้อ อาวะกุล</strong> กรรมการและผู้จัดการ</li>
                    <li role="listitem"><strong>นางลักขณา เขคม</strong> กรรมการและเหรัญญิก</li>
                    <li role="listitem"><strong>นายทวี นพรัตน์</strong> กรรมการ</li>
                    <li role="listitem"><strong>นายมนตรี พงศ์พยัคฆ์</strong> กรรมการ</li>
                    <li role="listitem"><strong>นายวินัย สันสน</strong> กรรมการและเลขานุการ</li>
                  </ul>
                </section>

                <section aria-labelledby="management-philosophy-section">
                  <h2 id="management-philosophy-section" className="sr-only">หลักการบริหารงาน</h2>
                  <p className={`${styles.lead} ${styles.responsiveText}`}>
                    ได้บริหารงานสหกรณ์ร่วมกันด้วยความเป็นผู้มีความรับผิดชอบ
                    มีความรอบรู้ มีจิตใจกว้างขวาง
                    มีเหตุผลโดยคำนึงถึงประโยชน์ของสมาชิกเป็นสำคัญโดยเฉพาะอย่างยิ่ง
                    ประโยชน์สุขของสมาชิกทุกคน ซึ่งสหกรณ์นี้แบ่งสมาชิกได้เป็น 2 กลุ่ม
                    คือ
                  </p>
                </section>
                
                <section aria-labelledby="member-groups-section">
                  <h2 
                    id="member-groups-section"
                    className={styles.sectionTitle}
                    role="heading" 
                    aria-level={2}
                    tabIndex={0}
                  >
                    กลุ่มสมาชิก
                  </h2>
                  <div className={styles.memberGroups} role="list" aria-label="ประเภทกลุ่มสมาชิก">
                    <div className={styles.memberGroup} role="listitem">
                      <h3 className="sr-only">กลุ่มผู้ให้ความช่วยเหลือสหกรณ์</h3>
                      <p className={`${styles.responsiveText} ${styles.memberGroupTitle}`}>
                        1. กลุ่มผู้ให้ความช่วยเหลือสหกรณ์ คือ
                        สมาชิกผู้นำเงินมาฝากสหกรณ์
                        โดยได้รับผลประโยชน์ตอบแทนจากสหกรณ์
                        คืออัตราดอกเบี้ยเงินฝากสูงกว่าธนาคารพาณิชย์
                      </p>
                    </div>
                    <div className={styles.memberGroup} role="listitem">
                      <h3 className="sr-only">กลุ่มผู้ขอกู้เงิน</h3>
                      <p className={`${styles.responsiveText} ${styles.memberGroupTitle}`}>
                        2. กลุ่มผู้ขอกู้เงินเพื่อนำไปบำบัดความเดือดร้อนต่าง ๆ
                        โดยได้รับอัตราดอกเบี้ยเงินกู้ต่ำและมีเงินเฉลี่ยคืน
                      </p>
                    </div>
                  </div>
                </section>
                
                <section aria-labelledby="conclusion-section">
                  <h2 id="conclusion-section" className="sr-only">บทสรุป</h2>
                  <p className={`${styles.lead} ${styles.responsiveText}`} style={{ marginTop: '2rem' }}>
                    การดำเนินการของสหกรณ์ออมทรัพย์กรมทางหลวง จำกัด
                    ได้เจริญก้าวหน้าขึ้นเป็นลำดับมาจนถึงปัจจุบัน
                  </p>
                </section>
              </div>
            </header>
          </article>
        </section>
      </main>
    );

}
