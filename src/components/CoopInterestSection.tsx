"use client";
import React, { useEffect, memo, useRef, useState } from "react";
import { SectionLoading } from "@/components/loading";
import useAsyncOperation from "@/hooks/useAsyncOperation";
import useDateFormatter from "@/hooks/useDateFormatter";
import logger from "@/lib/logger";
import styles from "./CoopInterestSection.module.css";

interface Interest {
  Id: number;
  InterestType: string;
  Name: string;
  InterestDate: string;
  Conditions: string;
  InterestRate: string;
  InteresrRateDual: string;
}

// Simple in-memory cache for interest data
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let interestCache: {
  data: Interest[] | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CoopInterestSection: React.FC = memo(function CoopInterestSection() {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const lastRequestTime = useRef(0);
  const [cacheUsed, setCacheUsed] = useState(false);

  // Use date formatter hook
  const { formatThaiFullDate } = useDateFormatter({
    defaultFormat: 'thai-full',
    useBuddhistEra: true
  });

  const fetchInterestData = async (): Promise<Interest[]> => {
    if (!API) {
      throw new Error("API configuration is missing");
    }

    // Check cache first
    const now = Date.now();
    if (interestCache.data && (now - interestCache.timestamp) < CACHE_DURATION) {
      logger.info('Using cached interest data');
      setCacheUsed(true);
      return interestCache.data;
    }

    // Implement request throttling (minimum 3 seconds for 429 prevention)
    const timeSinceLastRequest = now - lastRequestTime.current;
    if (timeSinceLastRequest < 3000) {
      const delay = 3000 - timeSinceLastRequest;
      logger.info(`Throttling request, waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    lastRequestTime.current = Date.now();
    setCacheUsed(false);

    const response = await fetch(`${API}/Interest`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("กำลังโหลดข้อมูลหนักเกินไป กรุณารอสักครู่และลองใหม่อีกครั้ง");
      }
      throw new Error(`Failed to fetch interest data: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Handle the API response structure: responseData.data.data or responseData.data or responseData
    let interestArray: Interest[] = [];
    
    if (responseData.success && responseData.data) {
      // Handle new API response format: { success: true, data: [...], message: "..." }
      interestArray = Array.isArray(responseData.data) ? responseData.data : [];
    } else if (Array.isArray(responseData.data)) {
      // Handle pagination response: { data: [...], page: 1, total: 10 }
      interestArray = responseData.data;
    } else if (Array.isArray(responseData)) {
      // Handle direct array response
      interestArray = responseData;
    } else {
      // Log the actual response to help debug
      logger.warn('Unexpected API response format:', responseData);
      throw new Error("Invalid data format received from API");
    }
    
    // Cache the result
    interestCache = {
      data: interestArray,
      timestamp: Date.now()
    };
    
    return interestArray;
  };

  const { data: interestData, loading, error, execute } = useAsyncOperation(
    fetchInterestData,
    {
      showErrorMessage: false, // We'll handle error display manually
      errorMessage: "ไม่สามารถโหลดข้อมูลอัตราดอกเบี้ยได้ กรุณาลองใหม่อีกครั้ง"
    }
  );

  const hasInitialized = useRef(false);
  
  useEffect(() => {
    // Only execute once on component mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="col-lg-4">
        <SectionLoading tip={cacheUsed ? "กำลังโหลดข้อมูลจากแคช..." : "กำลังโหลดข้อมูลดอกเบี้ย..."} />
      </div>
    );
  }

  if (error) {
    const isRateLimitError = error.includes('กำลังโหลดข้อมูลหนักเกินไป') || error.includes('429');
    
    return (
      <div className="col-lg-4">
        <div className={`alert ${isRateLimitError ? 'alert-warning' : 'alert-danger'}`} role="alert">
          <h6>{isRateLimitError ? 'กำลังโหลดข้อมูลหนักเกินไป' : 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}</h6>
          <p className="mb-2">{isRateLimitError ? error : 'กรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่'}</p>
          <button 
            className={`btn btn-sm ${isRateLimitError ? 'btn-outline-warning' : 'btn-outline-danger'}`}
            onClick={() => {
              // Reset the initialization flag to allow retry
              hasInitialized.current = false;
              setTimeout(() => {
                hasInitialized.current = true; // Mark as initialized before retry
                execute();
              }, isRateLimitError ? 5000 : 2000);  // Longer delay for 429 errors
            }}
          >
            {isRateLimitError ? 'รอ 3 วินาที แล้วลองใหม่' : 'ลองใหม่อีกครั้ง'}
          </button>
        </div>
      </div>
    );
  }

  if (!interestData || interestData.length === 0) {
    return (
      <div className="col-lg-4">
        <div className="alert alert-info" role="alert">
          <h6>ไม่มีข้อมูลอัตราดอกเบี้ย</h6>
          <p className="mb-2">ขณะนี้ยังไม่มีข้อมูลอัตราดอกเบี้ย</p>
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={() => execute()}
          >
            รีเฟรช
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-4">
      {/* ตารางอัตราดอกเบี้ยเงินฝาก */}
      <div className="row gy-5 align-items-stretch mb-4">
        <div className={`bg-light py-4 px-3 ${styles.interestCard}`} style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h4 className="text-black">อัตราดอกเบี้ยเงินฝาก</h4>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h4 className="text-black">
              เริ่ม&nbsp;
              {interestData.length > 0
                ? formatThaiFullDate(interestData[0].InterestDate)
                : "N/A"}
            </h4>
          </div>
          <div className={`table-responsive ${styles.tableResponsive}`}>
            <table className="table mb-0">
              <tbody className="text-sm">
                <tr>
                  <th style={{ position: "relative" }}>
                    <span className="d-block py-1 fw-normal">
                      <b>
                        <h5 className="text-black">ประเภทเงินฝาก</h5>
                      </b>
                    </span>
                  </th>
                  <th style={{ position: "relative" }}>
                    <span className="d-block py-1 fw-normal text-end">
                      <b>
                        <h5 className="text-black">ดอกเบี้ย</h5>
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
                        <th
                          className="text-muted"
                          style={{ fontSize: "17px", position: "relative" }}
                        >
                          <span className="d-block py-1 fw-normal">
                            {interests.Name}
                            {interests.Conditions &&
                              interests.Conditions.trim() !== "" && <br />}
                            {interests.Conditions}
                            {isDeposit && (
                              <div
                                className="ribbon2 flash"
                                style={{
                                  display: "inline-block",
                                  marginLeft: "10px",
                                }}
                              >
                                NEW
                              </div>
                            )}
                          </span>
                        </th>
                        <th style={{ position: "relative" }}>
                          <span
                            className="d-block py-1 fw-normal text-end"
                            style={{ fontSize: "17px" }}
                          >
                            {interests.InterestRate}
                          </span>
                        </th>
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

      {/* ตารางอัตราดอกเบี้ยเงินกู้ */}
      <div className="row gy-5 align-items-stretch">
        <div
          className={`bg-light py-4 px-3 ${styles.interestCard}`}
          style={{ position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h4 className="text-black">อัตราดอกเบี้ยเงินกู้</h4>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h4 className="text-black">
              เริ่ม&nbsp;
              {interestData.length > 0
                ? formatThaiFullDate(interestData[0].InterestDate)
                : "N/A"}
            </h4>
          </div>
          <div className={`table-responsive ${styles.tableResponsive}`}>
            <table className="table mb-0">
              <tbody className="text-sm">
                <tr>
                  <th>
                    <span className="d-block py-1 fw-normal">
                      <b>
                        <h5 className="text-black">ประเภทเงินกู้</h5>
                      </b>
                    </span>
                  </th>
                  <th>
                    <span className="d-block py-1 fw-normal text-end">
                      <b>
                        <h5 className="text-black">ดอกเบี้ย</h5>
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
                        <th
                          className="text-muted"
                          style={{ fontSize: "17px", position: "relative" }}
                        >
                          <span className="d-block py-1 fw-normal">
                            {interests.Name}
                            {interests.Conditions &&
                              interests.Conditions.trim() !== "" && <br />}
                            {interests.Conditions}
                            {isEmergencyLoan && (
                              <div
                                className="ribbon2 flash"
                                style={{
                                  display: "inline-block",
                                  marginLeft: "10px",
                                }}
                              >
                                NEW
                              </div>
                            )}
                          </span>
                        </th>
                        <th>
                          <span
                            className="d-block py-1 fw-normal text-end"
                            style={{ fontSize: "17px" }}
                          >
                            {interests.InterestRate}
                            <br />
                            {interests.InteresrRateDual}
                          </span>
                        </th>
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
  );
});

export default CoopInterestSection;