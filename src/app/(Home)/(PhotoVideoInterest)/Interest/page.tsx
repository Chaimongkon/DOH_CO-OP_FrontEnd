"use client";
import React, { useState, useEffect, useCallback } from "react";
import { LottieSectionLoading } from "@/components/LottieLoading";
import { message } from "antd";
import logger from "@/lib/logger";
import styles from "./Interest.module.css";
import { useApiConfig } from "@/hooks/useApiConfig";
import useDateFormatter from "@/hooks/useDateFormatter";

// Define the Interest interface
interface Interest {
  Id: number;
  InterestType: string;
  Name: string;
  InterestDate: string;
  Conditions: string;
  InterestRate: string | number;
  InteresrRateDual: string | number;
}

// Utility function to format the date in Thai format

const InterestPage: React.FC = () => {
  const [interestData, setInterestData] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { API } = useApiConfig();
  
  // Use date formatter hook
  const { formatThaiWithPrefix } = useDateFormatter({
    defaultFormat: 'thai-with-prefix',
    useBuddhistEra: true
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${API}/Interest`);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      logger.info("Interest data fetched successfully");
      // Handle API response structure
      const interestItems = data.data || data;
      logger.info(`Fetched ${interestItems?.length || 0} interest items`);
      setInterestData(interestItems);
    } catch (error) {
      logger.error("Failed to fetch interest data:", error);
      setError("ไม่สามารถโหลดข้อมูลอัตราดอกเบี้ยได้");
      message.error("ไม่สามารถโหลดข้อมูลอัตราดอกเบี้ยได้");
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LottieSectionLoading tip="กำลังโหลดข้อมูลอัตราดอกเบี้ย..." />;
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center" role="alert">
          <h4>เกิดข้อผิดพลาด</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchData();
            }}
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-12">
          <div className="row gy-4 align-items-stretch">
            {/* Deposit Interest Card */}
            <div className="col-lg-6">
              <div className={`bg-light ${styles.interestCard}`}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>อัตราดอกเบี้ยเงินฝาก</h4>
                  <h5 className={styles.cardSubtitle}>
                    เริ่ม&nbsp;
                    {interestData.length > 0
                      ? formatThaiWithPrefix(interestData[0].InterestDate)
                      : "N/A"}
                  </h5>
                </div>
                <div className={`table-responsive ${styles.interestTable}`}>
                  <table className="table mb-0">
                    <tbody className="text-sm">
                      <tr>
                        <th>
                          <span className="d-block py-1 fw-normal">
                            <b>
                              <h6 className="text-dark mb-0">ประเภทเงินฝาก</h6>
                            </b>
                          </span>
                        </th>
                        <th>
                          <span className="d-block py-1 fw-normal text-end">
                            <b>
                              <h6 className="text-dark mb-0">ดอกเบี้ย</h6>
                            </b>
                          </span>
                        </th>
                      </tr>
                      {interestData.map((interests, i) => {
                        if (interests.InterestType === "1") {
                          const isDeposit =
                            (interests.Name &&
                              interests.Name.includes(
                                "ออมทรัพย์ยั่งยืน (ไม่เสียภาษี)"
                              )) ||
                            (interests.Conditions &&
                              interests.Conditions.includes(
                                "ออมทรัพย์ยั่งยืน (ไม่เสียภาษี)"
                              ));
                          return (
                            <tr key={i}>
                              <td className="text-muted">
                                <span className="d-block py-1 fw-normal">
                                  {interests.Name}
                                  {interests.Conditions &&
                                    interests.Conditions.trim() !== "" && <br />}
                                  {interests.Conditions}
                                  {isDeposit && (
                                    <span className={styles.newRibbon}>
                                      NEW
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>
                                <span className="d-block py-1 fw-normal text-end">
                                  {interests.InterestRate || '-'}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Loan Interest Card */}
            <div className="col-lg-6">
              <div className={`bg-light ${styles.interestCard}`}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>อัตราดอกเบี้ยเงินกู้</h4>
                  <h5 className={styles.cardSubtitle}>
                    เริ่ม&nbsp;
                    {interestData.length > 0
                      ? formatThaiWithPrefix(interestData[0].InterestDate)
                      : "N/A"}
                  </h5>
                </div>
                <div className={`table-responsive ${styles.interestTable}`}>
                  <table className="table mb-0">
                    <tbody className="text-sm">
                      <tr>
                        <th>
                          <span className="d-block py-1 fw-normal">
                            <b>
                              <h6 className="text-dark mb-0">ประเภทเงินกู้</h6>
                            </b>
                          </span>
                        </th>
                        <th>
                          <span className="d-block py-1 fw-normal text-end">
                            <b>
                              <h6 className="text-dark mb-0">ดอกเบี้ย</h6>
                            </b>
                          </span>
                        </th>
                      </tr>
                      {interestData.map((interests, i) => {
                        if (interests.InterestType === "2") {
                          const isEmergencyLoan =
                            (interests.Name &&
                              interests.Name.includes(
                                "กู้สามัญเพื่อชำระหนี้บัตรเคดิต หรือ สินเชื่อส่วนบุคคล  (ไม่มีเฉลี่ยคืน)"
                              )) ||
                            (interests.Conditions &&
                              interests.Conditions.includes(
                                "กู้สามัญเพื่อชำระหนี้บัตรเคดิต หรือ สินเชื่อส่วนบุคคล  (ไม่มีเฉลี่ยคืน)"
                              ));
                          return (
                            <tr key={i}>
                              <td className="text-muted">
                                <span className="d-block py-1 fw-normal">
                                  {interests.Name}
                                  {interests.Conditions &&
                                    interests.Conditions.trim() !== "" && <br />}
                                  {interests.Conditions}
                                  {isEmergencyLoan && (
                                    <span className={styles.newRibbon}>
                                      NEW
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td>
                                <span className="d-block py-1 fw-normal text-end">
                                  {interests.InterestRate || '-'}
                                  {interests.InteresrRateDual && (
                                    <>
                                      <br />
                                      {interests.InteresrRateDual}
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestPage;