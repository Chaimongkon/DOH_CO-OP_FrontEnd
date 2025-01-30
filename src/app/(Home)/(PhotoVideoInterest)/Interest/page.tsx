"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

// Define the Interest interface
interface Interest {
  Id: number;
  InterestType: string;
  Name: string;
  InterestDate: string; // Expecting a string in ISO format
  Conditions: string;
  InterestRate: string;
  InteresrRateDual: string;
}

// Utility function to format the date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const InterestPage: React.FC = () => {
  const [interestData, setInterestData] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/Interest`);
        setInterestData(res.data);
      } catch (err) {
        console.error("Error fetching interest data:", err);
        setError("Failed to fetch interest data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="col-lg-41">
        <div className="row gy-5 align-items-stretch">
          <div className="bg-light py-4 px-33" style={{ position: "relative" }}>
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
                  ? formatDate(interestData[0].InterestDate)
                  : "N/A"}
              </h4>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <tbody className="text-sm">
                  <tr>
                    <th style={{ position: "relative" }}>
                      {" "}
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
                            {" "}
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
                            {" "}
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
        <div className="row gy-5 align-items-stretch">
          <div
            className="bg-light py-44 px-33"
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
                  ? formatDate(interestData[0].InterestDate)
                  : "N/A"}
              </h4>
            </div>
            <div className="table-responsive">
              <table className="table mb-0">
                <tbody className="text-sm">
                  <tr>
                    <th>
                      {" "}
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
                            {" "}
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
                            {" "}
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
    </>
  );
};

export default InterestPage;
